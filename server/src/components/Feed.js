import { useEffect, useState } from "react";
import Post from "./Post";
import PostCreate from "./PostCreate";
import Stack from "@mui/material/Stack";
import api from "../api/axios";
import { Grid } from "@mui/material";
import Friends from "./Friends";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setAlertMsg } from "../features/authSlice";
import { setUpdate, setPosts } from "../features/feedSlice";
import SuggestedFriends from "./SuggestedFriends";

const Feed = ({ removeFriend }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const update = useSelector((state) => state.feed?.update);
    const posts = useSelector((state) => state.feed.posts);
    useEffect(() => {
        api
            .get("/feed?user=" + userID)
            .then((res) => {
                dispatch(setPosts(res.data.feed));
                console.log(res.data.suggestedFriends)
            })
            .catch((err) => {
                console.log("Error: ", err);
            });
    }, [update]);

    const userOb = useSelector((state) => state.auth?.userOb);
    const userID = userOb._id;
    const { friendPosts, myPosts } = !posts
        ? { friendPosts: [], myPosts: [] }
        : posts;
    const totalPosts = friendPosts?.concat(myPosts);
    const totalPostsSorted = totalPosts?.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });


    return (
        <div style={{ marginTop: "20px", width: "100%" }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={2}>
                    <Friends navigate={navigate}  removeFriend={removeFriend} />
                </Grid>

                <Grid item xs={12} md={8}>
                    <PostCreate setUpdate={setUpdate} update={update} />

                    <Stack spacing={2} sx={{ marginTop: "10px" }}>
                        {totalPostsSorted?.map((post) => (
                            <Post navigate={navigate} key={post._id} post={post} />
                        ))}
                    </Stack>
                </Grid>

                <Grid item xs={12} md={2}>
                    <SuggestedFriends navigate={navigate}/>
                </Grid>
            </Grid>
        </div>
    );

};

export default Feed;
