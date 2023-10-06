import * as React from 'react';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import Menu from '@mui/material/Menu';
import api from "../api/axios";
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useSelector, useDispatch } from 'react-redux';
import { setUpdate, setPosts } from '../features/feedSlice';
import { sendMessage } from '../api/socketManager';

export default function Comment({ postId, comment, compareDates, StyledBadge, navigate, changeAlert }) {
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const userOb = useSelector((state) => state.auth?.userOb);
    const userID = userOb._id;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const DeleteComment = () => {
        api
            .post("/deletecomment", {
                postId: postId,
                commentId: _id,
                userId: userID,
            })
            .then((res) => {
                dispatch(setUpdate());
            })
            .catch((err) => {
                console.log("Error: ", err);
            });
    }


    const { userId, content, created_at, likes, _id } = comment;
    const { name, avatar } = userId
    let dates = created_at.toString().substring(0, 10);
    let times = created_at.toString().substring(11, 16);

    const likeComment = () => {
        sendMessage('likeComment', { postId: postId, comment: _id, userId: userID }, (response) => {
            if (response.success) {
                dispatch(setPosts(response.data))
            } else {
                api
                    .post("/likecomment", {
                        postId: postId,
                        comment: _id,
                        userId: userID,
                    })
                    .then((res) => {
                        dispatch(setUpdate());
                    })
                    .catch((err) => {
                        changeAlert("There was a problem liking this comment")
                    });
            }
        }
        )

    }

    const unLikeComment = () => {
        api.post("/unlikecomment", { user: userID, postId: postId, comment: _id })
            .then((res) => {
                dispatch(setUpdate());

            })
            .catch((err) => {
                console.log("Error: ", err);
            });
    }

    return (
        <div className="pa2">
            <Card sx={{ maxWidth: 'auto' }}>
                <CardHeader
                    avatar={
                        <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe" onClick={() => navigate(`/profile/${userId._id}`)}>
                            <img src={avatar}></img>
                        </Avatar>
                    }
                    action={

                        userID === userId._id ? (
                            <div>
                                <IconButton aria-label="settings" onClick={handleClick}  >
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                    id="simple-menu"
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem onClick={handleClose}><EditIcon style={{ color: 'blue' }} />  Edit</MenuItem>
                                    <MenuItem onClick={() => {
                                        DeleteComment();
                                        handleClose();
                                    }}><DeleteIcon style={{ color: 'red' }} />Delete</MenuItem>
                                </Menu>
                            </div>
                        ) : null
                    }
                    title={name}
                    subheader={compareDates(created_at) ? times : dates + " " + times}
                />
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        {content}
                    </Typography>
                </CardContent>
                <IconButton aria-label="like">
                    <StyledBadge badgeContent={likes.length} color="secondary">
                        {likes.includes(userID) ?
                            <FavoriteIcon style={{ color: 'red' }} onClick={() => unLikeComment()} />
                            :
                            <FavoriteBorderIcon onClick={() => likeComment()} />}
                    </StyledBadge>
                </IconButton>
            </Card>
        </div>
    );
}
