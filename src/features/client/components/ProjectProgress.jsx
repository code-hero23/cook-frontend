import React, { useEffect, useState } from "react";
import axios from "../../../shared/utils/axios";
import TaskList from "./TaskList";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Lock, Unlock, CheckCircle, Clock, Zap, Target, Calendar } from "lucide-react";

const ProjectProgress = ({ tasks = [] }) => {
  // -------------------------------------------------------------------------
  // 1. STATE INITIALIZATION
  // -------------------------------------------------------------------------
  const [showTaskList, setShowTaskList] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [dayProgress, setDayProgress] = useState(0);
  const [paymentPercentage, setPaymentPercentage] = useState(0);
  const [targetPaymentVal, setTargetPaymentVal] = useState(0); // Admin Unlocked Stage %

  // -------------------------------------------------------------------------
  // 2. DATA PROCESSING
  // -------------------------------------------------------------------------
  const stages = [
    "Freezing Mail",
    "Approval of finalized designs",
    "Production",
    "Installation",
  ];

  const stageData = stages.map(s => {
    const stageTasks = tasks.filter(t => t.stage === s);
    const completed = stageTasks.filter(t => t.status === "Completed").length;
    return {
      name: s,
      total: stageTasks.length,
      completed,
      isDone: stageTasks.length > 0 && completed === stageTasks.length
    };
  });

  const totalStages = stageData.length;
  const completedStages = stageData.filter(s => s.isDone).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;

  // -------------------------------------------------------------------------
  // 3. CORE LOGIC: WEIGHTED PROGRESS & CAPPING
  // -------------------------------------------------------------------------

  // Define weights for each stage (must sum to 100)
  const stageWeights = [15, 35, 40, 10];

  // Calculate weighted progress
  // If a stage has 0 tasks, it contributes 0% to its weight.
  let weightedProgress = 0;
  stageData.forEach((stage, index) => {
    const weight = stageWeights[index] || 0;
    if (stage.total > 0) {
      const stageCompletion = stage.completed / stage.total;
      weightedProgress += stageCompletion * weight;
    }
  });

  const taskPercentage = Math.round(weightedProgress);

  // Progress is limited by the Admin's Unlocked Stage % (targetPaymentVal)
  const targetPercentage = Math.min(taskPercentage, targetPaymentVal || 0);

  const TOTAL_DAYS = 45;
  const daysPassed = 20;
  const daysLeft = TOTAL_DAYS - daysPassed;
  const daysPercentage = Math.round((daysPassed / TOTAL_DAYS) * 100);

  // -------------------------------------------------------------------------
  // 4. SIDE EFFECTS (Data Fetching & Animations)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const project = JSON.parse(localStorage.getItem("clientProject") || "{}");
    if (project.projectCode) {
      axios.get(`/client/${project.projectCode}`)
        .then(res => {
          setTargetPaymentVal(res.data.paymentPercentage || 0);
        })
        .catch(err => console.error("Error fetching project details", err));
    }
  }, []);

  // Animate Main Progress Ring
  useEffect(() => {
    if (percentage > targetPercentage) {
      setPercentage(targetPercentage);
      return;
    }

    let start = 0;
    const interval = setInterval(() => {
      start++;
      if (start <= targetPercentage) setPercentage(start);
      else clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [targetPercentage]);

  // Animate Day Progress
  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start++;
      if (start <= daysPercentage) setDayProgress(start);
      else clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [daysPercentage]);

  // Animate Payment/Admin Unlock Marker
  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start++;
      if (start <= targetPaymentVal) setPaymentPercentage(start);
      else clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [targetPaymentVal]);

  const data = [
    { name: "Completed", value: completedTasks },
    { name: "Pending", value: totalTasks - completedTasks },
  ];

  const project = JSON.parse(localStorage.getItem("clientProject") || "{}");
  const clientName = project.firstName ? `${project.firstName} ${project.lastName}` : "Client";

  // -------------------------------------------------------------------------
  // 5. RENDER
  // -------------------------------------------------------------------------

  if (showTaskList) {
    return (
      <div className="max-w-5xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <button
          onClick={() => setShowTaskList(false)}
          className="mb-6 px-6 py-2.5 bg-white text-indigo-600 font-bold rounded-xl shadow-md border border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          ← Back to Dashboard
        </button>
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <TaskList tasks={tasks} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-0 font-sans text-slate-900 overflow-x-hidden">
      {/* DEBUG BANNER */}


      <div className="space-y-1 p-2 md:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-1000 px-2 sm:px-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950">
              Project Overview
            </h1>
            <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Real-time update for {clientName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Today</p>
                <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Enablement Unified Tracker */}
        <div className="bg-white rounded-[2.5rem] p-4 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-50 relative overflow-hidden group animate-in zoom-in-95 duration-1000">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-3">
                <Target size={12} />
                Project Lifecycle
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Overall Project Progress</h2>
              <p className="text-slate-500 mt-1 font-medium">Your project progress synced with key milestones</p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums flex items-baseline gap-1 md:justify-end">
                {percentage}<span className="text-2xl text-indigo-600">%</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Physical Completion</p>
            </div>
          </div>

          <div className="relative mb-16 px-2">
            {/* The Main Track */}
            <div className={`relative h-20 w-full bg-slate-100 rounded-[1.25rem] border-4 border-slate-50 overflow-hidden shadow-inner`}>
              {/* Progress Fill with Liquid Effect */}
              <div
                className="liquid-progress absolute top-0 left-0 h-full transition-all duration-1000 ease-out flex items-center justify-end"
                style={{
                  width: `${percentage}%`,
                  filter: percentage > paymentPercentage ? 'hue-rotate(30deg) saturate(0.8)' : 'none',
                  opacity: percentage > paymentPercentage ? 0.8 : 1
                }}
              >
                <div className="h-full w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
                  <div className="shimmer-effect absolute inset-0"></div>
                </div>
              </div>

              {/* Glass Dividers & Stage Labels */}
              <div className="absolute inset-0 flex">
                {[
                  { w: '15%', threshold: 15, label: "Phase 01" },
                  { w: '35%', threshold: 50, label: "Phase 02" },
                  { w: '40%', threshold: 90, label: "Phase 03" },
                  { w: '10%', threshold: 100, label: "Phase 04" }
                ].map((s, i) => {
                  const isLocked = targetPaymentVal < s.threshold;
                  const isDone = stageData[i]?.isDone; // ✅ Use actual stage completion
                  return (
                    <div key={i} style={{ width: s.w }} className={`relative border-r border-white/10 group/stage transition-colors duration-500 ${isLocked ? 'bg-slate-900/[0.02]' : 'bg-transparent'}`}>
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                        <div className={`mb-1 transition-all duration-500 transform ${isDone ? 'scale-110 drop-shadow-glow' : ''}`}>
                          {isDone ? (
                            <CheckCircle size={22} className="text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]" />
                          ) : isLocked ? (
                            <Lock size={18} className="text-slate-400/40" />
                          ) : (
                            <Unlock size={18} className="text-indigo-200 animate-pulse" />
                          )}
                        </div>
                        <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none ${isDone ? 'text-white' : isLocked ? 'text-slate-400' : 'text-indigo-900/60'}`}>
                          {s.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Milestone Labels */}
            <div className="grid grid-cols-[15%_35%_40%_10%] mt-6 text-center">
              {[
                { label: "Freezing Mail", target: "15%" },
                { label: "Final Docs", target: "50%" },
                { label: "Production", target: "90%" },
                { label: "Installation", target: "100%" }
              ].map((s, i) => (
                <div key={i} className={`flex flex-col items-center px-1 ${i > 0 ? 'border-l border-slate-100' : ''}`}>
                  <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">Phase {i + 1} ➝ {s.label}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5">{s.target} Target</span>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Status Indicator Card */}
          <div className="relative z-10 animate-in slide-in-from-bottom-6 duration-1000 delay-300">
            <div className={`flex flex-col md:flex-row items-center gap-4 px-8 py-5 rounded-3xl border transition-all duration-500 ${percentage > paymentPercentage ? 'bg-amber-50 border-amber-100 shadow-[0_10px_30px_rgba(245,158,11,0.1)]' : 'bg-green-50 border-green-100 shadow-[0_10px_30px_rgba(34,197,94,0.1)]'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${percentage > paymentPercentage ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                {percentage > paymentPercentage ? <Clock size={24} className="animate-spin-slow" /> : <Zap size={24} className="animate-bounce-subtle" />}
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className={`text-xs font-black uppercase tracking-widest ${percentage > paymentPercentage ? 'text-amber-700' : 'text-green-700'}`}>
                  {percentage > paymentPercentage ? 'Phase Awaiting Activation' : 'Lifecycle Health: Optimal'}
                </p>
                <p className="text-sm font-bold text-slate-600 mt-1">
                  {percentage > paymentPercentage
                    ? "Execution speed is excellent. We are awaiting the next milestone approval to officially unlock the upcoming production phase."
                    : "Your project is humming along perfectly within the current active lifecycle phase."}
                </p>
              </div>
              <button
                onClick={() => setShowTaskList(true)}
                className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-1 active:scale-95 ${percentage > paymentPercentage ? 'bg-amber-600 text-white shadow-lg shadow-amber-200 hover:bg-amber-700' : 'bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-green-700'}`}
              >
                View Detailed Tasks
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Timeline & Stats Card */}
          <div className="lg:col-span-2 space-y-8 animate-in slide-in-from-left-6 duration-1000">
            {/* Timeline Bar */}
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                  <h3 className="font-black text-slate-800 tracking-tight">Project Timeline</h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900">{daysLeft}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Days left</span>
                </div>
              </div>

              <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-1000 ease-out flex items-center justify-end px-2"
                  style={{ width: `${dayProgress}%` }}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Day 1</p>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                  <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Current: Day {daysPassed}</p>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Day {TOTAL_DAYS}</p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div onClick={() => setShowTaskList(true)} className="bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-50 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-8 -mt-8 transition-all duration-500 group-hover:scale-150"></div>
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <CheckCircle size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stages Completed</p>
                    <p className="text-4xl font-black text-slate-900 tabular-nums">{completedStages}<span className="text-lg text-slate-300 ml-1">/ {totalStages}</span></p>
                  </div>
                </div>
              </div>

              <div onClick={() => setShowTaskList(true)} className="bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-50 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 transition-all duration-500 group-hover:scale-150"></div>
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Target size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Deliverables</p>
                    <p className="text-4xl font-black text-slate-900 tabular-nums">{completedTasks}<span className="text-lg text-slate-300 ml-1">/ {totalTasks}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Dial Card */}
          <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-50 animate-in slide-in-from-right-6 duration-1000 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full blur-2xl -mr-16 -mt-16"></div>

            <h3 className="font-black text-slate-800 tracking-tight text-xl mb-1 relative z-10">Task Analytics</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 relative z-10">Deliverables breakdown</p>

            <div className="h-[280px] relative">
              {/* Central Label overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Progress</span>
                <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                  {percentage}<span className="text-xl text-indigo-600 font-bold">%</span>
                </span>
                <span className="text-[10px] font-bold text-indigo-500/60 uppercase tracking-widest mt-2">{completedTasks} / {totalTasks} Tasks</span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 10, bottom: 20, left: 10 }}>
                  <Pie
                    data={[{ value: 1 }]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    stroke="none"
                    isAnimationActive={false}
                    fill="#f1f5f9"
                  />
                  <Pie
                    data={data}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={0}
                    stroke="none"
                    cornerRadius={10}
                    startAngle={90}
                    endAngle={450}
                  >
                    <Cell fill="url(#pieDashGradient)" className="drop-shadow-[0_6px_15px_rgba(99,102,241,0.4)]" />
                    <Cell fill="transparent" />
                  </Pie>
                  <defs>
                    <linearGradient id="pieDashGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-8 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Done</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>
        {`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .shimmer-effect {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 2s infinite;
        }

        .liquid-progress {
          box-shadow: 0 0 20px rgba(79, 70, 229, 0.4);
          position: relative;
        }

        .liquid-progress::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: 20px;
          background: white;
          filter: blur(8px);
          opacity: 0.3;
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
        }

        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 1.5s ease-in-out infinite;
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        /* Standard Tailwind missing animations */
        .fade-in { animation: fadeIn 1s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .slide-in-from-top-4 { animation: slideInTop 1s ease-out forwards; }
        @keyframes slideInTop { from { transform: translateY(-1rem); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .slide-in-from-bottom-4 { animation: slideInBottom 1s ease-out forwards; }
        @keyframes slideInBottom { from { transform: translateY(1rem); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .zoom-in-95 { animation: zoomIn 1s ease-out forwards; }
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}
      </style>
    </div>
  );
};

export default ProjectProgress;
