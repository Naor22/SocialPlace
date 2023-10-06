import mongoose from "mongoose";

const user = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: Number,
  address: String,
  birthday: Date,
  location: String,
  city: String,
  country: String,
  interests : [],
  notifications: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    text: String,
    date: Date,
    seen: Boolean,
  }],
  sentfriendRequests : [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  receivedfriendRequests : [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],
  avatar: String,
});

const chat = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  messages: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: String,
    created_at: Date
  }],
});

const post = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: Date,
  description: String,
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      content: {
        type: String,
      },
      created_at: {
        type: Date,
        default: Date.now,
      },
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
    }
  ],

});

const User = mongoose.model("User", user);
const Post = mongoose.model("Post", post);
const Chat = mongoose.model("Chat", chat);

export { User, Post, Chat };
