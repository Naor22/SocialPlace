import { useEffect, useState } from 'react'
import * as React from 'react';
import { useSelector } from 'react-redux'
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import { registerMessageHandler, unregisterMessageHandler } from '../api/socketManager';
import ListSubheader from '@mui/material/ListSubheader';
import ChatUnit from './ChatUnit';



export default function FriendsChats() {
    const [selectedFriend, setSelectedFriend] = useState(null);
    const user = useSelector((state) => state.auth?.userOb);
    const friends = user.friends;
    return (
        <List className="friends-chats shadow-5"
            sx={{
                width: '100%',
                maxWidth: 360,
                height: '100%',
                bgcolor: 'background.paper',
                borderRadius: '20px',
                margin: 0,
                padding: 0,

            }}
            subheader={<ListSubheader>Friends</ListSubheader>}
        >
            {friends?.map((friend) => {
                return <ChatUnit key={friend._id} friend={friend} user={user} isSelected={selectedFriend === friend._id} onSelect={() => setSelectedFriend(friend._id)} />
               
            })}
  
        </List>

    );

}
