import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoggedIn: false,
  userOb: null,
  alertMsg: '',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setUserOb: (state, action) => {
      state.userOb = action.payload;
    },
    setInterests: (state, action) => {
      state.userOb.interests = action.payload.split(',').map((interest) => interest.trim());
    },
    setAlertMsg: (state, action) => {
      state.alertMsg = action.payload;
    },
    logout: (state) => {
      return initialState;
    },
  },
})

export const { setLoggedIn, setUserOb,setInterests, setAlertMsg, logout } = authSlice.actions

export default authSlice.reducer