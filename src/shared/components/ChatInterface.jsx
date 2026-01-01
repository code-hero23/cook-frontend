import React, { useState, useEffect, useRef } from "react";
import axios from "../utils/axios";
import { MessageSquare, Send, Search, User } from "lucide-react";

const ChatInterface = ({ projects = [], currentUser, role }) => {
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const messagesEndRef = useRef(null);

    // Auto-select first project if available
    useEffect(() => {
        if (projects.length > 0 && !activeProjectId) {
            setActiveProjectId(projects[0].id);
        }
    }, [projects]);

    // Fetch messages with polling
    useEffect(() => {
        if (!activeProjectId) return;

        const fetchMessages = async () => {
            try {
                const res = await axios.get(`/messages/${activeProjectId}`);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [activeProjectId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !activeProjectId) return;

        try {
            const payload = {
                content: newMessage,
                projectId: activeProjectId,
                sender: currentUser.name || "Unknown",
                senderRole: role
            };

            // Optimistic update
            const tempMsg = { ...payload, createdAt: new Date().toISOString(), id: `temp-${Date.now()}` };
            setMessages([...messages, tempMsg]);
            setNewMessage("");

            await axios.post("/messages", payload);
            // Logic relies on next poll to correct ID/timestamp if needed
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const filteredProjects = projects.filter(p =>
        (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.projectCode || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeProject = projects.find(p => p.id === activeProjectId);

    return (
        <div className="flex h-[calc(100vh-100px)] bg-gray-100 rounded-xl overflow-hidden shadow-lg border border-gray-200">

            {/* SIDEBAR: Project List */}
            <div className="w-1/3 sm:w-1/4 bg-white border-r flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
                        <MessageSquare size={20} className="text-indigo-600" />
                        Projects
                    </h2>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-sm pl-9 pr-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredProjects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => setActiveProjectId(project.id)}
                            className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${activeProjectId === project.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
                        >
                            <h3 className="font-bold text-gray-800 text-sm truncate">{project.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">{project.projectCode}</p>
                            {/* Could add 'last message' preview here if API supported it */}
                        </div>
                    ))}
                    {filteredProjects.length === 0 && (
                        <div className="p-4 text-center text-xs text-gray-400 italic">No projects found</div>
                    )}
                </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div className="flex-1 flex flex-col bg-[#f0f2f5]">
                {/* Header */}
                <div className="h-16 bg-white border-b flex items-center px-6 shadow-sm z-10">
                    {activeProject ? (
                        <div>
                            <h2 className="font-bold text-gray-800">{activeProject.name}</h2>
                            <span className="text-xs text-green-600 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                            </span>
                        </div>
                    ) : (
                        <span className="text-gray-500">Select a project</span>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg, idx) => {
                        const isMe = msg.sender === currentUser.name; // Simple name check for now
                        return (
                            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm relative group ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border'}`}>
                                    {!isMe && (
                                        <p className="text-[10px] font-bold text-indigo-600 mb-1 flex items-center gap-1">
                                            {msg.senderRole === 'ADMIN' ? '🛡️' : ''} {msg.sender}
                                        </p>
                                    )}
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <p className={`text-[9px] mt-2 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t">
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-gray-700"
                            disabled={!activeProjectId}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!newMessage.trim() || !activeProjectId}
                            className={`p-2 rounded-lg transition-colors ${newMessage.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400'}`}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ChatInterface;
