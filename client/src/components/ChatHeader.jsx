import { X, User, Circle, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedChat } from "../store/slices/chatSlice";

const ChatHeader = () => {
  const { selectedChat } = useSelector((state) => state.chat);
  const { onlineUsers } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleCloseChat = () => {
    dispatch(setSelectedChat(null));
  };

  const isOnline = onlineUsers.includes(selectedChat?._id);

  if (!selectedChat) return null;

  return (
    <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile back button */}
        <button
          onClick={handleCloseChat}
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Back to chats"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            {selectedChat.avatar?.url ? (
              <img
                src={selectedChat.avatar.url}
                alt={selectedChat.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1">
            <Circle 
              className={`w-4 h-4 ${isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 dark:text-gray-500'}`} 
            />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white">{selectedChat.fullName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'}`}></span>
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Desktop close button */}
        <button
          onClick={handleCloseChat}
          className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Close chat"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
