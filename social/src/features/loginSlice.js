import { createSlice } from '@reduxjs/toolkit'


const initialState = {
loginEmail:null,
loginPassword:null,
};

export const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        setLoginEmail: (state, action) => {
            state.loginEmail = action.payload;
        },
        setLoginPassword: (state, action) => {
            state.loginPassword = action.payload;
        },
        resetLoginState: () => initialState
    },
})


export const {setLoginEmail, setLoginPassword, resetLoginState} = loginSlice.actions

export default loginSlice.reducer