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
import { sendMessage } from '../api/socketManager'
import { addMessage, removeMessage } from '../features/chatSlice';
import { v4 as uuidv4 } from 'uuid';


const ChatSendMessage = () => {
    const dispatch = useDispatch();
    const [text, setText] = useState("");
    const userOb = useSelector((state) => state.auth?.userOb);
    const currentChat = useSelector((state) => state.chat.currentChat);

    const handlePost = (text) => {
        if (text === "") return;
        setText("");
        const uniqueid = uuidv4();
        dispatch(addMessage({ uniqueid: uniqueid, userId: userOb._id, content: text, created_at: new Date() }))
        sendMessage('sendMessage', { chatId: currentChat._id, userId: userOb._id, content: text, created_at: new Date() }, (response) => {

            if (!response.success) {
                dispatch(removeMessage({ uniqueid: uniqueid, chatId: currentChat, userId: userOb, content: text, created_at: new Date() }))
            }
        }
        )

    }
    const clickEnter = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handlePost(text)
        }
    }

    return (
        <Card sx={{ backgroundColor: 'white' }}>
            <CardContent>
                <Stack spacing={1} direction="row" sx={{ display: 'flex', width: '100%' }}>
                    <Avatar aria-label="recipe">
                        <img src={userOb.avatar}></img>
                    </Avatar>

                    <PostText setText={setText} text={text} clickEnter={clickEnter} placeholder={"Write you message here"} />
                    <Button disabled={currentChat ? false : true} variant="contained" size="small" sx={{ borderRadius: '20px' }} onClick={() => { handlePost(text); }}>Send</Button>

                </Stack>
            </CardContent>
        </Card>
    );
}

export default ChatSendMessage;