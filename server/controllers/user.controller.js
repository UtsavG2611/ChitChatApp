import { generateJWTToken } from "../utils/jwtToken.js";
import{catchAsyncError} from "../middlewares/catchAsyncError.middleware.js";
import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";
import mongoose from "mongoose";

export const signup = catchAsyncError(async(req,res,next) => {
    try {
        console.log("Signup request body:", req.body);
        const { fullName, email, password } = req.body;
        
        if(!fullName|| !email|| !password){
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields.",
            });
        }
        
        const emailRegex = /^\S+@\S+\.\S+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({
                success: false,
                message: "Email not valid"
            });
        }
        
        if(password.length < 8){
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long."
            });
        }
        
        const isEmailAlreadyUsed = await User.findOne({email});
        if(isEmailAlreadyUsed){
            return res.status(400).json({
                success: false,
                message: "Email is already registered."
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Creating user with:", { fullName, email, hashedPassword: hashedPassword.substring(0, 20) + "..." });
        
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            avatar:{
                public_id:"",
                url: "",
            },
        });
        
        console.log("User created successfully:", user._id);
        generateJWTToken(user, "User registered successfully", 201, res);
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Registration failed. Please try again."
        });
    }
});
export const signin = catchAsyncError(async(req,res,next) => {
    try {
        const {email, password}= req.body;
        console.log("Login attempt for email:", email);
        
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"Please provide email and password."
            });
        }
        
        const emailRegex = /^\S+@\S+\.\S+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({
                success: false,
                message: "Email not valid"
            });
        }
        
        // Check if MongoDB is connected before attempting to query
        if (mongoose.connection.readyState !== 1) {
            console.log("Database connection is not established, using test account");
            
            // For testing purposes only - allow login with test credentials when DB is down
            if (email === "test@example.com" && password === "password123") {
                const mockUser = {
                    _id: "mock123456789",
                    fullName: "Test User",
                    email: "test@example.com",
                    avatar: {
                        public_id: "",
                        url: "",
                    }
                };
                
                return generateJWTToken(mockUser, "Login successful with test account", 200, res);
            }
            
            return res.status(503).json({
                success: false,
                message: "Database connection error. Please try again later.",
                dbStatus: "disconnected"
            });
        }
        
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found. Please register.",
            });
        }
        
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if(!isPasswordMatched){
            return res.status(400).json({
                success: false,
                message: "Invalid credentials.",
            });
        }
        
        console.log("User authenticated successfully:", user._id);
        generateJWTToken(user, "User logged in Successfully", 200, res);
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Login failed. Please try again."
        });
    }

});
export const signout = catchAsyncError(async(req,res,next) => {
    const isDev = process.env.NODE_ENV === "development" && process.env.RENDER !== "true";
    res.status(200).cookie("token", "", {
        maxAge: 0,
        httpOnly: true,
        sameSite: isDev ? "lax" : "none",
        secure: isDev ? false : true,
    })
    .json({
        success: true,
        message: "User logged out successfully!",
    });
});
export const getUser = catchAsyncError(async(req,res,next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user
    });
});
export const updateProfile = catchAsyncError(async(req,res,next) => {
    const {fullName , email} = req.body;
    if(fullName?.trim().length ===0 || email?.trim().length === 0 ){
        return res.status(400).json({
            success: false,
            message: "Fullname and email can't be empty."
        });
    }
    const avatar = req?.files?.avatar;
    let cloudinaryResponse = {};

    if(avatar){
        try {
            const oldAvatarPublicId = req.user?.avatar?.public_id;
            if(oldAvatarPublicId && oldAvatarPublicId.length>0){
                await cloudinary.uploader.destroy(oldAvatarPublicId);
            }
            cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath,{
                folder:"ChitChat_AVATARS",
                transformation:[
                    {width:300, height:300, crop:"limit"},
                    {quality: "auto"},
                    {fetch_format: "auto"},
                ],
            });
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({
                success:false,
                message: "Failed to upload avatar. Please try again later.",
            });
        }
    }
    let data = {
        fullName,
        email
    };
    if(avatar && cloudinaryResponse?.public_id && cloudinaryResponse?.secure_url){
        data.avatar={
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        };
    }
    let user = await User.findByIdAndUpdate(req.user._id,data,{
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success:true,
        message: "profile updated successfully!",
        user
    });
});

export const updateAvatar = catchAsyncError(async(req,res,next) => {
    const avatar = req?.files?.avatar;
    
    if(!avatar){
        return res.status(400).json({
            success: false,
            message: "Please provide an avatar image."
        });
    }

    try {
        // Delete old avatar if exists
        const oldAvatarPublicId = req.user?.avatar?.public_id;
        if(oldAvatarPublicId && oldAvatarPublicId.length > 0){
            await cloudinary.uploader.destroy(oldAvatarPublicId);
        }

        // Upload new avatar
        const cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath, {
            folder: "ChitChat_AVATARS",
            transformation: [
                {width: 300, height: 300, crop: "limit"},
                {quality: "auto"},
                {fetch_format: "auto"},
            ],
        });

        // Update user with new avatar
        const user = await User.findByIdAndUpdate(req.user._id, {
            avatar: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            }
        }, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Avatar updated successfully!",
            user
        });
    } catch (error) {
        console.error("Avatar upload error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to upload avatar. Please try again later.",
        });
    }
});
 