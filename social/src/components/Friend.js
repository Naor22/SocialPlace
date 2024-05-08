import ListItem from '@mui/material/ListItem';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ChatIcon from '@mui/icons-material/Chat';
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { useState, useEffect } from 'react';

const Friend = ({ friend, removeFriend, navigate, suggested }) => {
    const [anchorEls, setAnchorEls] = useState({});
    const [isOnline, setIsOnline] = useState(false);
    const [reason, setReason] = useState(null);
    const handleClick = (event, id) => {
        setAnchorEls(prev => ({ ...prev, [id]: event.currentTarget }));
    };

    useEffect(() => {

        if (suggested) {
            setReason(friend.reason == "interest" ? "You share common interests!" : `You're both in ${friend.city}!`)
            return;
        }
        if (friend?.online) {
            setIsOnline(true);
        } else {
            setIsOnline(false);
        }
    }
        , [friend.online]);

    const handleClose = (id) => {
        setAnchorEls(prev => ({ ...prev, [id]: null }));
    };
    return (
        <ListItem
            key={friend._id}
            disablePadding

        >
            {!suggested ? (isOnline ? (
                <FiberManualRecordIcon sx={{ marginLeft: 1, color: 'green' }} fontSize='small' />
            ) :
                <FiberManualRecordIcon sx={{ marginLeft: 1 }} fontSize='small' />
            ) : null}

            <ListItemButton onClick={() => navigate(`/profile/${friend._id}`)}>
                <ListItemAvatar>
                    <Avatar
                        alt={`Avatar n°${friend.name}`}
                        src={`${friend.avatar}`}
                    />
                </ListItemAvatar>
                <ListItemText id={friend.id} primary={`${friend.name}`} secondary={reason} />

            </ListItemButton>
            {!suggested ? (
                <div>
                    <IconButton aria-label="settings" onClick={(event) => handleClick(event, friend._id)} >
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        id="simple-menu"
                        anchorEl={anchorEls[friend._id]}
                        open={Boolean(anchorEls[friend._id])}
                        onClose={() => handleClose(friend._id)}
                        style={{ borderRadius: '20px' }}
                        sx={{
                            '.MuiPaper-root': {
                                borderRadius: '10px',
                            },
                        }}
                    >
                        <MenuItem onClick={() => {

                            handleClose();
                        }}>

                            <ChatIcon style={{ color: 'blue', marginRight: 10 }} />Send Message</MenuItem>
                        <Divider sx={{ my: 0.5 }} />
                        <MenuItem onClick={(e) => {
                            removeFriend(friend._id);
                            handleClose(friend._id);


                        }}
                        ><PersonRemoveIcon style={{ color: 'red', marginRight: 10 }} />Remove Friend</MenuItem>
                    </Menu>
                </div>
            ) : null}


        </ListItem>
    )

};
export default Friend;