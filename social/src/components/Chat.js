import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import FriendsChats from "./FriendsChats";
import ChatBox from "./ChatBox";


const Chat = () => {
    return (
        <div  style={{ display: 'flex', marginTop: "20px", width: "100%", height: "100%" }}>
            <Grid container spacing={0}>
                <Grid item xs={12} sm={4} md={2} style={{ height: "100%" }}>
                    <FriendsChats />
                </Grid>
                <Grid item xs={12} sm={8} md={10} style={{ height: "100%" }}>
                    <ChatBox />
                </Grid>
            </Grid>
        </div>
    );
}
export default Chat;