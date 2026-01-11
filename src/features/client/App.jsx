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

  const project = JSON.parse(localStorage.getItem("clientProject") || "{}");

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const [taskRes, activityRes] = await Promise.all([
          axios.get("/tasks", { params: { projectId: project.id } }),
          axios.get(`/activities/${project.id}`)
        ]);

        setTasks(taskRes.data);
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
    const newStatus = task.status === "Completed" ? "Pending" : "Completed";

    try {
      await axios.put(`/tasks/${id}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const timestamp = new Date().toISOString();
            if (newStatus === "Completed") {
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
            return { ...t, status: newStatus, completedAt: newStatus === "Completed" ? timestamp : null };
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
    navigate("/client/login");
  };

  const slideVars = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.4, ease: "circOut" }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9] font-sans selection:bg-indigo-100 selection:text-indigo-900">

      <TopNavbar
        setSelected={setSelected}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        handleLogout={handleLogout}
      />

      <div className="flex-1 flex relative">
        {/* Desktop Sidebar - Sticky! */}
        <div className="hidden md:block w-72 border-r border-slate-200 bg-white/50 backdrop-blur-xl h-[calc(100vh-5rem)] sticky top-20">
          <Sidebar selected={selected} setSelected={setSelected} onLogout={handleLogout} />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[990] md:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-72 bg-white z-[1000] md:hidden shadow-2xl rounded-r-3xl overflow-hidden border-r border-white/50"
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
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area - Window Scroll */}
        <div className="flex-1 bg-slate-50/30 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              {...slideVars}
              className="p-4 md:p-6 lg:p-8 pb-32 md:pb-12"
            >
              {selected === "overview" && <ProjectProgress tasks={tasks} />}
              {selected === "profile" && <Profile />}
              {selected === "tasks" && <TaskList tasks={tasks} toggleStatus={toggleStatus} />}
              {selected === "activity" && <ActivityFeed activity={activity} dummyActivity={[]} />}
              {selected === "gallery" && <Gallery />}
              {selected === "documents" && <Documents />}
              {selected === "timeline" && <Timeline tasks={tasks} />}
              {selected === "feedback" && <RaiseTicket />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {!hasAcceptedTerms && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-lg"
          >
            <TermsPopup onAccept={handleAcceptTerms} />
          </motion.div>
        )}
      </AnimatePresence>

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
