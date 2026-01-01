import React, { useState } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatBody from "../components/chat/ChatBody";

const Chat = () => {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="flex w-full h-full bg-white rounded-lg shadow overflow-hidden">

      {/* Sidebar (Left) */}
      <ChatSidebar activeChat={activeChat} setActiveChat={setActiveChat} />

      {/* Main Chat Window */}
      <div className="flex-1 bg-chat-bg relative">
        {activeChat ? (
          <ChatBody chat={activeChat} setActiveChat={setActiveChat} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Select a chat to start messaging
          </div>
        )}
      </div>

    </div>
  );
};

export default Chat;
