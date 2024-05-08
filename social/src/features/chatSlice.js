import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    currentChat: null,
    currentChatContent: []
};

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setCurrentChat: (state, action) => {
            state.currentChat = action.payload;
        },
        setCurrentChatContent: (state, action) => {
            state.currentChatContent = action.payload;
        },
        addMessage: (state, action) => {
            state.currentChatContent.push(action.payload);
        },
        removeMessage: (state, action) => {
            state.currentChatContent = state.currentChatContent.filter(message => message.uniqueid !== action.payload.uniqueid);
        }
    },
});

// Action creators are generated for each case reducer function
export const { setCurrentChat, setCurrentChatContent, addMessage, removeMessage } = chatSlice.actions;

export default chatSlice.reducer;
