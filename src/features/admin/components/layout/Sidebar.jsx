import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "../../../../shared/utils/axios";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  FileSpreadsheet,
  Link2,
  MessageSquare,
  Bug,
  ShieldCheck,
  Mail,
  LifeBuoy
} from "lucide-react";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/employees", label: "Employees", icon: Users },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/admin/issues", label: "Issues", icon: Bug },
  { to: "/admin/chat", label: "Chat", icon: MessageSquare },
  { to: "/admin/email", label: "Email", icon: Mail },
  { to: "/admin/helpdesk", label: "Helpdesk", icon: LifeBuoy },
  { to: "/admin/reports", label: "Reports", icon: FileSpreadsheet },
  { to: "/admin/client-access", label: "Client Access", icon: Link2 },
  { to: "/admin/settings", label: "Data & Backups", icon: ShieldCheck },
  { to: "/admin/dev-panel", label: "System Control", icon: ShieldCheck },
];

const Sidebar = ({ open, onClose }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isManager = (user.role || "").toUpperCase() === "MANAGER";

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (!user.id) return;
        const res = await axios.get(`/emails/unread?userId=${user.id}`);
        setUnreadCount(res.data.count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user.id]);

  const filteredNavItems = navItems.filter(item => {
    if (isManager && item.label === "Employees") return false;
    if (isManager && item.label === "System Control") return false;
    return true;
  });

  return (
    <>
      {/* Overlay - Mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-[#0E1525] text-gray-200
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static flex flex-col overflow-hidden`}
      >
        {/* Branding */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="h-10 w-10 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white">
            C
          </div>
          <div>
            <p className="text-xs uppercase text-white font-bold text-2xl tracking-wide">Orbix Projects</p>
            <p className="font-semibold text-sm text-white">
              {isManager ? "Admin Manager" : "Super Admin"}
            </p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {filteredNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 mx-3 rounded-lg text-sm
                 transition-all duration-200 relative
                ${isActive
                  ? "bg-brand-500 text-white shadow-md"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
              {label === "Email" && unreadCount > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
