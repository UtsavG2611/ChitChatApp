import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";
import { catchAsyncError } from "./catchAsyncError.middleware.js";

export const isAuthenticated = catchAsyncError(async(req, res, next)=>{
    let token = req.cookies.token;
    
    // Check Authorization header if cookie is missing
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Debug logging for auth issues
    if (!token) {
        console.log("Auth failed: No token found in cookies or Authorization header");
        console.log("Cookies:", req.cookies);
        console.log("Headers:", req.headers.authorization ? "Present" : "Missing");
    }

    if(!token){
        return(
            res.status(401).json({
                success: false,
                message: "User not authenticated, Please sign in.",
            })
        );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if(!decoded){
        return res.status(500).json({
            success:false,
            message: "Token verification failed, Please sign in again.",
        })
    }
    const user = await User.findById(decoded.id);
    req.user = user;
    next();
});   