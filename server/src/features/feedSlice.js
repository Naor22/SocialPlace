import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    update: false,
    posts: null, 
};

export const feedSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUpdate: (state, action) => {
            state.update = !state.update
        },
        setPosts: (state, action) => {
            state.posts = action.payload;
        },
        
    },
})

export const { setUpdate, setPosts } = feedSlice.actions

export default feedSlice.reducer