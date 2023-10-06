import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import api from "../api/axios";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddCommentIcon from '@mui/icons-material/AddComment';
import CommentCreate from './CommentCreate';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Comment from './Comment';
import Badge from '@mui/material/Badge';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import { useSelector, useDispatch } from 'react-redux';
import { setUpdate } from '../features/feedSlice';
import { setPosts } from '../features/feedSlice';
import { sendMessage } from '../api/socketManager';


const Post = ({ post, changeAlert, navigate }) => {
    const dispatch = useDispatch();
    const [expanded, setExpanded] = React.useState(false);
    const { description, date, likes, comments } = post;
    const { name, email, _id, avatar } = post.userId;
    const [anchorEl, setAnchorEl] = React.useState(null);

    const userOb = useSelector((state) => state.auth?.userOb);
    const userId = userOb._id;



    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const DeletePost = () => {
        api
            .post("/deletepost", {
                postId: post._id,
                userId: userId,
            })
            .then((res) => {
                dispatch(setUpdate());
            })
            .catch((err) => {
                console.log("Error: ", err);
            });
    }


    const handleExpandClick = () => {
        setExpanded(!expanded);
    };


    const StyledBadge = styled(Badge)(({ theme }) => ({
        '& .MuiBadge-badge': {
            right: -6,
            top: 15,
            border: `2px solid ${theme.palette.background.paper}`,
            padding: '0 4px',
        },
    }));

    const ExpandMore = styled((props) => {
        const { expand, ...other } = props;
        return <IconButton {...other} />;
    })(({ theme, expand }) => ({
        transform: !expand ? 'rotate(0deg)' : 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    }));

    let postDate;
    let todayDate;
    let dates;
    let times;

    const compareDates = (postDateA) => {

        const postFullDate = new Date(postDateA);
        const todayFullDate = new Date()
        postDate = new Date(postFullDate.getFullYear(), postFullDate.getMonth(), postFullDate.getDate());
        todayDate = new Date(todayFullDate.getFullYear(), todayFullDate.getMonth(), todayFullDate.getDate());
        dates = date.toString().substring(0, 10);
        times = date.toString().substring(11, 16);
        if (postDate.getTime() === todayDate.getTime()) {
            return true;
        }

        return false;
    }

    const like = () => {

        sendMessage("like", { userId: userId, postId: post._id }, (response) => {
            if (response.success) {
                dispatch(setPosts(response.data));
            } else {
                api.post("/like", {
                    postId: post._id,
                    userId: userId,
                }).then((res) => {
                    dispatch(setPosts(res.data));
                })
                    .catch((err) => {
                        changeAlert("There was a problem liking this post")
                    });

            }
        })

    }
    const unlike = () => {
        sendMessage("unlike", { userId: userId, postId: post._id }, (response) => {
            if (response.success) {
                dispatch(setPosts(response.data));
            } else {
                api.post("/unlike", {
                    postId: post._id,
                    userId: userId,
                }).then((res) => {
                    dispatch(setPosts(res.data.data));
                })
                    .catch((err) => {
                        changeAlert("There was a problem unliking this post")
                    });
            }
        })
    }



    return (
        <Card sx={{ width : '100%', borderRadius: '20px' }}>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe" onClick={() => {  navigate(`/profile/${_id}`); }}>
                        <img src={avatar}></img>
                    </Avatar>
                }

                action={

                    userId === _id ? (
                        <div>
                            <IconButton aria-label="settings" onClick={handleClick}  >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                id="simple-menu"
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                sx={{
                                    '.MuiPaper-root': {
                                        borderRadius: '10px',
                                    },
                                }}
                            >
                                <MenuItem onClick={handleClose}><EditIcon style={{ color: 'blue' }} />  Edit</MenuItem>
                                <Divider sx={{ my: 1 }} />

                                <MenuItem onClick={() => {
                                    DeletePost();
                                    handleClose();
                                }}><DeleteIcon style={{ color: 'red' }} />Delete</MenuItem>
                            </Menu>
                        </div>
                    ) : null
                }

                title={name}
                subheader={compareDates(date) ? times : dates + " " + times}
            />
            <CardContent>
                <Typography variant="body2" color="text.secondary" style={{ wordWrap: "break-word", overflowWrap: "break-word", maxHeight: "someValuepx", overflowY: "auto" }}>

                    {description}

                </Typography>
            </CardContent>
            <CardActions disableSpacing>
                <IconButton aria-label="like">
                    <StyledBadge badgeContent={likes.length} color="secondary">
                        {likes.includes(userId) ?
                            <FavoriteIcon style={{ color: 'red' }} onClick={() => unlike()} />
                            :
                            <FavoriteBorderIcon onClick={() => like()} />}
                    </StyledBadge>
                </IconButton>

                <ExpandMore
                    expand={expanded}
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                >


                    <Badge badgeContent={comments.length} color="primary">
                        <AddCommentIcon />
                    </Badge>
                </ExpandMore>

            </CardActions>
            <Divider variant="middle" />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent  >
                    <CommentCreate post={post} changeAlert={changeAlert} />
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ maxHeight: "700px", overflowY: "scroll" }}>

                            {comments.length ? (comments.map((comment, i) => {
                                return (
                                    <Comment navigate={navigate} changeAlert={changeAlert} key={i} postId={post._id} StyledBadge={StyledBadge} comment={comment} compareDates={compareDates} />
                                )
                            })
                            ) : "No comments yet"}
                        </div>
                    </div>

                </CardContent>
            </Collapse>
        </Card>
    );
}

export default Post;