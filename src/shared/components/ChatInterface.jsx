import React, { useState, useEffect, useRef } from "react";
import axios from "../utils/axios";
import {
    MessageSquare, Send, Search, User, MoreVertical,
    Phone, Video, Info, Paperclip, Smile, Check, CheckCheck, ArrowLeft
} from "lucide-react";

const ChatInterface = ({ projects = [], currentUser, role }) => {
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const messagesEndRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Auto-select first project if available - ONLY ON DESKTOP
    useEffect(() => {
        const isMobile = window.innerWidth < 640; // sm breakpoint
        if (projects.length > 0 && !activeProjectId && !isMobile) {
            setActiveProjectId(projects[0].id);
        }
    }, [projects]);

    // Handle back button on mobile
    const handleBackToProjects = () => {
        setActiveProjectId(null);
    };

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
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
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
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const filteredProjects = projects.filter(p =>
        (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.projectCode || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeProject = projects.find(p => p.id === activeProjectId);

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = new Date(message.createdAt).toLocaleDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    return (
        <div className="flex flex-col sm:flex-row h-full sm:h-[calc(100vh-100px)] bg-white sm:rounded-2xl overflow-hidden sm:shadow-2xl sm:border border-gray-100 font-sans">

            {/* SIDEBAR */}
            <div className={`w-full sm:w-80 bg-gray-50/50 border-r border-gray-100 flex flex-col transition-all duration-300 ${activeProjectId ? 'hidden sm:flex' : 'flex h-full'}`}>
                {/* Sidebar Header */}
                <div className="p-4 sm:p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Messages</h2>
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <MessageSquare size={16} />
                        </div>
                    </div>
                    <div className="relative group">
                        <Search size={16} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-sm pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Project List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                    {filteredProjects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => setActiveProjectId(project.id)}
                            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group relative ${activeProjectId === project.id ? 'bg-indigo-600 shadow-md shadow-indigo-200' : 'hover:bg-white hover:shadow-sm'}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${activeProjectId === project.id ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-indigo-100 to-purple-50 text-indigo-700'}`}>
                                    {project.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className={`text-sm font-bold truncate ${activeProjectId === project.id ? 'text-white' : 'text-gray-800'}`}>
                                            {project.name}
                                        </h3>
                                        <span className={`text-[10px] whitespace-nowrap ${activeProjectId === project.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                                            {project.updatedAt ? new Date(project.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate ${activeProjectId === project.id ? 'text-indigo-100' : 'text-gray-500 group-hover:text-gray-600'}`}>
                                        {project.projectCode} • <span className="opacity-90">Tap to chat</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredProjects.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <MessageSquare size={32} className="mb-2 opacity-20" />
                            <p className="text-sm">No projects found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div className={`flex-1 flex flex-col bg-white overflow-hidden relative w-full h-full ${!activeProjectId ? 'hidden sm:flex' : 'flex'}`}>
                {!activeProject ? (
                    <div className="h-full flex flex-col items-center justify-center bg-gray-50/30 text-center p-8 hidden sm:flex">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <MessageSquare size={32} className="text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to Cookscape Chat</h3>
                        <p className="text-gray-500 text-sm max-w-xs">Select a project from the sidebar to start collaborating with your team.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 px-4 sm:px-6 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-20 shrink-0">
                            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                <button onClick={handleBackToProjects} className="sm:hidden text-gray-500 hover:text-indigo-600 p-1">
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-200 shrink-0">
                                    {activeProject.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="font-bold text-gray-800 text-sm sm:text-base truncate">{activeProject.name}</h2>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0"></span>
                                        <span className="text-xs text-green-600 font-medium tracking-wide truncate">Active Project</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 text-gray-400 shrink-0">
                                <button className="hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-all hidden sm:block"><Phone size={18} /></button>
                                <button className="hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-all hidden sm:block"><Video size={18} /></button>
                                <button className="hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-all"><MoreVertical size={18} /></button>
                            </div>
                        </div>

                        {/* Messages Feed */}
                        <div
                            className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6 custom-scrollbar scroll-smooth"
                            ref={messagesEndRef}
                        >
                            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                                <div key={date}>
                                    <div className="flex justify-center mb-6">
                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">{date}</span>
                                    </div>
                                    <div className="space-y-4">
                                        {dateMessages.map((msg, idx) => {
                                            const isMe = msg.sender === currentUser.name;
                                            const isAdmin = msg.senderRole === "ADMIN";
                                            return (
                                                <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                                    <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                        {!isMe && (
                                                            <span className="text-[10px] text-gray-500 mb-1 ml-1 flex items-center gap-1 font-semibold">
                                                                {isAdmin ? <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider">ADMIN</span> : ''} {msg.sender}
                                                            </span>
                                                        )}
                                                        <div
                                                            className={`px-4 py-3 shadow-sm text-sm relative leading-relaxed break-words
                                                    ${isMe ?
                                                                    'bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-100' :
                                                                    'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)]'}`
                                                            }
                                                        >
                                                            {msg.content}
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                                                            <span className="text-[9px] text-gray-400 font-medium">
                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {isMe && <CheckCheck size={10} className="text-indigo-400" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 sm:p-4 bg-white border-t border-gray-100 shrink-0">
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-transparent focus-within:border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-50/50 transition-all shadow-inner">
                                <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors hidden sm:block"><Paperclip size={20} /></button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-gray-700 placeholder:text-gray-400 font-medium"
                                />
                                <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors hidden sm:block"><Smile size={20} /></button>
                                <button
                                    onClick={handleSend}
                                    disabled={!newMessage.trim()}
                                    className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${newMessage.trim() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-200 text-gray-400'}`}
                                >
                                    <Send size={18} fill={newMessage.trim() ? "currentColor" : "none"} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};

export default ChatInterface;
