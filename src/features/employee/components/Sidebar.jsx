import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "../../../shared/utils/axios";
import {
  LayoutDashboard,
  ListTodo,
  MessageCircle,
  Mail,
  Briefcase,
  Bug,
  LogOut,
  X
} from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const employee = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (!employee.id) return;
        const res = await axios.get(`/emails/unread?userId=${employee.id}`);
        setUnreadCount(res.data.count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };
    fetchUnread();

    // Optional: Poll every 30s
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const getInitials = (name) =>
    (name || "User").split(" ").map(word => word[0]).join("").toUpperCase();

  const navItem = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative
    ${isActive
      ? "bg-[#FF7A00] text-white shadow"
      : "text-gray-300 hover:bg-[#162040] hover:text-white"
    }`;

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 max-w-full
          bg-[#0D152A] text-white shadow-lg
          border-r border-[#1E263A]
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          z-[100] md:z-40
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[#1E263A] md:mt-[70px]">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">Orbix Projects</h1>
            <h2 className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mt-0.5">
              Employee Panel
            </h2>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-4 sm:py-5 border-b border-[#1E263A] bg-[#111A2E]">
          <div className="w-11 h-11 bg-[#FF7A00] text-white rounded-full flex items-center justify-center font-bold">
            {getInitials(employee.name)}
          </div>
          <div>
            <p className="font-semibold text-sm">{employee.name || 'Employee'}</p>
            <p className="text-xs text-gray-400">{employee.role || 'Role'}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 sm:px-3 py-3 sm:py-4 space-y-1 sm:space-y-2">
          <NavLink to="/employee" className={navItem} onClick={() => setSidebarOpen(false)} end>
            <LayoutDashboard size={20} />
            <span>My Dashboard</span>
          </NavLink>

          <NavLink to="/employee/tasks" className={navItem} onClick={() => setSidebarOpen(false)}>
            <ListTodo size={20} />
            <span>Tasks</span>
          </NavLink>

          <NavLink to="/employee/projects" className={navItem} onClick={() => setSidebarOpen(false)}>
            <Briefcase size={20} />
            <span>Projects</span>
          </NavLink>

          <NavLink to="/employee/chat" className={navItem} onClick={() => setSidebarOpen(false)}>
            <MessageCircle size={20} />
            <span>Messenger</span>
          </NavLink>

          <NavLink to="/employee/email" className={navItem} onClick={() => setSidebarOpen(false)}>
            <Mail size={20} />
            <span>Email</span>
            {unreadCount > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>

          <NavLink to="/employee/issues" className={navItem} onClick={() => setSidebarOpen(false)}>
            <Bug size={20} />
            <span>Issues</span>
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="border-t border-[#1E263A] p-4">
          <NavLink
            to="/login" onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 sm:gap-3 text-sm px-4 py-3 rounded-lg 
            text-red-400 hover:bg-red-400/20 hover:text-red-300 transition"
          >
            <LogOut size={18} />
            Logout
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
