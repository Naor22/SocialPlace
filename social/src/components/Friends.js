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


export default function Friends({ removeFriend, navigate }) {
    const userOb = useSelector((state) => state.auth?.userOb);
    const userID = userOb._id;
    const dispatch = useDispatch();
    const [friends, setFriends] = useState()
    const [refresh, setRefresh] = useState(false)
    const update = useSelector((state) => state.feed?.update);

    useEffect(() => {
        api
            .get("/getfriends", {
                params: {
                    user: userID,
                },
            }).then((res) => {
                const friends = res.data;
                const friendsIds = friends?.map(friend => friend._id);
                sendMessage('checkOnline', friendsIds, (response) => {
                    const updatedFriends = friends?.map(friend => {
                        if (response.includes(friend._id)) {
                            return {
                                ...friend,
                                online: true
                            };
                        }
                        return friend;
                    });
                    setFriends(updatedFriends);
                    setRefresh(!refresh);
                });

            }).catch((err) => {
                console.log("Error: ", err);
            });

        const handleConnect = (data) => {
            const userId = data;
            const updatedFriends = friends?.map(friend => {
                if (friend._id === userId) {
                    return {
                        ...friend,
                        online: true
                    };
                }
                return friend;
            });
            setFriends(updatedFriends);
            setRefresh(!refresh);
            dispatch(setUpdate());
        }

        const handleDisconnect = (data) => {
            const userId = data;
            const updatedFriends = friends?.map(friend => {
                if (friend._id === userId) {
                    return {
                        ...friend,
                        online: false
                    };
                }
                return friend;
            });
            setFriends(updatedFriends);
            setRefresh(!refresh);
            dispatch(setUpdate());
        }

        registerMessageHandler('online', handleConnect);
        registerMessageHandler('offline', handleDisconnect);

        return () => {
            unregisterMessageHandler('online');
            unregisterMessageHandler('offline');
        }

    }
        , [update]);


    return (
        <List className='shadow-3' dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', borderRadius: '20px', overflow: 'hidden' }}
            subheader={<ListSubheader>Friends</ListSubheader>}>
            {friends?.map((value) => {
                return <Friend key={value._id} friend={value} navigate={navigate} removeFriend={removeFriend} />
            })}
        </List>
    );
}
