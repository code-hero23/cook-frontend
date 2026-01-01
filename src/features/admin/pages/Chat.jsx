import React from "react";
import ChatInterface from "../../../shared/components/ChatInterface";
import { useApp } from "../context/AppContext";

const Chat = () => {
  const { projects } = useApp();
  // Admin user object (simulated or from auth context if available)
  const currentUser = { name: "Admin", id: "admin" }; 

  return (
    <div className="p-6 h-full">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Support & Chat</h1>
      <ChatInterface 
        projects={projects} 
        currentUser={currentUser} 
        role="ADMIN" 
      />
    </div>
  );
};

export default Chat;
