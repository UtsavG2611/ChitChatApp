import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getUser, setOnlineUsers } from "./store/slices/authSlice";
import { addMessage } from "./store/slices/chatSlice";
import { connectSocket, disconnectSocket } from "./lib/socket";
import { initNotifications } from "./utils/notification";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "./context/ThemeContext";

const App = () => {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
    // Initialize notifications
    initNotifications();
  }, [dispatch]);

  useEffect(() => {
    if (authUser) {
      console.log("Setting up socket connection for user:", authUser._id);
      const socket = connectSocket(authUser._id || "");

      socket.on("getOnlineUsers", (users) => {
        console.log("Received online users:", users);
        dispatch(setOnlineUsers(users));
      });

      socket.on("newMessage", (message) => {
        console.log("Received new message:", message);
        dispatch(addMessage(message));
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error in App:", error);
      });

      return () => {
        console.log("Disconnecting socket");
        disconnectSocket();
      };
    }
  }, [authUser, dispatch]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
          <Navbar />
          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />} />
              <Route path="/register" element={!authUser ? <Register /> : <Navigate to="/" />} />
              <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
              <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/login" />} />
            </Routes>
          </div>
          <ToastContainer />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;