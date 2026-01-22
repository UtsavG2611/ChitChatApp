import { useState } from "react";
import { format } from "date-fns";
import { Image, Play, Download, File, X, Maximize2 } from "lucide-react";

const MessageBubble = ({ message, isOwnMessage, senderName }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), "HH:mm");
    } catch {
      return "00:00";
    }
  };

  const isImage = (url) => {
    return url && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(url);
  };

  const isVideo = (url) => {
    return url && /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  const isFile = (url) => {
    return url && !isImage(url) && !isVideo(url);
  };

  const getFileExtension = (url) => {
    if (!url) return "";
    const match = url.match(/\.([^.]+)$/);
    return match ? match[1].toUpperCase() : "";
  };

  const getFileName = (url) => {
    if (!url) return "File";
    const parts = url.split("/");
    return parts[parts.length - 1] || "File";
  };

    return (
    <>
      <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[280px] sm:max-w-xs lg:max-w-md ${isOwnMessage ? "order-2" : "order-1"}`}>
          {/* Sender Name (for received messages) */}
          {!isOwnMessage && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-2">
              {senderName}
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`rounded-2xl px-4 py-2 shadow-sm ${
              isOwnMessage
                ? "bg-blue-600 text-white rounded-br-md"
                : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-600"
            }`}
          >
            {/* Text Message */}
            {message.text && (
              <div className="mb-2">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.text}
                </p>
              </div>
            )}

            {/* Media Content */}
            {message.media && (
              <div className="mb-2">
                {/* Image */}
                {isImage(message.media) && (
                  <div className="relative group">
                    <img
                      src={message.media}
                      alt="Shared image"
                      className={`rounded-lg max-w-full h-auto cursor-pointer ${
                        imageLoaded ? "opacity-100" : "opacity-0"
                      } transition-opacity duration-300 hover:opacity-90`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                      onClick={() => setShowImageModal(true)}
                    />
                    {!imageLoaded && !imageError && (
                      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    {imageError && (
                      <div className="bg-gray-200 dark:bg-gray-600 rounded-lg p-4 flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">Image failed to load</span>
                      </div>
                    )}
                    
                    {/* Image overlay with expand and download buttons */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowImageModal(true)}
                          className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                          title="View full size"
                        >
                          <Maximize2 className="w-4 h-4 text-gray-700" />
                        </button>
                        <a
                          href={message.media}
                          download
                          className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                          title="Download image"
                        >
                          <Download className="w-4 h-4 text-gray-700" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video */}
                {isVideo(message.media) && (
                  <div className="relative group">
                    <video
                      controls
                      className="rounded-lg max-w-full h-auto"
                      preload="metadata"
                    >
                      <source src={message.media} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                )}

                {/* File */}
                {isFile(message.media) && (
                  <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-3 flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <File className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                        {getFileName(message.media)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getFileExtension(message.media)} file
                      </p>
                    </div>
                    <a
                      href={message.media}
                      download
                      className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Timestamp */}
            <div className={`text-xs ${isOwnMessage ? "text-blue-100" : "text-gray-500 dark:text-gray-400"} text-right`}>
              {formatTime(message.createdAt)}
            </div>
          </div>
        </div>

        {/* Avatar (for received messages) */}
        {!isOwnMessage && (
          <div className="order-2 ml-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">
                {senderName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={message.media}
              alt="Full size image"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Modal controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <a
                href={message.media}
                download
                className="p-3 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                title="Download image"
              >
                <Download className="w-5 h-5 text-gray-700" />
              </a>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-3 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                title="Close"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageBubble;