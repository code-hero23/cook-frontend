import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import usePushNotifications from "../../../shared/hooks/usePushNotifications";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { subscribeToPush, isSubscribed, loading } = usePushNotifications(user?.id);

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
        {!isSubscribed && (
          <div
            onClick={!loading ? subscribeToPush : undefined}
            className="mb-4 bg-white border-l-4 border-indigo-500 p-4 shadow rounded flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">🔔</span>
              <div>
                <p className="font-bold text-gray-800">Enable Notifications</p>
                <p className="text-sm text-gray-600">Get instant alerts when tasks are assigned to you.</p>
              </div>
            </div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-semibold">
              {loading ? 'Enabling...' : 'Enable'}
            </button>
          </div>
        )}
        <Outlet />
      </main>

    </div>
  );
};

export default Layout;
