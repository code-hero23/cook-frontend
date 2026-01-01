import React from "react";
import { NavLink } from "react-router-dom";
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

  const employee = {
    name: "Aswanth",
    role: "Interior Designer"
  };

  const getInitials = (name) =>
    name.split(" ").map(word => word[0]).join("").toUpperCase();

  const navItem = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
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
          <h2 className="text-xs font-bold tracking-wide uppercase text-gray-400">
            Employee Panel
          </h2>

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
            <p className="font-semibold text-sm">{employee.name}</p>
            <p className="text-xs text-gray-400">{employee.role}</p>
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
