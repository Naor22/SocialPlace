import Navbar from "./components/Navbar";
import Feed from "./components/Feed";
import RegisterCheck from "./components/RegisterCheck";
import Profile from "./components/Profile";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUserOb, setLoggedIn } from "./features/authSlice";
import api from "./api/axios";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import { setAlertMsg } from "./features/authSlice";
import { setUpdate } from "./features/feedSlice";
import { sendMessage } from "./api/socketManager";
import Chat from "./components/Chat";

const App = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const update = useSelector((state) => state.feed.update);
  const userOb = useSelector((state) => state.auth.userOb);
  const navigate = useNavigate();
  const alertMsg = useSelector((state) => state.auth.alertMsg);

  useEffect(() => {
    if (isLoggedIn) {
      api
        .get("/getprofile?user=" + userOb._id)
        .then((res) => {
          dispatch(setUserOb(res.data));
        })
        .catch((err) => {
          console.log("Error: ", err);
        });
    } else {
      navigate("/login");
    }
  }, [update]);

  const displayAlert = (type) => {
    if (alertMsg === "") return "";
    if (alertMsg.includes("successfully")) {
      return <Alert severity="success">{alertMsg}</Alert>;
    } else {
      return <Alert severity="error">{alertMsg}</Alert>;
    }
  };


  const alertTimeoutRef = useRef(null);

  const changeAlert = (msg) => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }

    dispatch(setAlertMsg(msg));

    alertTimeoutRef.current = setTimeout(() => {
      dispatch(setAlertMsg(""));
    }, 3000);
  };

  const removeFriend = (friendId) => {

    sendMessage("removeFriend", { userId: userOb._id, friendId: friendId }, (response) => {
      if (response.success) {
        dispatch(setUserOb(response.data));
        dispatch(setUpdate());
      } else {
        api
          .post("/removefriend", {
            userId: userOb._id,
            friendId: friendId,
          })
          .then((res) => {
            changeAlert("Friend Removed");
            dispatch(setUserOb(res.data.data));
          })
          .catch((err) => {
            changeAlert("There was a problem removing this friend!")
          });
      }
    }
    )
  };

  const handleFriendRequest = (friendId, notificationId, accept) => {

    sendMessage("friendRequest", { userId: userOb._id, friendId: friendId, notification: notificationId, accept: accept }, (response) => {
      if (response.success) {
        dispatch(setUserOb(response.data));
        dispatch(setUpdate());
      } else {
        api
          .post("/friendrequest", {
            userId: userOb._id,
            friendId: friendId,
            notification: notificationId,
            accept: accept,
          })
          .then((res) => {
            dispatch(setUpdate());
          })
          .catch((err) => {
            changeAlert("There was a problem handling this friend request!")
          });
      }
    }
    )
  }



  const handleLogOut = () => {
    dispatch(setUserOb(null));
    dispatch(setLoggedIn(false));
  };

  return (
    <div>
      <Navbar

        handleLogOut={handleLogOut}
        handleFriendRequest={handleFriendRequest}
        changeAlert={changeAlert}
      />
      {displayAlert()}
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Feed

                userID={userOb._id}
                userOb={userOb}
                removeFriend={removeFriend}
                changeAlert={changeAlert}
              />
            ) : (
              <RegisterCheck route="login" changeAlert={changeAlert} />
            )
          }
        />
        <Route path="/register" element={<RegisterCheck route="register" changeAlert={changeAlert} />} />
        <Route path="/login" element={<RegisterCheck route="login" changeAlert={changeAlert} />} />

        <Route
          path="/profile/:userId"
          element={<Profile changeAlert={changeAlert} handleFriendRequest={handleFriendRequest} removeFriend={removeFriend} />}
        />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </div>
  );
};

export default App;
