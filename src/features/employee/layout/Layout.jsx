import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="w-full h-screen bg-gray-100">

      {/* SIDEBAR FIXED LEFT */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* NAVBAR FIXED TOP */}
      <Navbar setSidebarOpen={setSidebarOpen} />

      {/* MAIN SCROLLABLE CONTENT */}
      <main
        className="flex-1 ml-0 md:ml-64 mt-[60px] sm:mt-[70px] h-[calc(100vh-60px)] sm:h-[calc(100vh-70px)] overflow-y-auto bg-gray-100 p-2 sm:p-4"
      >
        <Outlet />
      </main>

    </div>
  );
};

export default Layout;
