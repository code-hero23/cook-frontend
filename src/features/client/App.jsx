import React, { useState, useEffect } from "react";
import axios from "../../shared/utils/axios";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "./components/Sidebar";
import ProjectProgress from "./components/ProjectProgress";
import TaskList from "./components/TaskList";
import ActivityFeed from "./components/ActivityFeed";
import Gallery from "./components/Gallery";
import Documents from "./components/Documents";
import Timeline from "./components/Timeline";
import RaiseTicket from "./components/RaiseTicket";
import TopNavbar from "./components/TopNavbar";
import Profile from "./components/Profile";
import TermsPopup from "./components/TermsPopup";
import useHaptics from "../../shared/hooks/useHaptics";
import { useNavigate } from "react-router-dom";
import RefreshButton from "../../shared/components/RefreshButton";


const App = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [selected, setSelected] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { trigger } = useHaptics();

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => {
    return localStorage.getItem("termsAccepted") === "true";
  });

  const clientToken = localStorage.getItem("clientToken");
  const project = JSON.parse(localStorage.getItem("clientProject") || "{}");

  useEffect(() => {
    if (!clientToken) {
      navigate("/client/login", { replace: true });
    }
  }, [clientToken, navigate]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        // FETCH FRESH PROJECT DATA TOO
        const [taskRes, activityRes, projectRes] = await Promise.all([
          axios.get("/tasks", { params: { projectId: project.id } }),
          axios.get(`/activities/${project.id}`),
          axios.get(`/projects/${project.id}`)
        ]);

        setTasks(taskRes.data);

        // Update LocalStorage with FRESH Project Data
        if (projectRes.data) {
          localStorage.setItem("clientProject", JSON.stringify(projectRes.data));
          // Dispatch a custom event or force update if needed, but for now app reload handles it mostly.
          // Ideally, we should use a Context, but this is a quick fix.
        }

        const formattedActivity = activityRes.data.map(log => ({
          id: log.id,
          message: log.message,
          time: log.createdAt,
          category: log.category
        }));
        setActivity(formattedActivity);

      } catch (err) {
        console.error("Error fetching client data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (project.id) {
      fetchProjectData();
    }
  }, [project.id]);

  const toggleStatus = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    trigger('medium');
    // FIX: Normalize Check to Uppercase to match Backend
    const isCompleted = task.status && task.status.toUpperCase() === "COMPLETED";
    const newStatus = isCompleted ? "PENDING" : "COMPLETED";

    try {
      await axios.put(`/tasks/${id}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const timestamp = new Date().toISOString();
            if (newStatus === "COMPLETED") {
              setActivity((oldLogs) => [
                {
                  id: `${id}-${timestamp}`,
                  taskId: id,
                  message: `${t.title} marked as completed`,
                  time: timestamp,
                },
                ...oldLogs,
              ]);
            } else {
              setActivity((oldLogs) =>
                oldLogs.filter((log) => log.taskId !== id)
              );
            }
            return { ...t, status: newStatus, completedAt: newStatus === "COMPLETED" ? timestamp : null };
          }
          return t;
        })
      );
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const handleAcceptTerms = () => {
    trigger('success');
    localStorage.setItem("termsAccepted", "true");
    setHasAcceptedTerms(true);
  };

  const handleLogout = () => {
    trigger('heavy');
    localStorage.removeItem("clientToken");
    localStorage.removeItem("clientProject");
    localStorage.removeItem("welcomeShown");
    navigate("/client/login");
  };

  if (!clientToken) {
    return null; // Don't render dashboard while redirecting
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-black text-4xl">
      DASHBOARD ISOLATED: CHECKING FOR STABILITY...
      <button onClick={handleLogout} className="fixed bottom-4 right-4 text-xs">Logout</button>
    </div>
  );
/*
  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9] font-sans selection:bg-indigo-100 selection:text-indigo-900">

      <TopNavbar
        setSelected={setSelected}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        handleLogout={handleLogout}
      />
...
*/

        {/* Mobile Sidebar Overlay & Sidebar (Bottom of DOM for safety) */}
        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[2000] md:hidden cursor-pointer"
          />
        )}

        {menuOpen && (
          <div
            className="fixed inset-y-0 left-0 w-72 bg-white z-[2001] md:hidden shadow-2xl rounded-r-3xl overflow-hidden border-r border-white/50"
          >
            <div
              className="h-full"
              onTouchStart={(e) => { window._touchStartX = e.touches[0].clientX; }}
              onTouchMove={(e) => {
                const touchEndX = e.touches[0].clientX;
                const diff = window._touchStartX - touchEndX;
                if (diff > 50) { trigger('light'); setMenuOpen(false); }
              }}
            >
              <Sidebar
                selected={selected}
                setSelected={(val) => {
                  setSelected(val);
                  setMenuOpen(false);
                }}
                onLogout={handleLogout}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #E2E8F0; 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
};

export default App;
