import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import { User, Post, Chat } from "./models.js";
import bcrypt from "bcrypt";
import { Server } from "socket.io";
import http from "http";
import axios from "axios";
import { addFriend, removeFriend, friendRequest } from "./utils/friendsOperations.js";
import { likePost, unlikePost, commentPost, likeComment } from "./utils/postsOperations.js";

const app = express();
const server = http.createServer(app);
const onlineUsers = {};


const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
let db;
const start = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://naor223:Naor6579080@cluster0.bxyka0c.mongodb.net/?retryWrites=true&w=majority"
    );
    db = mongoose.connection;
    server.listen(3001, () => console.log("Server running on port 3001"));
  } catch (e) {
    console.log("Could not connect to MongoDB");
  }
};
start();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  const socketId = socket.id;
  onlineUsers[userId] = socketId;
  const userFriends = await getFriends(userId);
  if (userFriends) {
    const friendIds = userFriends.map((friend) => friend._id);
    friendIds.forEach((friendId) => {
      if (onlineUsers[friendId]) {
        const recipientSocketId = onlineUsers[friendId];
        io.to(recipientSocketId).emit("online", userId);
      }
    });
  }
  socket.on("disconnect", () => {
    const socketId = socket.id;
    const userId = Object.keys(onlineUsers).find(
      (key) => onlineUsers[key] === socketId
    );
    delete onlineUsers[userId];
    if (userFriends) {
      const friendIds = userFriends.map((friend) => friend._id);
      friendIds.forEach((friendId) => {
        if (onlineUsers[friendId]) {
          const recipientSocketId = onlineUsers[friendId];
          io.to(recipientSocketId).emit("offline", userId);
        }
      });
    }
  });

  socket.on("checkOnline", (data) => {
    const friendIds = data;
    const onlineFriends = friendIds.filter((friendId) =>
      onlineUsers[friendId] ? true : false
    );
    io.to(socketId).emit("checkOnline-response", onlineFriends);
  }
  );

  socket.on('like', async (data) => {
    const { userId, postId } = data;
    likePost(postId, userId, io, onlineUsers, null);
  });


  socket.on('unlike', async (data) => {
    const { userId, postId } = data;
    unlikePost(postId, userId, onlineUsers, io, "websocket");
  });

  socket.on('comment', async (data) => {
    const { postId, userId, content, create_at } = data;
    commentPost(postId, userId, content, create_at, io, onlineUsers);
  });

  socket.on('addFriend', async (data) => {
    const { userId, friendId } = data;
    addFriend(userId, friendId, io, onlineUsers, null);
  });


  socket.on('friendRequest', async (data) => {
    const { userId, friendId, notificationId, accept } = data;
    friendRequest(userId, friendId, notificationId, accept, io, onlineUsers, null);
  });


  socket.on('removeFriend', async (data) => {
    const { userId, friendId } = data;
    removeFriend(userId, friendId, io, onlineUsers, null);
  });

  socket.on('likeComment', async (data) => {
    const { userId, postId, comment } = data;
    likeComment(userId, postId, comment, io, onlineUsers, null);
  }

  );


  socket.on('getFriends', async (data) => { // not used yet
    const { user } = data;
    const friends = await getFriends(user);
    const friendsOb = await User.find({ _id: { $in: friends } });
    io.to(onlineUsers[user]).emit('getFriends-response', { success: true, data: friendsOb });
  });



  socket.on('checkChats', async (data) => {

    try {
      const { userId, friendId } = data;
      const chat = await Chat.findOne({
        users: { $all: [userId, friendId] }
      });

      if (chat) {
        await Chat.populate(chat, [
          { path: "users", select: "-password -posts -friends -email" },
        ]);


        io.to(socketId).emit('checkChats-response', { success: true, data: chat });
      } else {

        io.to(socketId).emit('checkChats-response', { success: true, data: null });
      }
    } catch (error) {
      console.error(error);
      io.to(socketId).emit('checkChats-response', { success: false });
    }
  });

  socket.on('sendMessage', async (data) => {
    const { chatId, userId, content, created_at } = data;
    try {
      const msg = {
        chatId: chatId,
        userId: userId,
        content: content,
        created_at: new Date(),
      };
      const chatOb = await Chat.findOneAndUpdate(
        { _id: chatId },
        { $push: { messages: msg } },
        {
          new: true,
          upsert: false,
        }
      );
      const userSocketId = onlineUsers[userId];
      if (userSocketId) {
        io.to(userSocketId).emit('sendMessage-response', { success: true });
      }
      const sentMsg = chatOb.messages[chatOb.messages.length - 1];
      const friendId = chatOb.users.find((user) => user._id.toString() !== userId.toString())._id;
      const friendSocketId = onlineUsers[friendId];
      if (friendSocketId) {
        io.to(friendSocketId).emit('chatMsg', { data: sentMsg, chatId: chatId });
      }
    } catch (error) {
      console.error(error);
      io.to(socketId).emit('sendMessage-response', { success: false });
    }
  });


});



const getGetLocation = async (req) => {
  let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (ipAddress.includes(':') || ipAddress === '127.0.0.1') {
    const res = await axios.get('https://api.ipify.org?format=json');
    ipAddress = res.data.ip;
  }

  const res = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=b4a1acba7eb348ee9397946281bb8f6b&ip=${ipAddress}`);
  const location = res.data;
  const { city, country_name } = location;
  return { city: city, country: country_name };
}

const populateUser = async (userId) => {
  return await User.findById(userId).populate([
    { path: "friends", select: "-password" },
    { path: "posts", select: "-password" },
    {
      path: "notifications.userId",
      select: "-password -posts -friends -email",
    },
  ]);
};

app.post("/seennotifications", async (req, res) => {
  try {
    const { user } = req.body;
    if (!user) {
      return res.status(400).send({ error: "User ID is required." });
    }

    const updateResult = await User.updateOne(
      { _id: user },
      { $set: { "notifications.$[].seen": true } }
    );
    if (updateResult.nModified === 0) {
      return res
        .status(200)
        .send({ message: "No notifications to mark as seen." });
    }
    res
      .status(200)
      .send({ message: "All notifications have been marked as seen." });
  } catch (error) {
    console.error("Error marking notifications as seen:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});
const saltRounds = 12;
app.post(`/register`, async (req, res) => {
  const location = await getGetLocation(req);
  const { email, password, name, address, phone, birthday } = req.body;
  const arr = await User.find({});
  if (arr.find((User) => User.email === email)) {
    return res.status(409).send();
  } else {
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.log(err);
      } else {
        const newUser = {
          name: name,
          email: email,
          password: hash,
          phone: phone,
          address: address,
          birthday: birthday,
          friends: [],
          interests: [],
          location: [],
          country: location.country,
          city: location.city,
          sentfriendRequests: [],
          receivedfriendRequests: [],
          posts: [],
          notifications: [],
          avatar:
            "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp",
        };
        const user = await db.collection("users").insertOne(newUser);
        const { password, ...userWithoutPassword } = newUser;

        const userOb = {
          ...userWithoutPassword,
          _id: user.insertedId,
        };
        return res.status(201).send({ userOb: userOb });
      }
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .populate([
      { path: "friends", select: "-password" },
      {
        path: "notifications.userId",
        select: "-password -posts -friends -email",
      },
    ])
    .then((user) => {
      if (!user) {
        return res.status(401).send("User not found");
      }
      return User.findOne({ email: email })
        .select("password")
        .then((userWithPassword) => {
          return bcrypt
            .compare(password, userWithPassword.password)
            .then((samePassword) => {
              if (!samePassword) {
                return res.status(401).send("Invalid password");
              }
              return res.status(201).send({ userOb: user });
            });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Server error");
    });
});

app.post("/friendrequest", async (req, res) => {
  const { user: userId, friend: friendId, notification: notificationId, accept } = req.body;
  friendRequest(userId, friendId, notificationId, accept, null, null, res);
});

app.post("/addfriend", async (req, res) => {
  const { id: userId, friendId } = req.body;
  addFriend(userId, friendId, null, null, res);
});

app.post("/removefriend", async (req, res) => {
  const { userId, friendId } = req.body;
  removeFriend(userId, friendId, null, null, res);
});

app.get("/getprofile", async (req, res) => {
  const { user } = req.query;

  if (!Array.isArray(user)) {
    const userOb = await populateUser(user);
    return res.status(200).send(userOb);
  } else {
    const userOb = await Promise.all(user.map(async (id) => await populateUser(id)));
    return res.status(200).send(userOb);
  }
});

app.post('/addinterests', async (req, res) => {
  const { userId, interests } = req.body;
  await User.updateOne({ _id: userId }, { $set: { interests: interests } });
  return res.status(201).send();
});


const getFriends = async (userID) => {
  const userOb = await User.find({ _id: userID });
  return userOb[0]?.friends;
};

app.get("/getfriends", async (req, res) => {
  const { user } = req.query;
  const friends = await getFriends(user);
  const friendsOb = await User.find({ _id: { $in: friends } });
  return res.status(200).send(friendsOb);
});


const getFeed = async (user) => {
  const friends = await getFriends(user);
  const friendPosts = await Post.find({ userId: { $in: friends } }).populate([
    { path: "userId", select: "-password -posts -friends -email" },
    { path: "comments.userId", select: "-password -posts -friends -email" },
  ]);
  const myPosts = await Post.find({ userId: user })
    .populate("userId", "-password -posts -friends -email")
    .populate("comments.userId", "-password -posts -friends -email");
  return { friendPosts: friendPosts, myPosts: myPosts };
};

const getSuggestedFriendsByInterests = async (user) => {
  try {

    const userDoc = await User.findOne({ _id: user }).select("interests friends -_id");
    const userInterests = userDoc ? userDoc.interests : [];
    const userFriends = userDoc ? userDoc.friends : [];

    const sameInterests = await User.find({
      _id: { $ne: user, $nin: userFriends },
      interests: { $in: userInterests }
    }).limit(5);

    const suggestedFriends = sameInterests.map(friend => {
      return {
        ...friend.toObject(),
        reason: "interest"
      }
    })

    return suggestedFriends;
  } catch (error) {
    console.error("Error getting suggested friends:", error);
    return [];
  }
};

const getSuggestedFriendsByLocation = async (user) => {
  try {
    const userDoc = await User.findOne({ _id: user }).select("city friends -_id");
    const userCity = userDoc ? userDoc.city : "";
    const userFriends = userDoc ? userDoc.friends : [];

    const sameLocation = await User.find({
      _id: { $ne: user, $nin: userFriends },
      city: userCity
    }).limit(5);
    const suggestedFriends = sameLocation.map(friend => {
      return {
        ...friend.toObject(),
        reason: "location"
      }
    })

    return suggestedFriends;
  } catch (error) {
    console.error("Error getting suggested friends by location:", error);
    return [];
  }
};


const mergeAndRemoveDuplicates = (arr1, arr2) => {
  const seen = new Map();
  return arr1.concat(arr2).filter((item) => {
    const itemId = item._id?.toString();
    return !seen.has(itemId) && seen.set(itemId, true);
  });
}

app.get('/getSuggestedFriends', async (req, res) => {
  const { user } = req.query;
  const suggestedFriendsByInterests = await getSuggestedFriendsByInterests(user);
  const suggestedFriendsByLocation = await getSuggestedFriendsByLocation(user);
  const mergedSuggestedFriends = mergeAndRemoveDuplicates(suggestedFriendsByInterests, suggestedFriendsByLocation);
  return res.status(200).send(mergedSuggestedFriends);
}
);

app.get("/feed", async (req, res) => {
  const { user } = req.query;
  const feed = await getFeed(user)

  return res.status(200).send({ feed: feed });
});

app.post("/uploadpic", async (req, res) => {
  const { base64, id } = req.body;
  await User.updateOne({ _id: id }, { $set: { avatar: base64 } });
});

app.post("/post", async (req, res) => {
  const { user, description } = req.body;
  const userId = new mongoose.Types.ObjectId(user);
  const newPost = {
    userId: userId,
    description: description,
    date: new Date(),
    likes: [],
    comments: [],
  };
  const result = await db.collection("posts").insertOne(newPost);
  const postID = result.insertedId;
  await User.updateOne({ _id: user }, { $push: { posts: postID } });
  return res.status(201).send();
});

app.post("/deletepost", async (req, res) => {
  const { postId, userId } = req.body;
  await Post.deleteOne({ _id: postId });
  await User.updateOne({ _id: userId }, { $pull: { posts: postId } });
  return res.status(201).send();
});

app.post("/deletecomment", async (req, res) => {
  const { commentId, userId, postId } = req.body;
  await Post.updateOne(
    { _id: postId },
    { $pull: { comments: { _id: commentId } } }
  );
  return res.status(201).send();
});

app.post("/comment", async (req, res) => {
  const { postId, userId, content, create_at } = req.body;
  try {
    await commentPost(postId, userId, content, create_at, null, null);
    res.status(201).send({ success: true });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Failed to comment on the post.' });
  }
});
//   const postOb = await Post.findOneAndUpdate(
//     { _id: postId },
//     { $addToSet: { comments: comment } }
//   );
//   const postUser = postOb.userId;
//   if (postUser == userId) {
//     return res.status(201).send();
//   } else {
//     let notification = {
//       userId: userId,
//       text: " commented on your post",
//       date: new Date(),
//       seen: false,
//     };
//     await User.updateOne(
//       { _id: postUser },
//       { $addToSet: { notifications: notification } }
//     );
//     return res.status(201).send();
//   }
// });

app.post("/like", async (req, res) => {
  const { userId, postId } = req.body;
  likePost(postId, userId, null, null, res);
});


app.post("/unlike", async (req, res) => {
  const { userId, postId } = req.body;
  try {
    const result = await unlikePost(postId, userId, null, null, "api");
    res.status(201).json(result);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});


app.post("/likecomment", async (req, res) => {
  const { userID, postId, comment } = req.body;
  likeComment(postId, userID, comment, null, null, res);
});

app.post("/unlikecomment", async (req, res) => {
  const { user, postId, comment } = req.body;
  const post = await Post.findById(postId);
  const commentOb = post.comments.id(comment);
  commentOb.likes.pull(user);
  await post.save();
  return res.status(201).send();
});
