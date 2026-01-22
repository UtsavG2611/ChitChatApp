import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { connectSocket } from "../../lib/socket";

export const login = createAsyncThunk("auth/login", async (credentials, thunkAPI) => {
    try {
        // First check if the server and database are available
        try {
            // Optional: Check server status before attempting login
            await axiosInstance.get("/status");
        } catch (statusError) {
            // If status check fails with 503, it's a database connection issue
            if (statusError.response?.status === 503) {
                return thunkAPI.rejectWithValue({
                    success: false,
                    message: "Database connection error. Please try again later.",
                    dbStatus: "disconnected"
                });
            }
        }
        
        const res = await axiosInstance.post("/user/sign-in", credentials);
        // After successful login, fetch user data
        const userRes = await axiosInstance.get("/user/me");
        return userRes.data.user;
    } catch (error) {
        // Handle specific error codes
        if (error.response?.status === 503) {
            return thunkAPI.rejectWithValue({
                success: false,
                message: "Database connection error. Please try again later.",
                dbStatus: "disconnected"
            });
        }
        return thunkAPI.rejectWithValue(error.response?.data || "Login failed");
    }
});

export const signup = createAsyncThunk("auth/signup", async (userData, thunkAPI) => {
    try {
        const res = await axiosInstance.post("/user/sign-up", userData);
        // After successful signup, fetch user data
        const userRes = await axiosInstance.get("/user/me");
        return userRes.data.user;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || "Signup failed");
    }
});

export const getUser = createAsyncThunk("user/me", async(_, thunkAPI)=> {
    try {
        const res = await axiosInstance.get("/user/me");
        connectSocket(res.data.user._id);
        return res.data.user;
    } catch (error) {
        console.log("Error fetching user:", error);
        return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch user");
    }
});

const authSlice = createSlice({
    name : "auth",
    initialState: {
        authUser: null,
        isSigningUp:false,
        isLoggingIn:false,
        isUpdatingProfile:false,
        isCheckingAuth: true,
        onlineUsers: [],
        error: null,
    },
    reducers:{
        setOnlineUsers(state, action){
            state.onlineUsers = action.payload;
        },
        logout(state) {
            state.authUser = null;
            state.onlineUsers = [];
            state.error = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder)=>{
        builder
        // Login cases
        .addCase(login.pending, (state) => {
            state.isLoggingIn = true;
            state.error = null;
        })
        .addCase(login.fulfilled, (state, action) => {
            state.isLoggingIn = false;
            state.authUser = action.payload;
            state.isCheckingAuth = false;
        })
        .addCase(login.rejected, (state, action) => {
            state.isLoggingIn = false;
            state.authUser = null;
            state.isCheckingAuth = false;
            state.error = action.payload;
        })
        // Signup cases
        .addCase(signup.pending, (state) => {
            state.isSigningUp = true;
            state.error = null;
        })
        .addCase(signup.fulfilled, (state, action) => {
            state.isSigningUp = false;
            state.authUser = action.payload;
            state.isCheckingAuth = false;
        })
        .addCase(signup.rejected, (state, action) => {
            state.isSigningUp = false;
            state.authUser = null;
            state.isCheckingAuth = false;
            state.error = action.payload;
        })
        // Get user cases
        .addCase(getUser.fulfilled, (state,action)=>{
            state.authUser = action.payload;
            state.isCheckingAuth = false;
        })
        .addCase(getUser.rejected, (state,action)=>{
            state.authUser = null;
            state.isCheckingAuth = false;
        });
    },
});

export const {setOnlineUsers, logout, clearError} = authSlice.actions;
export default authSlice.reducer;