import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    email: null,
    password: null,
    rePassword: null,
    name: null,
    date: null,
    phone: null,
    address: null,

};

export const registerSlice = createSlice({
    name: 'register',
    initialState,
    reducers: {
        setEmail: (state, action) => {
            state.email = action.payload;
        },
        setPassword: (state, action) => {
            state.password = action.payload;
        },
        setRePassword: (state, action) => {
            state.rePassword = action.payload;
        },
        setName: (state, action) => {
            state.name = action.payload;
        },
        setDate: (state, action) => {
            state.date = action.payload;
        },
        setPhone: (state, action) => {
            state.phone = action.payload;
        },
        setAddress: (state, action) => {
            state.address = action.payload;
        },
        resetRegState: () => initialState
    },
})


export const { setEmail, setPassword, setRePassword, setName, setDate, setPhone, setAddress, resetRegState } = registerSlice.actions

export default registerSlice.reducer