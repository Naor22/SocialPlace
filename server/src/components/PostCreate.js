import PostText from './PostText';
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUpdate } from '../features/feedSlice';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import api from '../api/axios';
import PhotoIcon from '@mui/icons-material/Photo';

const PostCreate = () => {
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const userOb = useSelector((state) => state.auth?.userOb);

  const handlePost = (text) => {
    setText("");
    api
      .post("/post", {
        user: userOb._id,
        description: text,
      })
      .then((res) => {
        dispatch(setUpdate());
      })
      .catch((err) => {
        console.log("Error: ", err);
      });

  }
  
  const clickEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePost(text)
    }
  }

  return (
    <Card sx={{ borderRadius:'15px' }}>
    <CardContent>
    <Stack spacing={1} direction="row" sx={{ display: 'flex', width: '100%' }}>
      <Avatar  aria-label="recipe">
        <img src={userOb.avatar}></img>
      </Avatar>

      <PostText setText={setText} text={text} clickEnter={clickEnter}   placeholder={"Tell us your story"} />
      <Button variant="contained" size="small" sx={{ borderRadius: '20px' }} onClick={() => { handlePost(text); }}>Post</Button>
      
    </Stack>
    </CardContent>
      </Card>
  );
}

export default PostCreate;