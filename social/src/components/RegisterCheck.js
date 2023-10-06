import React from "react";
import { useEffect } from "react";
import {
  MDBRow,
  MDBCol,
  MDBInput,
  MDBCheckbox,
  MDBBtn,
  MDBIcon,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
} from "mdb-react-ui-kit";
import io from "socket.io-client";
import BirthdayPicker from "./BirthdayPicker";
import { useState } from "react";
import { initializeSocket, disconnectSocket } from "../api/socketManager"
import api from "../api/axios";
import { useDispatch, useSelector } from "react-redux";
import {
  setEmail,
  setPassword,
  setRePassword,
  setName,
  setPhone,
  setAddress,
  resetRegState,
} from "../features/registerSlice";
import {
  setLoginEmail,
  setLoginPassword,
  resetLoginState,
} from "../features/loginSlice";
import { setLoggedIn, setUserOb, setAlertMsg } from "../features/authSlice";
import { setUpdate } from "../features/feedSlice";
import { useNavigate } from "react-router-dom";

export default function RegisterCheck({ route, changeAlert }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loginRegisterActive, setLoginRegisterActive] = useState("register");

  const email = useSelector((state) => state.register.email);
  const password = useSelector((state) => state.register.password);
  const rePassword = useSelector((state) => state.register.rePassword);
  const name = useSelector((state) => state.register.name);
  const date = useSelector((state) => state.register.date);
  const phone = useSelector((state) => state.register.phone);
  const address = useSelector((state) => state.register.address);
  const loginEmail = useSelector((state) => state.login.loginEmail);
  const loginPassword = useSelector((state) => state.login.loginPassword);

  useEffect(() => {
    if (route === "login") setLoginRegisterActive("login");
    else setLoginRegisterActive("register");
  }, [route]);

  const successLogin = (data) => {
    dispatch(setLoggedIn(true));
    dispatch(setUserOb(data.userOb));
    initializeSocket(data.userOb._id);
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };




  const handleLogin = () => {
    api
      .post("/login", {
        email: loginEmail,
        password: loginPassword,
      })
      .then((res) => {
        changeAlert("You have logged in successfully!");
        successLogin(res.data);
      })
      .catch((err) => {
        changeAlert("Wrong email or password, please try again!");
      });
  };
  const handleRegister = () => {
    if (password !== rePassword) {
      changeAlert("Passwords do not match!");
      return;
    }
    if (password.length < 8) {
      changeAlert("Password must be at least 8 characters long!");
      return;
    }
    if (!address) {
      changeAlert("Please fill in your address!");
      return;
    }
    if (!phone) {
      changeAlert("Please fill in your phone number!");
      return;
    }

    if (!date) {
      changeAlert("Please fill in your date of birth!");
      return;
    }
    if (date > Date.now()) {
      changeAlert("Please fill in a valid date of birth!");
      return;
    }
    api
      .post("/register", {
        email: email,
        password: password,
        name: name,
        address: address,
        phone: phone,
        birthday: new Date(date),
      })
      .then((res) => {
        changeAlert("You have signed up to our service successfully!"
        );
        successLogin(res.data);
      })
      .catch((err) => {
        changeAlert("This email address is already in use!");
      });
    dispatch(resetRegState());
  };

  const handleSubmit = (action) => {
    if (loginRegisterActive == "login") {
      if (loginEmail == "" || loginPassword == "") {
        changeAlert("Please fill in your email address and password");
        return;
      }
      if (!/\S+@\S+\.\S+/.test(loginEmail)) {
        changeAlert("Please enter a valid email address");
        return;
      }
      handleLogin();
    } else {
      if (!name) {
        changeAlert("Please fill in your name");
        return;
      } else if (!email) {
        changeAlert("Please fill in your email address");
        return;
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        changeAlert("Please enter a valid email address");
        return;
      } else if (!password) {
        changeAlert("Please fill in your password");
        return;
      }
      handleRegister();
    }
  }


return (
  <div className="ml7 mr7 mt3 shadow-4" style={{ borderRadius: "20px" }}>
    <div className="pa4">
      <MDBTabs pills justify className="mb-3">
        <MDBTabsItem>
          <MDBTabsLink
            onClick={() => setLoginRegisterActive("login")}
            active={loginRegisterActive === "login"}
            style={{ borderRadius: "15px" }}
          >
            Login
          </MDBTabsLink>
        </MDBTabsItem>
        <MDBTabsItem>
          <MDBTabsLink
            onClick={() => {
              dispatch(resetLoginState());
              setLoginRegisterActive("register");
            }}
            style={{ borderRadius: "15px" }}
            active={loginRegisterActive === "register"}
          >
            Register
          </MDBTabsLink>
        </MDBTabsItem>
      </MDBTabs>

      <MDBTabsContent>
        <MDBTabsPane show={loginRegisterActive === "login"}>
          <form>
            <div className="text-center mb-3">
              <p>Sign up with:</p>

              <MDBBtn floating color="secondary" className="mx-1">
                <MDBIcon fab icon="facebook-f" />
              </MDBBtn>

              <MDBBtn floating color="secondary" className="mx-1">
                <MDBIcon fab icon="google" />
              </MDBBtn>

              <MDBBtn floating color="secondary" className="mx-1">
                <MDBIcon fab icon="twitter" />
              </MDBBtn>

              <MDBBtn floating color="secondary" className="mx-1">
                <MDBIcon fab icon="github" />
              </MDBBtn>
            </div>

            <p className="text-center">or:</p>

            <MDBInput
              className="mb-4"
              type="email"
              id="loginEmailInput"
              label="Email address"
              value={loginEmail || ''}
              onChange={(e) => {
                dispatch(setLoginEmail(e.target.value));
              }}
            />
            <MDBInput
              className="mb-4"
              type="password"
              id="loginPassInput"
              autoComplete="on"
              label="Password"
              value={loginPassword || ''}
              onChange={(e) => {
                dispatch(setLoginPassword(e.target.value));
              }}
            />

            <MDBRow className="mb-4">
              <MDBCol className="d-flex justify-content-center"></MDBCol>
            </MDBRow>

            <MDBBtn
              type="submit"
              className="mb-4 "
              style={{ borderRadius: "15px" }}
              block
              onClick={(e) => {
                e.preventDefault();
                handleSubmit("login");

              }}
            >
              Sign in
            </MDBBtn>

            <div className="text-center">
              <p>
                Not a member?{" "}
                <a
                  href="#"
                  onClick={() => {
                    setLoginRegisterActive("register");
                    navigate("/register");
                  }}
                >
                  Register
                </a>
              </p>
            </div>
          </form>
        </MDBTabsPane>
        <MDBTabsPane show={loginRegisterActive === "register"}>
          <form>
            <div className="text-center mb-3">
              <p>Sign up with:</p>

              <MDBBtn floating color="secondary" className="mx-1">
                <MDBIcon fab icon="facebook-f" />
              </MDBBtn>

              <MDBBtn floating color="secondary" className="mx-1">
                <MDBIcon fab icon="google" />
              </MDBBtn>

              <MDBBtn floating color="secondary" className="mx-1">
                <MDBIcon fab icon="twitter" />
              </MDBBtn>

              <MDBBtn floating color="secondary" className="mx-1">
                <MDBIcon fab icon="github" />
              </MDBBtn>
            </div>

            <p className="text-center">or:</p>

            <MDBInput
              className="mb-4"
              id="fullNameInput"
              label="Full Name"
              value={name || ''}
              onChange={(e) => {
                dispatch(setName(e.target.value));
              }}
            />
            <MDBInput
              className="mb-4"
              type="email"
              id="emailInput"
              label="Email address"
              value={email || ''}
              onChange={(e) => {
                dispatch(setEmail(e.target.value));
              }}
            />
            <MDBInput
              className="mb-4"
              type="password"
              id="passInput"
              autoComplete="on"
              label="Password"
              value={password || ''}
              onChange={(e) => {
                dispatch(setPassword(e.target.value));
              }}
            />
            <MDBInput
              className="mb-4"
              type="password"
              id="rePassInput"
              autoComplete="on"
              label="Repeat password"
              value={rePassword || ''}
              onChange={(e) => {
                dispatch(setRePassword(e.target.value));
              }}
            />
            <MDBInput
              className="mb-4"
              id="addressInput"
              label="Address"
              value={address || ''}
              onChange={(e) => {
                dispatch(setAddress(e.target.value));
              }}
            />
            <MDBInput
              className="mb-4"
              id="phoneInput"
              type="number"
              label="Phone"
              value={phone || ''}
              onChange={(e) => {
                dispatch(setPhone(e.target.value));
              }}
            />
            <BirthdayPicker />

            <MDBCheckbox
              wrapperClass="d-flex justify-content-center mb-4"
              id="form8Example6"
              label="I have read and agree to the terms"
              defaultChecked
            />

            <MDBBtn
              type="submit"
              className="mb-4"
              style={{ borderRadius: "15px" }}
              block
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();

              }}
            >
              Sign up
            </MDBBtn>
            <div className="text-center">
              <p>
                Already have an account? <a href="/login">Sign in</a>
              </p>
            </div>
          </form>
        </MDBTabsPane>
      </MDBTabsContent>
    </div>
  </div>
);
  }
