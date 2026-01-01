import React, { useState } from "react";
import { useToast } from "../components/ToastProvider";
import { MessageSquare, Send, Plus, Users, User, Shield } from "lucide-react";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("admin");
  const [selectedChat, setSelectedChat] = useState("Admin (Rajesh)");
  const { addToast } = useToast();

  const adminPhone = "917418414780";

  const chats = {
    admin: [
      { id: 1, name: "Admin (Rajesh)", lastMsg: "Please update the kitchen drawing today.", time: "10:42 AM", online: true },
    ],
    groups: [
      { id: 2, name: "Sathish Guest House Team", lastMsg: "Sathish: I've uploaded the site photos.", time: "9:15 AM", online: false },
      { id: 3, name: "Arun Villa Group", lastMsg: "Arun: When is the next site visit?", time: "Yesterday", online: false },
    ],
    direct: [
      { id: 4, name: "Priya (Designer)", lastMsg: "Did you check the new layout?", time: "11:00 AM", online: true },
      { id: 5, name: "Arun (Site Engg)", lastMsg: "Materials arrived at site.", time: "8:30 AM", online: false },
    ]
  };

  const handleSend = () => {
    if (!message.trim()) return;

    // Simulate sending (keeping existing logic for WhatsApp if Admin is selected)
    if (selectedChat.includes("Admin")) {
      const formattedMessage = `Hello Admin 👋
Message from Employee:
${message}`;
      window.open(
        `https://wa.me/${adminPhone}?text=${encodeURIComponent(formattedMessage)}`,
        "_blank"
      );
    } else {
      addToast(`Message sent to ${selectedChat}: ${message}`, "success");
    }

    setMessage("");
  };

  const renderChatList = (list) => (
    <div className="bg-white rounded-xl shadow border overflow-hidden">
      {list.map((chat) => (
        <div
          key={chat.id}
          onClick={() => setSelectedChat(chat.name)}
          className={`p-4 border-b hover:bg-gray-50 transition cursor-pointer flex justify-between items-center
            ${selectedChat === chat.name ? "bg-indigo-50 border-l-4 border-l-indigo-600" : ""}`}
        >
          <div className="flex gap-3 items-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                {chat.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              {chat.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{chat.name}</p>
              <p className="text-xs text-gray-500 truncate w-40">{chat.lastMsg}</p>
            </div>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">{chat.time}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-100 p-2 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare size={22} className="text-indigo-600" /> Chat Center
        </h1>
        <button
          className="bg-indigo-600 text-white px-4 sm:px-5 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-indigo-700 transition w-full sm:w-auto"
        >
          <Plus size={18} /> New Message
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 h-auto sm:h-[calc(100vh-180px)]">
        {/* Sidebar */}
        <div className="col-span-1 sm:col-span-4 lg:col-span-3 space-y-2 sm:space-y-4 flex flex-col h-auto sm:h-full mb-2 sm:mb-0">
          <div className="bg-white rounded-xl shadow border p-3 sm:p-4 space-y-2">
            {[
              { key: "admin", icon: Shield, label: "Admin Support" },
              { key: "groups", icon: Users, label: "Project Groups" },
              { key: "direct", icon: User, label: "Direct Chats" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${activeTab === tab.key
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "hover:bg-gray-100 text-gray-700 hover:text-indigo-600"
                  }`}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto max-h-60 sm:max-h-none">
            {activeTab === "admin" && renderChatList(chats.admin)}
            {activeTab === "groups" && renderChatList(chats.groups)}
            {activeTab === "direct" && renderChatList(chats.direct)}
          </div>
        </div>

        {/* Chat Content Section */}
        <div className="col-span-1 sm:col-span-8 lg:col-span-9 bg-white rounded-xl shadow border flex flex-col overflow-hidden">
          {/* Top Bar for Selected Chat */}
          <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {selectedChat.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{selectedChat}</p>
                <p className="text-[10px] text-green-600 font-medium">Active now</p>
              </div>
            </div>
          </div>

          {/* Messages Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#f8f9fa] space-y-3 sm:space-y-4">
            {/* Example Message History */}
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm max-w-[70%] border border-gray-100">
                <p className="text-sm">Please update the kitchen drawing for the Sathish Guest House project today.</p>
                <p className="text-[10px] text-gray-400 text-right mt-1">10:42 AM</p>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-none shadow-md max-w-[70%]">
                <p className="text-sm">Sure, I'm working on the final touches. Will send it by 2 PM.</p>
                <p className="text-[10px] text-indigo-200 text-right mt-1">10:44 AM</p>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-2 sm:p-4 border-t bg-white">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-gray-50 p-2 rounded-xl border focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
              <button className="text-gray-400 hover:text-indigo-600 p-1 w-full sm:w-auto">
                <Plus size={20} />
              </button>
              <input
                type="text"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-transparent border-none outline-none text-sm p-1 text-gray-800 placeholder:text-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className={`p-2 rounded-lg transition-all w-full sm:w-auto ${message.trim() ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" : "bg-gray-200 text-gray-400"
                  }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
