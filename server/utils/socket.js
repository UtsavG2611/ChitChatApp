import {Server, Socket} from "socket.io";

const userSocketMap = {};

let io;

export function initSocket(server){
    io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === "development" ? ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"] : [process.env.FRONTEND_URL],
            credentials: true,
        },
    });

    io.on("connection", (socket)=>{
        console.log("A user connected to the server", socket.id)

        const userId = socket.handshake.query.userId;
        console.log("User ID from query:", userId);

        if(userId) {
            userSocketMap[userId] = socket.id;
            console.log("User added to socket map:", userId, "->", socket.id);
        }

        // Emit online users immediately
        const onlineUsers = Object.keys(userSocketMap);
        console.log("Online users:", onlineUsers);
        io.emit("getOnlineUsers", onlineUsers);

        socket.on("disconnect", ()=>{
            console.log("A user disconnect", socket.id);
            if(userId) {
                delete userSocketMap[userId];
                console.log("User removed from socket map:", userId);
            }
            const remainingUsers = Object.keys(userSocketMap);
            console.log("Remaining online users:", remainingUsers);
            io.emit("getOnlineUsers", remainingUsers);
        });
    });
}

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}
export {io};