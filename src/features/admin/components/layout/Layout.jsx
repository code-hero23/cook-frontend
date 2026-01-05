import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "../../index.css"; // Import Admin CSS for scrollbars
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isChatPage = location.pathname.startsWith("/chat");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Sidebar */}
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">

        <Topbar onToggleSidebar={() => setMobileOpen(prev => !prev)} />

        <main className="flex-1 overflow-y-auto p-0">
          {/* FULL SCREEN for CHAT */}
          {isChatPage ? (
            <div className="h-full w-full">{children}</div>
          ) : (
            <div className="p-6 max-w-7xl mx-auto w-full">{children}</div>
          )}
        </main>

      </div>

    </div>
  );
};

export default Layout;
