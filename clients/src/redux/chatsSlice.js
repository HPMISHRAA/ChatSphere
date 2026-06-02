import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { fetchAllChats } from '../apis/chat';
const initialState = {
  chats: [],
  activeChat: '',
  isLoading: false,
  notifications: [],
};
export const fetchChats = createAsyncThunk('redux/chats', async () => {
  try {
    const data = await fetchAllChats();
    return data;
  } catch (error) {
    toast.error('Something Went Wrong!Try Again');
  }
});
const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setActiveChat: (state, { payload }) => {
      state.activeChat = payload;
    },
    setNotifications: (state, { payload }) => {
      state.notifications = payload;
    },
    updateUserPresence: (state, { payload }) => {
      const { userId, isOnline, lastSeen } = payload;
      
      // Update in activeChat
      if (state.activeChat && state.activeChat.users) {
        state.activeChat.users = state.activeChat.users.map(u => 
          u._id === userId ? { ...u, isOnline, lastSeen } : u
        );
      }
      
      // Update in all chats
      state.chats = state.chats.map(chat => {
        if (!chat.users) return chat;
        return {
          ...chat,
          users: chat.users.map(u => 
            u._id === userId ? { ...u, isOnline, lastSeen } : u
          )
        };
      });
    },
  },
  extraReducers: {
    [fetchChats.pending]: (state) => {
      state.isLoading = true;
    },
    [fetchChats.fulfilled]: (state, { payload }) => {
      state.chats = payload;
      state.isLoading = false;
    },
    [fetchChats.rejected]: (state) => {
      state.isLoading = false;
    },
  },
});
export const { setActiveChat, setNotifications, updateUserPresence } = chatsSlice.actions;
export default chatsSlice.reducer;
