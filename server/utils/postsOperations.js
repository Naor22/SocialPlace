import { User, Post } from '../models.js';


const getFriends = async (userID) => {
    const userOb = await User.find({ _id: userID });
    return userOb[0]?.friends;
};

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

export const likePost = async (postId, userId, io, onlineUsers, res) => {
    try {
        const postOb = await Post.findOneAndUpdate(
            { _id: postId },
            { $addToSet: { likes: userId } },
            { new: true }
        );

        let notification = null;
        const postUser = postOb.userId;
        if (postUser != userId) {
            notification = {
                userId: userId,
                text: ' liked on your post',
                date: new Date(),
                seen: false
            };
            await User.findOneAndUpdate(
                { _id: postUser },
                { $addToSet: { notifications: notification } },
                { new: true }
            );
        }

        const newFeed = await getFeed(userId);
        const updatedUser = await populateUser(postUser);

        if (io) {
            io.to(onlineUsers[userId]).emit('like-response', { success: true, data: newFeed });
            if (onlineUsers[postUser] && postUser != userId) {
                io.to(onlineUsers[postUser]).emit('notification', updatedUser);
            }
        } else {
            return res.status(201).send({ success: true, data: newFeed });
        }
    } catch (err) {
        console.log(err);
        const errorMessage = "Failed to like the post.";

        if (io) {
            io.to(onlineUsers[userId]).emit('like-response', { success: false, data: null });
        } else {
            return res.status(500).send({ success: false, data: errorMessage });
        }
    }
}

export const unlikePost = async (postId, userId, onlineUsers, io, responseType = "websocket") => {
    try {
        const postOb = await Post.findOneAndUpdate(
            { _id: postId },
            { $pull: { likes: userId } },
            { new: true }
        );
        const postUser = postOb.userId;
        const newFeed = await getFeed(userId);
        const friendOb = await populateUser(postUser._id)
        if (responseType === "websocket") {
            io.to(onlineUsers[userId]).emit('unlike-response', { success: true, data: newFeed });
            io.to(onlineUsers[postUser]).emit('notification', friendOb);
        } else if (responseType === "api") {
            return { success: true, data: newFeed };
        }
    } catch (err) {
        console.log(err);
        if (responseType === "websocket") {
            io.to(onlineUsers[userId]).emit('unlike-response', { success: false, data: null });
        } else if (responseType === "api") {
            throw err;
        }
    }
}


export const commentPost = async (postId, userId, content, create_at, io = null, onlineUsers = null) => {
    
    try {
        const comment = {
            userId: userId,
            content: content,
            created_at: create_at,
        };
        const postOb = await Post.findOneAndUpdate(
            { _id: postId },
            { $addToSet: { comments: comment } }
        );
        const newFeed = await getFeed(userId);

        const postUser = postOb.userId;
        let notification;

        if (postUser != userId) {
            notification = {
                userId: userId,
                text: " commented on your post",
                date: new Date(),
                seen: false,
            };
            await User.findOneAndUpdate(
                { _id: postUser },
                { $addToSet: { notifications: notification } },
                { new: true }
            );
        }

        if (io && onlineUsers) {
            io.to(onlineUsers[userId]).emit('comment-response', { success: true, data: newFeed });

            if (onlineUsers[postUser] && postUser !== userId) {
                const updatedUser = await populateUser(postUser);
                io.to(onlineUsers[postUser]).emit('notification', updatedUser);
            }
        }
    } catch (err) {
        console.log(err);

        if (io && onlineUsers) {
            io.to(onlineUsers[userId]).emit('comment-response', { success: false, data: 'Failed to comment on the post.' });
        }
        throw err;
    }
}
export const likeComment = async (userId, postId, comment, io, onlineUsers, res) => {
    try {
        const post = await Post.findById(postId);
        const commentOb = post.comments.id(comment);
        if (commentOb.likes.includes(userId))
            return io ? io.to(onlineUsers[userId]).emit('likeComment-response', { success: false }) : res.status(500).send({ success: false });
        commentOb.likes.push(userId);
        await post.save();
        const newFeed = await getFeed(userId);
        if (commentOb.userId == userId) {
            return io ? io.to(onlineUsers[userId]).emit('likeComment-response', { success: true, data: newFeed }) : res.status(201).send();
        } else {
            let notification = {
                userId: userId,
                text: " liked on your comment",
                date: new Date(),
                seen: false,
            };
            await User.updateOne(
                { _id: commentOb.userId },
                { $addToSet: { notifications: notification } }
            );
            const newFeed = await getFeed(userId);
            const commentUserOb = await populateUser(commentOb.userId);

            if (io && onlineUsers) {
                io.to(onlineUsers[userId]).emit('likeComment-response', { success: true, data: newFeed });
                io.to(onlineUsers[commentOb.userId]).emit('notification', commentUserOb);
            } else {
                return res.status(201).send({ success: true, data: newFeed });
            }
        }
    } catch (err) {
        console.log(err);
        if (io) {
            io.to(onlineUsers[userId]).emit('likeComment-response', { success: false, data: 'Failed to like the comment.' });
        } else {
            return res.status(500).send({ success: false, data: 'Failed to like the comment.' });
        }

    }
}
