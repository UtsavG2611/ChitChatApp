import express from 'express';
import cookieParser from 'cookie-parser';
import {config} from "dotenv"
import fileUpload from 'express-fileupload';
import cors from "cors";
import { dbConnection } from './database/db.js';
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
config({path: "./config/config.env"});

app.use(cors({
    origin: process.env.NODE_ENV === "development" ? ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"] : [process.env.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
});

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "./temp/",
    })
);

// Add status endpoint to check database connection
app.get("/api/v1/status", (req, res) => {
    const mongoose = require('mongoose');
    const connectionState = mongoose.connection.readyState;
    const stateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    const status = stateMap[connectionState] || 'unknown';
    
    if (status === 'connected') {
        return res.status(200).json({
            success: true,
            message: 'Database connection is active',
            dbStatus: status
        });
    } else {
        return res.status(503).json({
            success: false,
            message: 'Database connection is not available',
            dbStatus: status
        });
    }
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    // Determine the path to the client's build directory
    // Assuming the structure is root/server and root/client
    const clientBuildPath = path.join(__dirname, "../client/dist");
    
    app.use(express.static(clientBuildPath));
    
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(clientBuildPath, "index.html"));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});

// Initialize database connection
const dbConnected = await dbConnection();

// If database connection fails, log error but allow server to start
if (!dbConnected) {
    console.error('WARNING: Server starting without database connection');
    // Set up a route to inform clients about DB connection status
    app.use('/api/v1/status', (req, res) => {
        res.status(503).json({
            success: false,
            message: 'Database connection failed. Please try again later.',
            dbStatus: 'disconnected'
        });
    });
}

export default app;