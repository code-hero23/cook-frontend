import React, { useState } from "react";
import { Download, ChevronDown, ChevronRight } from "lucide-react";

const TaskList = ({ tasks }) => {
  const [expandedStages, setExpandedStages] = useState({
    "Freezing Mail": false,
    "Approval of finalized designs": false,
    "Production": false,
    "Installation": false,
  });

  const downloadKeywords = ["receipt", "pdi", "2d", "3d", "guarantee", "drawing", "certificate", "document", "quote"];

  const toggleStage = (stage) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  const stages = [
    "Freezing Mail",
    "Approval of finalized designs",
    "Production",
    "Installation",
  ];

  const getStatusIcon = (status) => {
    if (status === "Completed") {
      return (
        <span className="status-check">
          ✓
        </span>
      );
    }
    return (
      <span className="status-warn">
        !
      </span>
    );
  };

  // Identify tasks that don't belong to any predefined stage, and exclude completed ones to redundant clutter (fixed issues)
  const unclassifiedTasks = tasks.filter(t => !stages.includes(t.stage) && t.status !== "Completed");

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-xl font-semibold mb-6">Project Stages</h2>

      <div className="space-y-4">
        {stages.map((stageName, index) => {
          const stageTasks = tasks.filter((t) => t.stage === stageName);
          if (stageTasks.length === 0) return null;

          const isExpanded = expandedStages[stageName];
          const completedCount = stageTasks.filter(t => t.status === "Completed").length;

          return (
            <div key={stageName} className="border rounded-lg overflow-hidden transition-all">
              {/* STAGE HEADER */}
              <button
                onClick={() => toggleStage(stageName)}
                className={`w-full flex items-center justify-between p-4 text-left transition ${isExpanded ? "bg-indigo-50" : "bg-gray-50 hover:bg-gray-100"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown size={20} className="text-indigo-600" /> : <ChevronRight size={20} className="text-gray-400" />}
                  <div>
                    <h3 className={`font-bold ${isExpanded ? "text-indigo-700" : "text-gray-700"}`}>
                      Phase {index + 1} ➝ {stageName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {completedCount} / {stageTasks.length} tasks completed
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${(completedCount / stageTasks.length) * 100}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* SUB-TASKS LIST */}
              {isExpanded && (
                <div className="p-2 bg-white space-y-1 divide-y">
                  {stageTasks.map((task) => {
                    const taskNameLower = (task.title || task.name || "").toLowerCase();
                    const isDownloadTask = downloadKeywords.some((word) =>
                      taskNameLower.includes(word)
                    );

                    return (
                      <div
                        key={task.id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 hover:bg-gray-50 rounded-md transition-colors gap-2"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(task.status)}
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-800">{task.title || task.name}</p>
                            <span
                              className={`text-[10px] font-bold mt-0.5 px-1.5 py-0.5 rounded w-fit ${task.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                              {task.status === "Completed" ? "Completed" : "Pending"}
                            </span>
                          </div>
                        </div>

                        {/* DOWNLOAD BUTTONS */}
                        {isDownloadTask && (
                          <div className="flex gap-2">
                            <a
                              href={task.fileUrl || "https://drive.google.com/file/d/14XP2DMwnPwreayRRHa5R2dyZoJ0UT8eJ/view?usp=drive_link"}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded transition ${task.fileUrl
                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                }`}
                            >
                              <Download size={12} />
                              {task.fileUrl ? "Download" : "Test File"}
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Uncategorized / Others Section */}
        {unclassifiedTasks.length > 0 && (
          <div className="border rounded-lg overflow-hidden transition-all bg-gray-50 border-dashed border-gray-300">
            <div className="p-4 bg-gray-100 font-bold text-gray-600 flex justify-between">
              <span>Others / Uncategorized</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{unclassifiedTasks.length} tasks</span>
            </div>
            <div className="p-2 space-y-1 divide-y">
              {unclassifiedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 hover:bg-gray-50 rounded-md transition-colors gap-2"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-gray-800">{task.title || task.name}</p>
                      <span
                        className={`text-[10px] font-bold mt-0.5 px-1.5 py-0.5 rounded w-fit ${task.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {task.status === "Completed" ? "Completed" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>
        {`
        .status-check {
          font-size: 18px;
          font-weight: 900;
          color: #16a34a;
          animation: checkPop 0.4s ease-out;
          display: inline-block;
          width: 20px;
          text-align: center;
        }

        .status-warn {
          font-size: 18px;
          font-weight: 900;
          color: #ea580c;
          animation: warnPulse 2s infinite ease-in-out;
          display: inline-block;
          width: 20px;
          text-align: center;
        }

        @keyframes checkPop {
          0%   { transform: scale(0.2); opacity: 0; }
          60%  { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(1); }
        }

        @keyframes warnPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        `}
      </style>
    </div>
  );
};

export default TaskList;
