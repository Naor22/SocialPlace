import * as React from 'react';
import List from '@mui/material/List';

import { useEffect, useState } from "react";
import api from "../api/axios";
import ListSubheader from '@mui/material/ListSubheader';

import { useSelector, useDispatch } from 'react-redux';
import { setUpdate } from '../features/feedSlice';
import { setAlertMsg } from '../features/authSlice';
import Friend from './Friend';
import { registerMessageHandler, unregisterMessageHandler, sendMessage } from '../api/socketManager';


export default function SuggestedFriends({ navigate }) {
    const userOb = useSelector((state) => state.auth?.userOb);
    const userID = userOb._id;
    const dispatch = useDispatch();
    const [friends, setFriends] = useState([])
    const [refresh, setRefresh] = useState(false)
    const update = useSelector((state) => state.feed?.update);

    useEffect(() => {
        api
            .get("/getSuggestedFriends", {
                params: {
                    user: userID,
                },
            }).then((res) => {
                setFriends(res.data);
            }).catch((err) => {
                console.log("Error: ", err);
            });

    }
        , [update]);

    console.log(friends)
    return (
        <List className='shadow-3' dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', borderRadius: '20px', overflow: 'hidden' }}
            subheader={<ListSubheader>Suggested Friends</ListSubheader>}>
                {friends?.map((friend) => {
                    return <Friend key={friend._id} navigate={navigate} friend={friend} suggested={true} />
                }
                )}

        </List>
    );
}
