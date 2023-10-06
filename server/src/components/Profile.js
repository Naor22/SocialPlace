import React from 'react';
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBBtn,
  MDBBreadcrumb,
  MDBBreadcrumbItem,
  MDBProgress,
  MDBProgressBar,
  MDBIcon,
  MDBListGroup,
  MDBListGroupItem
} from 'mdb-react-ui-kit';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import TextField from '@mui/material/TextField';

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useRef, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { sendMessage } from '../api/socketManager';
import api from '../api/axios'
import { setUpdate } from '../features/feedSlice';
import { useSelector, useDispatch } from 'react-redux';
import { IconButton } from '@mui/material';
import { setInterests } from '../features/authSlice';

export default function Profile({ removeFriend, changeAlert, handleFriendRequest }) {

  const [sent, setSent] = useState(false);
  const [addInterests, setAddInterests] = useState(false);
  const [tmpInterests, setTmpInterests] = useState(null);
  const { userId } = useParams();
  const dispatch = useDispatch();
  const inputRef = useRef(null)
  const user = useSelector((state) => state.auth?.userOb);
  const [profile, setProfile] = useState(null);
  const [isSelf, setIsSelf] = useState(false);
  const [error, setError] = useState(null);
  const [buttonsDisabled, setButtonsDisabled] = useState({
    addFriend: false,
    removeFriend: false,
    pending: true,
    message: false,
  });


  useEffect(() => {
    if (userId === user._id.toString()) {
      setIsSelf(true);
      setProfile(user);
    } else {
      setIsSelf(false);
      api.get("/getprofile", { params: { user: userId } })
        .then((res) => {
          setProfile(res.data);
        })
        .catch((err) => {
          changeAlert("Profile not found");
          setError('Profile not found or other error message.');
        });

    }


  }, [userId, user]);

  useEffect(() => {
    if (profile) {
      setAvatar(profile.avatar);
    }
  }, [profile]);

  const [avatar, setAvatar] = useState(profile ? profile.avatar : "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp")


  if (error) {
    return <div>{error}</div>;
  }

  if (!profile) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  const { name, email, phone, address, birthday, interests } = profile

  const date = new Date(birthday).toLocaleDateString()

  const handleInterests = () => {
    if (addInterests) {
      const interestsArr = user.interests;
      const validInterests = interestsArr.filter(interest => interest.length <= 10);
      if (validInterests.length !== interestsArr.length) {
        changeAlert("Some interests were too long and have been removed.");
        dispatch(setInterests(validInterests.join(',')));
      }
      if (validInterests.length === 0) {
        changeAlert("No valid interests provided. Interests must be 10 characters or less.");
        return;
      }
      if (validInterests.length >= 15) {
        changeAlert("You can only have up to 15 interests");
        return;
      }
      api.post('/addinterests', { interests: validInterests, userId: user._id }).then((res) => {
        dispatch(setUpdate());
      })
    }
    setAddInterests(!addInterests)
  }


  const handleAddFriend = () => {
    setButtonsDisabled({ ...buttonsDisabled, addFriend: true })
    sendMessage('addFriend', { userId: user._id, friendId: profile._id }, (response) => {
      if (response.success) {
        changeAlert('Friend request sent to ' + profile.name + " successfully!");
        setSent(true);
        dispatch(setUpdate());
      } else {
        api.post('/addfriend', { id: user._id, friendId: profile._id }).then((res) => {
          changeAlert('Friend request sent to ' + profile.name + " successfully!");
          setSent(true);
          dispatch(setUpdate());
        }).catch((err) => {
          changeAlert("There was a problem sending friend request to " + profile.name)
        }
        );
      }
      setButtonsDisabled({ ...buttonsDisabled, addFriend: false })
    });


  }



  const handleUpload = () => {
    inputRef.current.click();
  }

  const handleFileChange = async event => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }
    event.target.value = null;
    const base64 = await convertToBase64(fileObj)
    setAvatar(base64)
    api.post('/uploadpic', { base64: base64, id: user._id }).then((res) => {
      dispatch(setUpdate());
    })

  }


  const convertToBase64 = (file) => {

    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);

      };
      fileReader.onerror = (error) => {

        reject(error);
      };
    })

  }

  const checkIfFriends = () => {
    const friends = user.friends.map(friend => {
      return friend._id
    })

    if (!isSelf && friends.includes(profile._id)) {
      return (
        <>
          <MDBBtn onClick={() => removeFriend(profile._id)}>Remove Friend</MDBBtn>
          <MDBBtn outline className="ms-1">Message</MDBBtn>
        </>
      )
    } else {
      const myRequests = user.receivedfriendRequests;
      const mySentRequests = user.sentfriendRequests;

      if (mySentRequests?.find(req => req.userId == profile._id))
        return (
          <MDBBtn onClick={() => changeAlert("You have already sent friend request to " + profile.name)}>Pending</MDBBtn>
        )
      if (myRequests?.find(req => req.userId == profile._id))
        return (
          <>
            <MDBBtn onClick={() => handleFriendRequest(profile._id, null, true)}>Accept</MDBBtn>
            <MDBBtn outline className="ms-1" onClick={() => handleFriendRequest(profile._id, null, false)}>Deny</MDBBtn>
          </>
        )
      return (
        <MDBBtn onClick={() => handleAddFriend()} disabled={buttonsDisabled.addFriend}>Add Friend</MDBBtn>
      )
    }
  }
  return (
    <section style={{ backgroundColor: '#eee' }}>
      <MDBContainer className="py-5">
        <MDBRow>
          <MDBCol>
            <MDBBreadcrumb className="bg-light rounded-3 p-3 mb-4">
              <MDBBreadcrumbItem active>User Profile</MDBBreadcrumbItem>
            </MDBBreadcrumb>
          </MDBCol>
        </MDBRow>

        <MDBRow>
          <MDBCol lg="4">
            <MDBCard className="mb-4">
              <MDBCardBody className="text-center">
                <MDBCardImage
                  src={avatar}
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: '150px' }}
                  fluid />

                <div className="d-flex justify-content-center mb-2 mt3">
                  {user._id !== profile._id ? (
                    <>
                      {checkIfFriends()}
                    </>
                  ) : (
                    <>
                      <input
                        style={{ display: 'none' }}
                        ref={inputRef}
                        type="file"
                        accept=".png, .jpg, .jpeg"
                        onChange={handleFileChange}
                      />
                      <MDBBtn outline className="ms-1" onClick={() => { handleUpload() }}>Upload Avatar</MDBBtn>
                    </>
                  )}
                </div>
              </MDBCardBody>
            </MDBCard>

            <MDBCard className="mb-4 mb-lg-0">
              <MDBCardBody className="p-0">
                <MDBListGroup flush className="rounded-3">
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fas icon="globe fa-lg text-warning" />
                    <MDBCardText>https://mdbootstrap.com</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fab icon="github fa-lg" style={{ color: '#333333' }} />
                    <MDBCardText>mdbootstrap</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fab icon="twitter fa-lg" style={{ color: '#55acee' }} />
                    <MDBCardText>@mdbootstrap</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fab icon="instagram fa-lg" style={{ color: '#ac2bac' }} />
                    <MDBCardText>mdbootstrap</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                    <MDBIcon fab icon="facebook fa-lg" style={{ color: '#3b5998' }} />
                    <MDBCardText>mdbootstrap</MDBCardText>
                  </MDBListGroupItem>
                </MDBListGroup>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol lg="8">
            <MDBCard className="mb-4">
              <MDBCardBody>
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Full Name</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">{name}</MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Email</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">{email}</MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Phone</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">{phone}</MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Birthday</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">{date}</MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Address</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">{address}</MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                {isSelf &&
                  <MDBRow>
                    <MDBCol sm="3">
                      <MDBCardText>Interests</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9">
                      <MDBCardText className="text-muted" style={{ display: 'flex', alignItems: 'center' }}>
                        {addInterests ?
                          <TextField
                            id="outlined-basic"
                            placeholder="Write your interests separated by commas"
                            value={user.interests}
                            name="interests"
                            onChange={(e) => dispatch(setInterests(e.target.value))}
                            variant="outlined"
                            sx={{ width: '60%' }}
                          />
                          : user.interests.length >= 1 ? user.interests.join(',') : null
                        }
                        <IconButton onClick={() => handleInterests()} >
                          {addInterests ?
                            <DoneIcon style={{ color: 'green' }} />
                            : <AddIcon style={{ color: 'green' }} />
                          }
                        </IconButton>
                      </MDBCardText>


                    </MDBCol>
                  </MDBRow>
                }

              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </section >
  );
}