import { Image, Send, X, Video, Paperclip, Smile } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addMessage } from "../store/slices/chatSlice";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-toastify";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [textareaRows, setTextareaRows] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const { selectedChat } = useSelector((state) => state.chat);
  const { authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || isUploading) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("text", message.trim());
      
      if (selectedFile) {
        formData.append("media", selectedFile);
      }

      const response = await axiosInstance.post(`/message/send/${selectedChat._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Add message to local state
      const newMessage = {
        ...response.data,
        senderId: authUser._id,
        createdAt: new Date().toISOString(),
      };
      
      dispatch(addMessage(newMessage));
      
      setMessage("");
      setSelectedFile(null);
      setTextareaRows(1);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea with more stable behavior
    const textarea = e.target;
    const currentHeight = textarea.style.height;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 120);
    
    // Only update height if there's a significant change (more than 10px difference)
    const currentHeightNum = parseInt(currentHeight) || 44;
    if (Math.abs(newHeight - currentHeightNum) > 10) {
      textarea.style.height = `${newHeight}px`;
      
      // Only update rows if there's a significant change (more than 1 row difference)
      const currentRows = Math.ceil(newHeight / 24);
      if (Math.abs(currentRows - textareaRows) >= 1) {
        setTextareaRows(Math.min(currentRows, 5));
      }
    } else {
      // Reset to current height if change is minimal
      textarea.style.height = currentHeight;
    }
  };

  // Reset textarea height when message is cleared
  useEffect(() => {
    if (message === "" && textareaRef.current) {
      textareaRef.current.style.height = "44px";
      setTextareaRows(1);
    }
  }, [message]);

  const handleEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getFileIcon = () => {
    if (!selectedFile) return <Paperclip className="w-5 h-5" />;
    
    const fileName = selectedFile.name.toLowerCase();
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)) {
      return <Image className="w-5 h-5" />;
    } else if (fileName.match(/\.(mp4|webm|ogg|mov)$/)) {
      return <Video className="w-5 h-5" />;
    } else {
      return <Paperclip className="w-5 h-5" />;
    }
  };

  if (!selectedChat) return null;

  return (
    <div className="p-2 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                {getFileIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div className="flex items-end gap-2 md:gap-3">
        <div className="flex-1">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={textareaRows}
              style={{ minHeight: "44px", maxHeight: "120px", overflowY: "auto" }}
            />
            
            {/* Emoji button */}
            <button
              onClick={toggleEmojiPicker}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
              title="Add emoji"
            >
              <Smile className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50" ref={emojiPickerRef}>
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={window.innerWidth < 640 ? 280 : 280}
                  height={window.innerWidth < 640 ? 300 : 350}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* File attachment button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,application/pdf,text/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={(!message.trim() && !selectedFile) || isUploading}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            title="Send message"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
