import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";

const Home = () => {
  const { selectedChat } = useSelector((state) => state.chat);

  return (
    <div className="flex h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - hidden on mobile when chat is selected */}
      <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-80 flex-shrink-0 h-full`}>
        <Sidebar />
      </div>
      
      {/* Chat area - full width on mobile */}
      <div className={`${selectedChat ? 'block' : 'hidden md:block'} flex-1 flex flex-col h-full`}>
        {selectedChat ? <ChatContainer /> : <NoChatSelected />}
      </div>
    </div>
  );
};

export default Home;
