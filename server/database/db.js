import mongoose from "mongoose";

export const dbConnection = async () => {
    try {
        // Set mongoose options
        mongoose.set('strictQuery', false);
        
        // Attempt to connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "CHIT_CHAT",
            // Removed deprecated options
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (err) {
        console.error(`Error connecting to database: ${err.message || err}`);
        console.log('Make sure MongoDB is running on your system');
        return false;
    }
};