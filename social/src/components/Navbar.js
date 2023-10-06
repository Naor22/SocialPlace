import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUpdate } from "../features/feedSlice";
import { setUserOb } from "../features/authSlice";
import Badge from '@mui/material/Badge';
import { useState, useEffect } from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import Divider from '@mui/material/Divider';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import Stack from '@mui/material/Stack';
import api from "../api/axios";
import { registerMessageHandler, unregisterMessageHandler } from '../api/socketManager';
import {
  Popover, List, ListItem,
} from '@mui/material';




const pages = ["Feed", "Chat"];
const settings = ["Profile", "Settings", "Logout"];

const Navbar = ({ handleLogOut, handleFriendRequest }) => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNot, setAnchorElNot] = useState(null);
  const [anchorElNotUser, setAnchorElNotUser] = useState(null);
  const isLoggedIn = useSelector((state) => state.auth?.isLoggedIn);
  const userOb = useSelector((state) => state.auth?.userOb);


  useEffect(() => {
    const handleMessage = (data) => {
      dispatch(setUserOb(data));
      dispatch(setUpdate());


    };
    registerMessageHandler('notification', handleMessage);

    return () => {
      unregisterMessageHandler('notification');
    }

  },);


  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleOpenNotifications = (event) => {
    setAnchorElNot(event.currentTarget);
  };




  const unSeenNotifications = () => {
    let count = 0;
    userOb.notifications?.forEach((notification) => {
      if (!notification.seen) {
        count++;
      }
    })
    return count;
  }

  const handleCloseNavMenu = (page) => {
    switch (page) {
      case "Feed":
        dispatch(setUpdate());
        navigate("/");
        break;
      case "Chat":
        navigate("/chat");
        break;
      case "Profile":
        navigate(`/profile/${userOb._id}`);

        break;
      case "Settings":
        navigate("/settings");
        break;
      case "Logout":
        handleLogOut();
        navigate("/login");
        break;
    }
    setAnchorElNav(null);
    setAnchorElUser(null);
  };

  const handleCloseNotifications = (notification, clicked) => {
    setAnchorElNot(null);
    setAnchorElNotUser(null);
    api.post('/seennotifications', {
      user: userOb._id
    }).then((res) => {
      dispatch(setUpdate());
    }).catch((err) => {
      console.log("Error: ", err);
    });
    if(clicked) navigate(`/profile/${notification.userId._id}`);

  };

  const handleCloseUserNot = (notification) => {
    setAnchorElNotUser(null);
  };


  const handleCloseUserMenu = () => {
 
    setAnchorElUser(null);

  };

  return (
    <div>
      <AppBar position="static" >
        <Container maxWidth="100%">
          <Toolbar disableGutters>
            <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              LOGO
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page} onClick={() => handleCloseNavMenu(page)}>
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              LOGO
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={() => handleCloseNavMenu(page)}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {page}
                </Button>
              ))}
            </Box>



            <Box sx={{ flexGrow: 0 }}>
              {isLoggedIn ? (
                <>
                  <Tooltip title="Open settings">
                    <div>
                      <IconButton onClick={handleOpenNotifications}>
                        <Badge className="mr3" color="secondary" badgeContent={unSeenNotifications() || 0}>
                          <CircleNotificationsIcon />
                        </Badge>
                      </IconButton>

                      <Popover
                        sx={{
                          mt: "45px", '.MuiPaper-root': {
                            borderRadius: '15px',
                          }
                        }}
                        id="notification-popover"
                        anchorEl={anchorElNot}
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        keepMounted
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        open={Boolean(anchorElNot)}
                        onClose={() => handleCloseNotifications(null, false)}
                      >
                        <div style={{
                          maxHeight: '500px',
                          overflowY: 'auto',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        }}>

                          <style>
                            {`
              ::-webkit-scrollbar {
                width: 0;
                background: transparent;
              }
            `}
                          </style>
                          <List subheader={
                            <ListSubheader component="div" id="nested-list-subheader">
                              Notificatios
                            </ListSubheader>
                          }>
                            {userOb.notifications.toReversed().map((notification) => (

                              <React.Fragment key={notification._id}>

                                <Divider variant="middle" sx={{ borderTop: '1px dashed' }} />
                                <ListItem

                                  onClick={() => handleCloseNotifications(notification, true)}
                                >

                                  {!notification.seen ? <FiberManualRecordIcon className='mr2' fontSize='small' color="primary" /> : null}

                                  <Avatar>
                                    <img alt={notification.userId.avatar} src={notification.userId.avatar} />
                                  </Avatar>
                                  <Typography sx={{ ml: 1, mr: 2 }} textAlign="center">
                                    <span style={{
                                      color: '#1976d2',

                                    }}>
                                      {notification.userId.name}
                                    </span>
                                    {notification.text}
                                  </Typography>
                                  {notification.text.includes("sent you a friend") ? (
                                    <Stack spacing={1} direction="row">
                                      <Button variant="contained" onClick={(e) => { handleFriendRequest(notification.userId._id, notification._id, true); e.preventDefault(); }} size="small">Accept</Button>
                                      <Button variant="outlined" onClick={(e) => { handleFriendRequest(notification.userId._id, notification._id, false); e.preventDefault(); }} size="small">Deny</Button>
                                    </Stack>

                                  ) : null}

                                </ListItem>

                              </React.Fragment>
                            ))}
                          </List>
                        </div>
                      </Popover>

                      <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                        <Avatar>
                          <img alt={userOb.name} src={userOb.avatar} />
                        </Avatar>
                      </IconButton>

                    </div>
                  </Tooltip>
                </>
              ) : null
              }
              <Menu
                sx={{
                  mt: "45px", '.MuiPaper-root': {
                    borderRadius: '15px',  // Adjust this value for desired roundedness
                  }
                }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem
                    key={setting}

                    onClick={() => handleCloseNavMenu(setting)}
                  >
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>

      </AppBar>

    </div>
  );
};
export default Navbar;
