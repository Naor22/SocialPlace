import { User, Chat } from '../models.js';


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

export const addFriend = async (userId, friendId, io, onlineUsers, res) => {
    try {
        const userFriends = await getFriends(userId);

        if (userFriends.includes(friendId)) {
            if (io) {
                io.to(onlineUsers[userId]).emit('addFriend-response', { success: false });
            } else {
                return res.status(400).send("Already friends");
            }
            return;
        }

        const addFriendNotify = {
            userId: userId,
            text: " sent you a friend request",
            date: new Date(),
            seen: false,
        };

        await User.findOneAndUpdate(
            { _id: friendId },
            {
                $addToSet: {
                    notifications: addFriendNotify,
                    receivedfriendRequests: { userId: userId }
                }
            },
            { new: true }
        );

        const updatedFriend = await populateUser(friendId);

        await User.updateOne(
            { _id: userId },
            { $addToSet: { sentfriendRequests: { userId: friendId } } }
        );

        if (io) {
            io.to(onlineUsers[userId]).emit('addFriend-response', { success: true });
            io.to(onlineUsers[friendId]).emit('notification', updatedFriend);
        } else {
            return res.status(201).send();
        }
    } catch (err) {
        console.log(err);
        if (io) {
            io.to(onlineUsers[userId]).emit('addFriend-response', { success: false });
        } else {
            return res.status(500).send("Internal server error");
        }
    }
}


export const removeFriend = async (userId, friendId, io, onlineUsers, res) => {
    try {
        const userFriends = await getFriends(userId);
        if (!userFriends.includes(friendId)) {
            if (io) {
                return io.to(onlineUsers[userId]).emit('removeFriend-response', { success: false });
            } else {
                return res.status(400).send("Not a friend");
            }
        }
        await User.findOneAndUpdate({ _id: userId }, { $pull: { friends: friendId } });
        await User.findOneAndUpdate({ _id: friendId }, { $pull: { friends: userId } });
        const updatedUser = await populateUser(userId);
        const updatedFriend = await populateUser(friendId);
        if (io) {
            io.to(onlineUsers[userId]).emit('removeFriend-response', { success: true, data: updatedUser });
            io.to(onlineUsers[friendId]).emit('notification', updatedFriend);
        } else {
            return res.status(201).json({ success: true, data: updatedUser });
        }
    } catch (err) {
        console.log(err);
        if (io) {
            io.to(onlineUsers[userId]).emit('removeFriend-response', { success: false });
        } else {
            return res.status(500).send("Internal server error");
        }
    }
}

export const friendRequest = async (userId, friendId, notificationId, accept, io, onlineUsers, res) => {
    try {
        const responseNotification = {
            userId: userId,
            text: accept ? " accepted your friend request" : " declined your friend request",
            date: new Date(),
            seen: false,
        };

        if (accept) {
            await User.updateOne({ _id: userId }, { $addToSet: { friends: friendId } });
            await User.updateOne({ _id: friendId }, { $addToSet: { friends: userId } });
        }

        await User.findOneAndUpdate(
            { _id: userId },
            {
                $pull: {
                    notifications: {
                        userId: friendId,
                        text: " sent you a friend request"
                    },
                    receivedfriendRequests: { userId: friendId }
                }
            },
            { new: true }
        );

        const updatedUser = await populateUser(userId);

        if (io) {
            io.to(onlineUsers[userId]).emit('friendRequest-response', { success: true, data: updatedUser });
        }

        await User.findOneAndUpdate(
            { _id: friendId },
            {
                $addToSet: { notifications: responseNotification },
                $pull: { sentfriendRequests: { userId: userId } }
            },
            { new: true }
        );

        const updatedFriend = await populateUser(friendId);
        const chat = new Chat({ users: [userId, friendId], messages: []});
        await chat.save();
        if (io) 
            io.to(onlineUsers[friendId]).emit('notification', updatedFriend);

    } catch (err) {
        console.log(err);
        if (io) {
            io.to(onlineUsers[userId]).emit('friendRequest-response', { success: false });
        } else {
            return res.status(500).send("Internal server error");
        }
    }
}


