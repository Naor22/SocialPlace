import PostText from './PostText';
import * as React from 'react';
import Stack from '@mui/material/Stack';
import { useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import api from '../api/axios';
import { useSelector, useDispatch } from 'react-redux';
import { setUpdate, setPosts } from '../features/feedSlice';
import { sendMessage } from '../api/socketManager';

const CommentCreate = ({ post, changeAlert }) => {
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const userOb = useSelector((state) => state.auth?.userOb);
  const userId = userOb._id;

  const handleComment = (text) => {
    setText("");
    sendMessage("comment", { userId: userId, postId: post._id, content: text, create_at: new Date() }, (response) => {
      if (response.success) {
        dispatch(setPosts(response.data));
      } else {
        api
          .post("/comment", {
            postId: post._id,
            userId: userId,
            content: text,
            create_at: new Date(),
          }).then((res) => {
            dispatch(setUpdate());
          })
          .catch((err) => {
            changeAlert("There was a problem liking this post")
          });
      }
    })



  }
  const clickEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleComment(text)
    }
  }
  return (
    <Stack spacing={1} direction="row" alignItems="center" className="pa2">
      <PostText setText={setText} text={text} clickEnter={clickEnter} placeholder={"Comment here"} />
      <SendIcon onClick={() => { handleComment(text) }}></SendIcon>
    </Stack>
  );
}

export default CommentCreate;