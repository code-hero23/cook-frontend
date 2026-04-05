import React, { useState, useEffect } from "react";
import axios from "../../shared/utils/axios";
import { useNavigate } from "react-router-dom";
import useHaptics from "../../shared/hooks/useHaptics";
import TopNavbar from "./components/TopNavbar";
import Sidebar from "./components/Sidebar";

const App = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [selected, setSelected] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { trigger } = useHaptics();

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
        const [taskRes, activityRes, projectRes] = await Promise.all([
          axios.get("/tasks", { params: { projectId: project.id } }),
          axios.get(`/activities/${project.id}`),
          axios.get(`/projects/${project.id}`)
        ]);

        setTasks(taskRes.data);
        if (projectRes.data) {
          localStorage.setItem("clientProject", JSON.stringify(projectRes.data));
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

    if (project.id && clientToken) {
      fetchProjectData();
    }
  }, [project.id, clientToken]);

  const handleLogout = () => {
    trigger('heavy');
    localStorage.removeItem("clientToken");
    localStorage.removeItem("clientProject");
    localStorage.removeItem("welcomeShown");
    navigate("/client/login");
  };

  if (!clientToken) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <TopNavbar
        setSelected={setSelected}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        handleLogout={handleLogout}
      />
      
      <div className="flex-1 flex relative overflow-hidden">
        {/* Desktop Sidebar - Sticky! */}
        <div className="hidden md:block w-72 border-r border-slate-200 bg-white/50 backdrop-blur-xl h-[calc(100vh-5rem)] sticky top-20 z-20">
          <Sidebar selected={selected} setSelected={setSelected} onLogout={handleLogout} />
        </div>

        {/* Diagnostic Content Area */}
        <div className="flex-1 flex items-center justify-center bg-slate-900 text-white font-black text-2xl p-8 text-center">
          <div>
            <div className="mb-4">SIDEBAR STABLE</div>
            <div className="text-lg text-slate-400 font-medium tracking-tight">
              Selected View: <span className="text-indigo-400 uppercase">{selected}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="mt-12 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full text-[10px] uppercase tracking-widest transition-colors font-bold"
            >
              Logout Account
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay & Sidebar (Bottom of DOM for safety) */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[2000] md:hidden cursor-pointer"
        />
      )}

      {menuOpen && (
        <div className="fixed inset-y-0 left-0 w-72 bg-white z-[2001] md:hidden shadow-2xl rounded-r-3xl overflow-hidden border-r border-white/50">
          <Sidebar
            selected={selected}
            setSelected={(val) => {
              setSelected(val);
              setMenuOpen(false);
            }}
            onLogout={handleLogout}
          />
        </div>
      )}
    </div>
  );
};

export default App;
