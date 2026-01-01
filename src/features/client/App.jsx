import React, { useState, useEffect } from "react";
import axios from "../../shared/utils/axios";

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


import { dummyActivityFeed } from "./data/dummyActivityFeed";
// Removed initialTasks import

import TermsPopup from "./components/TermsPopup";


const App = () => {
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [selected, setSelected] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => {
    return localStorage.getItem("termsAccepted") === "true";
  });

  const project = JSON.parse(localStorage.getItem("clientProject") || "{}");

  useEffect(() => {
    const fetchProjectTasks = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/tasks", {
          params: { projectId: project.id }
        });
        setTasks(res.data);
      } catch (err) {
        console.error("Error fetching client tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    if (project.id) {
      fetchProjectTasks();
    }
  }, [project.id]);

  // ---- Task Status Toggle + Activity Logging ----
  const toggleStatus = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

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
    localStorage.setItem("termsAccepted", "true");
    setHasAcceptedTerms(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <TopNavbar
        setSelected={setSelected}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <div className="flex pt-20">
        <div className="hidden md:block w-64 border-r bg-white min-h-screen">
          <Sidebar selected={selected} setSelected={setSelected} />
        </div>

        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          ></div>
        )}

        <div
          className={`fixed top-20 bottom-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 md:hidden
  ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
          onTouchStart={(e) => {
            window._touchStartX = e.touches[0].clientX;
          }}
          onTouchMove={(e) => {
            const touchEndX = e.touches[0].clientX;
            const diff = window._touchStartX - touchEndX;
            if (diff > 70) {
              setMenuOpen(false);
            }
          }}
        >
          <Sidebar
            selected={selected}
            setSelected={(val) => {
              setSelected(val);
              setMenuOpen(false);
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-screen">
          {selected === "overview" && <ProjectProgress tasks={tasks} />}
          {selected === "profile" && <Profile />}
          {selected === "tasks" && <TaskList tasks={tasks} toggleStatus={toggleStatus} />}
          {selected === "activity" && <ActivityFeed activity={activity} dummyActivity={dummyActivityFeed} />}
          {selected === "gallery" && <Gallery />}
          {selected === "documents" && <Documents />}
          {selected === "timeline" && <Timeline tasks={tasks} />}
          {selected === "feedback" && <RaiseTicket />}
        </div>
      </div>

      {!hasAcceptedTerms && <TermsPopup onAccept={handleAcceptTerms} />}
    </div>
  );
};

export default App;
