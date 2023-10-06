import * as React from 'react';
import {useState, useEffect} from 'react'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

export default function ChatMessage({ message }) {
    const currentChat = useSelector((state) => state.chat.currentChat);
    const navigate = useNavigate();
    const user = currentChat.users.find(u => u._id === message.userId);

    return (
        <ListItem alignItems="flex-start" >
            <ListItemAvatar>
                <Avatar alt={user?.name} src={user?.avatar} onClick={() => {navigate(`/profile/${user._id}`)}}/>
            </ListItemAvatar>
            <ListItemText
                primary={user?.name}
                secondary={
                    <React.Fragment>
                        <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                        >
                            {message.content}
                        </Typography>
                       
                    </React.Fragment>
                }
            />
        </ListItem>
    );
}

