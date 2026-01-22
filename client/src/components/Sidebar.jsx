import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance } from "../lib/axios";
import { setSelectedChat, fetchMessages } from "../store/slices/chatSlice";
import { User } from "lucide-react";
import { playNotificationSound, showBrowserNotification } from "../utils/notification";

const Sidebar = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({});
  const { authUser, onlineUsers } = useSelector((state) => state.auth);
  const { selectedChat } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/message/users");
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchUsers();
    }
  }, [authUser]);

  const handleUserSelect = async (user) => {
    dispatch(setSelectedChat(user));
    // Clear notification for this user
    setNotifications(prev => ({
      ...prev,
      [user._id]: 0
    }));
    // Fetch messages for the selected user
    try {
      await dispatch(fetchMessages(user._id)).unwrap();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Listen for new messages and add notifications
  useEffect(() => {
    const handleNewMessage = (message) => {
      console.log("Sidebar received new message:", message);
      // Only add notification if message is from someone else and not from selected chat
      if (message.senderId !== authUser?._id && selectedChat?._id !== message.senderId) {
        console.log("Adding notification for user:", message.senderId);
        setNotifications(prev => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1
        }));
        
        // Play notification sound
        playNotificationSound();
        
        // Show browser notification
        const sender = users.find(user => user._id === message.senderId);
        if (sender) {
          showBrowserNotification(
            `New message from ${sender.fullName}`,
            message.text || 'Sent you a message',
            sender.avatar?.url
          );
        }
      }
    };

    // Add event listener for new messages
    const socket = window.socket;
    if (socket) {
      socket.on("newMessage", handleNewMessage);
    }

    return () => {
      if (socket) {
        socket.off("newMessage", handleNewMessage);
      }
    };
  }, [authUser, selectedChat, users]);

  if (loading) {
    return (
      <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Chats</h2>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Chats</h2>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => handleUserSelect(user)}
            className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              selectedChat?._id === user._id ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  {user.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                {/* Online indicator */}
                {onlineUsers.includes(user._id) && (
                  <div className="absolute -bottom-1 -right-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 dark:text-white">{user.fullName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${onlineUsers.includes(user._id) ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'}`}></span>
                  {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                </p>
              </div>
              
              {/* Notification badge */}
              {notifications[user._id] > 0 && (
                <div className="flex-shrink-0 ml-auto">
                  <div className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                    {notifications[user._id] > 9 ? '9+' : notifications[user._id]}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
