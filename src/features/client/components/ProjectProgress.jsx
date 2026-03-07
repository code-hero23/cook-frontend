import React, { useEffect, useState } from "react";
import axios from "../../../shared/utils/axios";
import TaskList from "./TaskList";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, CheckCircle, Clock, Zap, Target, Calendar, ChevronRight } from "lucide-react";
import useHaptics from "../../../shared/hooks/useHaptics";

const ProjectProgress = ({ tasks = [] }) => {
  const [showTaskList, setShowTaskList] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [dayProgress, setDayProgress] = useState(0);
  const [paymentPercentage, setPaymentPercentage] = useState(0);
  const [targetPaymentVal, setTargetPaymentVal] = useState(0);
  const [projectData, setProjectData] = useState(null);
  const { trigger } = useHaptics();

  const stages = [
    "Freezing Mail",
    "Approval of finalized designs",
    "Production",
    "Installation",
  ];

  const stageWeights = [15, 35, 40, 10];
  const stageData = stages.map((s, index) => {
    const stageTasks = tasks.filter(t => t.stage === s);
    const completed = stageTasks.filter(t => t.status?.toUpperCase() === "COMPLETED").length;
    return {
      name: s,
      total: stageTasks.length,
      completed,
      isDone: stageTasks.length > 0 && completed === stageTasks.length,
      weight: stageWeights[index]
    };
  });

  const totalStages = stageData.length;
  const completedStages = stageData.filter(s => s.isDone).length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status?.toUpperCase() === "COMPLETED").length;

  let weightedProgress = 0;
  stageData.forEach((stage) => {
    if (stage.total > 0) {
      weightedProgress += (stage.completed / stage.total) * stage.weight;
    }
  });

  const taskPercentage = Math.round(weightedProgress);
  const targetPercentage = targetPaymentVal || 0;

  const isPendingActivation = taskPercentage > paymentPercentage;

  const timelineDuration = projectData?.timelineDuration || 45;
  const today = new Date();
  const designStageName = "Approval of finalized designs";
  const designStage = stageData.find(s => s.name === designStageName);
  const designTasks = tasks.filter(t => t.stage === designStageName);

  let startDate = null;
  if (designStage && designStage.isDone) {
    const completionTimes = designTasks
      .filter(t => t.completedAt)
      .map(t => new Date(t.completedAt).getTime());
    if (completionTimes.length > 0) {
      startDate = new Date(Math.max(...completionTimes));
    } else {
      startDate = projectData?.startDate ? new Date(projectData.startDate) : null;
    }
  }

  // Helper: Count Working Days (Excluding Sundays)
  const countWorkingDays = (start, end) => {
    let count = 0;
    let current = new Date(start);
    // Reset time to ensure clean day comparison
    current.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    while (current < endDate) {
      // 0 = Sunday, 6 = Saturday
      if (current.getDay() !== 0) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  let daysPassed = 0;
  if (startDate) {
    // Use the new helper instead of simple diff
    daysPassed = countWorkingDays(startDate, today);
  }

  const effectiveDaysPassed = Math.min(Math.max(0, daysPassed), timelineDuration);
  const daysLeft = Math.max(0, timelineDuration - effectiveDaysPassed);
  const daysPercentage = Math.round((effectiveDaysPassed / timelineDuration) * 100);

  useEffect(() => {
    const project = JSON.parse(localStorage.getItem("clientProject") || "{}");
    if (project.projectCode) {
      axios.get(`/client/${project.projectCode}`)
        .then(res => {
          setProjectData(res.data);
          setTargetPaymentVal(res.data.paymentPercentage || 0);
        })
        .catch(err => console.error("Error fetching project details", err));
    }
  }, []);

  useEffect(() => {
    setPercentage(targetPercentage);
    setDayProgress(daysPercentage);
    setPaymentPercentage(targetPaymentVal);
  }, [targetPercentage, daysPercentage, targetPaymentVal]);

  const pieData = [
    { name: "Completed", value: completedTasks },
    { name: "Pending", value: totalTasks - completedTasks },
  ];

  const clientName = projectData?.firstName ? `${projectData.firstName} ${projectData.lastName}` : "Client";

  const toggleViewTasks = () => {
    trigger('medium');
    setShowTaskList(!showTaskList);
  };

  if (showTaskList) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="max-w-5xl mx-auto p-4 md:p-8"
      >
        <button
          onClick={toggleViewTasks}
          className="mb-8 flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md text-indigo-600 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 border border-white transition-all transform hover:-translate-y-1 active:scale-95"
        >
          ← Back to Dashboard
        </button>
        <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/50 overflow-hidden">
          <TaskList tasks={tasks} />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900">
            Project Dashboard
          </h1>
          <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] sm:text-xs bg-white/50 backdrop-blur-sm self-start px-3 py-1 rounded-full border border-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Syncing updates for {clientName}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-white flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Date</p>
              <p className="text-sm font-black text-slate-700">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MAIN TRACKER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/70 backdrop-blur-2xl rounded-3xl md:rounded-[3.5rem] p-4 md:p-10 shadow-2xl shadow-indigo-100/50 border border-white relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-3xl -mr-32 -mt-32"></div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
              <Target size={14} />
              Current Status
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Master Project Timeline</h2>
            <p className="text-slate-500 font-semibold max-w-md leading-relaxed text-sm">Track your interior journey across four distinct phases of excellence.</p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl md:text-6xl font-black text-slate-900 tracking-tighter tabular-nums flex items-baseline gap-1 md:justify-end leading-none">
              {percentage}<span className="text-xl md:text-3xl text-indigo-600">%</span>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 md:mt-3">Overall Progress</p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="relative mb-8 md:mb-16 px-1 md:px-2">
          <div className="relative h-12 sm:h-20 md:h-24 w-full bg-slate-100 rounded-2xl md:rounded-3xl border-[3px] md:border-8 border-white overflow-hidden shadow-inner">
            {/* Fill */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-end"
              style={{
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.1)",
                opacity: isPendingActivation ? 0.7 : 1,
                filter: isPendingActivation ? 'grayscale(0.4)' : 'none'
              }}
            >
              <div className="h-full w-full absolute inset-0 shimmer-glass opacity-30"></div>
            </motion.div>

            {/* Stage Indicators */}
            <div className="absolute inset-0 flex">
              {[
                { w: '15%', threshold: 15, label: "Design" },
                { w: '35%', threshold: 50, label: "Finalize" },
                { w: '40%', threshold: 90, label: "Production" },
                { w: '10%', threshold: 100, label: "Fit-out" }
              ].map((s, i) => {
                const isLocked = targetPaymentVal < s.threshold;
                const isDone = stageData[i]?.isDone;
                return (
                  <div key={i} style={{ width: s.w }} className={`relative border-r border-white/20 flex flex-col items-center justify-center transition-all duration-500 ${isLocked ? 'bg-slate-950/5' : ''}`}>
                    <div className="relative z-10 flex flex-col items-center gap-1 md:gap-2">
                      {isDone ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-0.5 md:p-1 bg-white rounded-full shadow-lg">
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                        </motion.div>
                      ) : isLocked ? (
                        <Lock size={12} className="text-slate-400/50 md:size-4" />
                      ) : (
                        <Unlock size={12} className="text-white/80 animate-pulse md:size-4" />
                      )}
                      <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${isDone || (!isLocked && percentage >= (i * 25)) ? 'text-white' : 'text-slate-400'}`}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* STATUS CARD */}
        <motion.div
          whileHover={{ y: -5 }}
          className={`relative z-10 p-4 md:p-6 rounded-3xl border flex flex-col md:flex-row items-center gap-4 md:gap-6 transition-all duration-500
            ${isPendingActivation
              ? 'bg-amber-50/80 border-amber-100 shadow-xl shadow-amber-100/50'
              : 'bg-indigo-50/80 border-indigo-100 shadow-xl shadow-indigo-100/50'}`}
        >
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 
            ${isPendingActivation ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {isPendingActivation ? <Clock size={24} className="animate-spin-slow" /> : <Zap size={24} />}
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h4 className={`text-xs font-black uppercase tracking-widest ${isPendingActivation ? 'text-amber-700' : 'text-indigo-700'}`}>
              {isPendingActivation ? 'Pending Milestone Activation' : 'Lifecycle Health: Optimal'}
            </h4>
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              {isPendingActivation
                ? "Your project is ahead of the official activation schedule. We'll unlock the next phase shortly."
                : "Your project is progressing smoothly within the active lifecycle phase. Everything is on track!"}
            </p>
          </div>
          <button
            onClick={toggleViewTasks}
            className={`w-full md:w-auto px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg transform active:scale-95 flex items-center justify-center gap-2
              ${isPendingActivation
                ? 'bg-amber-600 text-white shadow-amber-200 hover:bg-amber-700'
                : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'}`}
          >
            Explore Tasks
            <ChevronRight size={14} />
          </button>
        </motion.div>
      </motion.div>

      {/* SECONDARY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* TIMELINE CARD */}
        <motion.div
          whileHover={{ y: -5 }}
          className="lg:col-span-2 bg-white/70 backdrop-blur-2xl p-6 md:p-8 rounded-3xl md:rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white group"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center shadow-inner">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Timeline Health</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Delivery Window</p>
              </div>
            </div>
            <div className="w-fit px-6 py-2 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <span className="text-2xl font-black text-slate-900 leading-none">{daysLeft}</span>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Days Remaining</p>
            </div>
          </div>

          <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner mb-6 border-4 border-white">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dayProgress}%` }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-end px-2"
            >
              <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>
            </motion.div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="text-slate-400">Project Launch</span>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full border border-pink-100">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
              Day {effectiveDaysPassed} of {timelineDuration}
            </div>
            <span className="text-slate-400">Handoff Goal</span>
          </div>
        </motion.div>

        {/* ANALYTICS PIE */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white/70 backdrop-blur-2xl p-6 md:p-8 rounded-3xl md:rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden"
        >
          <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight mb-1">Deliverables</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Data Breakdown</p>

          <div className="h-[240px] relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
              <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{completedTasks}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">of {totalTasks} Done</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={75}
                  outerRadius={95}
                  paddingAngle={8}
                  stroke="none"
                  cornerRadius={12}
                  startAngle={90}
                  endAngle={450}
                >
                  <Cell fill="url(#blueGrad)" />
                  <Cell fill="#f1f5f9" />
                </Pie>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <style>{`
        .shimmer-glass {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProjectProgress;
