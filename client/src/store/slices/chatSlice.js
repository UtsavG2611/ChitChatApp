import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

// Async thunk for fetching messages
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (receiverId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/message/${receiverId}`);
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch messages");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    selectedChat: null,
    messages: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
      // Clear messages when selecting a new chat
      if (action.payload) {
        state.messages = [];
      }
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      // Check if message already exists to avoid duplicates
      const exists = state.messages.find(msg => msg._id === action.payload._id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setSelectedChat, 
  setMessages, 
  addMessage, 
  setLoading, 
  clearError, 
  clearMessages 
} = chatSlice.actions;

export default chatSlice.reducer;
