import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/authSlice'
import registerReducer from '../features/registerSlice'
import loginReducer from '../features/loginSlice'
import feedReducer from '../features/feedSlice'
import chatReducer from '../features/chatSlice'



export const store = configureStore({
  reducer: {
    auth: authReducer,
    register: registerReducer,
    login: loginReducer,
    feed: feedReducer,
    chat : chatReducer

  },
})