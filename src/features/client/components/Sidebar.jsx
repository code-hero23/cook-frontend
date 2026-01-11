import React from "react";
import { motion } from "framer-motion";
import useHaptics from "../../../shared/hooks/useHaptics";
import {
  LayoutDashboard,
  User,
  Layers,
  Zap,
  Image as GalleryIcon,
  Calendar,
  FileText,
  MessageSquare,
  LogOut
} from "lucide-react";

const Sidebar = ({ selected, setSelected, onLogout }) => {
  const { trigger } = useHaptics();

  const menu = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "profile", label: "Profile", icon: User },
    { id: "tasks", label: "Stages", icon: Layers },
    { id: "activity", label: "Activity", icon: Zap },
    { id: "gallery", label: "Images", icon: GalleryIcon },
    { id: "timeline", label: "Timeline", icon: Calendar },
    { id: "documents", label: "Docs", icon: FileText },
    { id: "feedback", label: "Ticket", icon: MessageSquare },
  ];

  const handleSelect = (id) => {
    trigger('light');
    setSelected(id);
  };

  return (
    <div className="h-full flex flex-col px-4 py-8 bg-white/50 backdrop-blur-xl">

      <div className="mb-8 px-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
          Menu
        </h2>
      </div>

      {/* Menu Items */}
      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
        {menu.map((item) => {
          const isActive = selected === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden
              ${isActive
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200"
                  : "bg-transparent hover:bg-indigo-50 text-slate-500 hover:text-indigo-600"
                }`}
            >
              <item.icon size={20} className={isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"} />
              <span className="truncate">{item.label}</span>

              {isActive && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0"
                  initial={false}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Logout & Support Section */}
      <div className="mt-auto pt-6 space-y-4">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all border border-rose-100 md:hidden"
        >
          <LogOut size={20} />
          <span>Logout Portal</span>
        </motion.button>

        {/* Info Card */}
        <div className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] text-white shadow-lg shadow-indigo-100 hidden md:block">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Need Help?</p>
          <p className="text-xs font-bold leading-relaxed mb-4">Our project managers are available to assist you.</p>
          <button
            onClick={() => handleSelect("feedback")}
            className="w-full py-2 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
