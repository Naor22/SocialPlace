import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux'
import ChatMessage from './ChatMessage'
import ChatSendMessage from './ChatSendMessage'
import { useRef, useEffect } from 'react'
import { addMessage } from '../features/chatSlice';
import { registerMessageHandler, unregisterMessageHandler } from '../api/socketManager';
import { useDispatch } from 'react-redux'
export default function ChatBox() {
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const currentChat = useSelector((state) => state.chat.currentChat);
    const currentChatContent = useSelector((state) => state.chat.currentChatContent);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


    useEffect(() => {
        const handleMessage = (data) => {
            if(data.chatId === currentChat._id)
            dispatch(addMessage(data.data));

        };
        registerMessageHandler('chatMsg', handleMessage);

        return () => {
            unregisterMessageHandler('chatMsg');
        }

    },);

    useEffect(() => {

        scrollToBottom()
    }, [currentChatContent]);

    return (
        <div className="chat-box shadow-5" style={{ borderRadius: '20px', overflow: 'hidden', margin: 0, padding: 0 }}>
        <div style={{ maxHeight: 700, height: 700, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', backgroundColor: 'white', padding: 0, margin: 0 }}>
            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', height: '100%', margin: 0, padding: 0 }}>
                    {currentChat ? currentChatContent?.map((message) => (
                        <ChatMessage key={message._id} message={message} />
                    )) : null}
                </List>
                <div ref={messagesEndRef} />
                <style>
                    {`
                        ::-webkit-scrollbar {
                            display: none;
                        }
                    `}
                </style>
            </div>
            <ChatSendMessage />
        </div>
    );
    

}
