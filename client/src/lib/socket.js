import {io} from "socket.io-client";

let socket = null;

export const connectSocket = (userId)=>{
    console.log("Connecting socket for user:", userId);
    const socketUrl = import.meta.env.VITE_SERVER_URL || (import.meta.env.MODE === "development" ? "http://localhost:4000" : "/");
    socket = io(socketUrl, {
        query: { userId: userId || "" },
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
    });
    
    // Make socket globally accessible for notifications
    window.socket = socket;

    socket.on("connect", () => {
        console.log("Socket connected with ID:", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
    });

    return socket;
};

export const getSocket = ()=> socket;
export const disconnectSocket = ()=>{
    if(socket){
        socket.disconnect();
        socket = null;
        window.socket = null;
    }
}