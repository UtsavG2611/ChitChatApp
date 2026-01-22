import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Welcome to ChitChat</h2>
        <p className="text-gray-500 dark:text-gray-400">Select a chat to start messaging</p>
      </div>
    </div>
  );
};

export default NoChatSelected;
