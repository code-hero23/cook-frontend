import React, { useState, useEffect, useRef } from "react";
import { User, Bell, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TopNavbar = ({ setSelected, menuOpen, setMenuOpen }) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const dropdownRef = useRef();   // ✅ reference for click outside

  // Fetch from LocalStorage (or potentially Context)
  const project = JSON.parse(localStorage.getItem("clientProject") || "{}");
  // Prefer Project Name, fallback to Client Name, fallback to "Client Portal"
  // Prefer Client Name (as requested), fallback to Project Name
  const clientName = (project.firstName ? `${project.firstName} ${project.lastName}` : project.clientName) || project.projectName || "Client Portal";

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formattedTime = currentTime.toLocaleString();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-20 bg-white border-b shadow-md flex items-center justify-between px-4 md:px-6">

      {/* LEFT SIDE - LOGO & CLIENT NAME */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 min-w-0 max-w-[70%] sm:max-w-none">
        <img
          src="/FINAL_LOGO.png"
          alt="Cookscape Logo"
          className="h-10 sm:h-14 md:h-16 object-contain flex-shrink-0"
        />
        <div className="hidden sm:block h-8 w-[1px] bg-gray-200 flex-shrink-0"></div>
        <div className="flex-1 min-w-0 flex items-center">
          <h2 className="text-sm sm:text-lg md:text-xl font-black tracking-tight text-slate-800 truncate px-2">
            {clientName}
          </h2>
        </div>
      </div>

      {/* RIGHT SIDE ICONS */}
      <div className="relative flex items-center gap-2 sm:gap-6 flex-shrink-0">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={24} className="text-gray-800" />
        </button>

        {/* Notification Bell */}
        <Bell
          size={28}
          className="cursor-pointer text-gray-600 hover:text-indigo-600 transition"
          onClick={() => setSelected("activity")}
        />

        {/* User Icon */}
        <User
          size={28}
          className="cursor-pointer text-gray-600 hover:text-indigo-600 transition"
          onClick={() => setShowProfile(!showProfile)}
        />

        {/* DROPDOWN */}
        {showProfile && (
          <div
            ref={dropdownRef}
            className="absolute right-0 top-14 w-64 bg-white shadow-xl rounded-lg border p-4 z-50 dropdown-slide"
          >

            <h4 className="font-semibold text-gray-800 text-lg">
              {clientName}
            </h4>

            <div className="border my-2"></div>

            <p className="text-sm text-gray-600 mb-3">
              {formattedTime}
            </p>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}

      </div>

      {/* Animation */}
      <style>{`
  .dropdown-slide {
    animation: slideDown 0.25s ease-out forwards;
    transform-origin: top;
  }

  @keyframes slideDown {
    0% {
      opacity: 0;
      transform: translateY(-15px) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`}</style>


    </div>
  );
};

export default TopNavbar;
