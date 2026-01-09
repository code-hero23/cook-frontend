import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import { Plus, Pencil, Mail, Eye, X, MapPin, Folder, ChevronRight, ChevronLeft, ArrowLeft, CheckCircle2, Clock, AlertCircle, Download } from "lucide-react";
import { isTaskOverdue } from "../utils/dateUtils.js";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet markers in React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STAGES = {
  "Freezing Mail": [
    "Client Details", "Floor Plan", "Initial Estimate Options",
    "Finalized Variants & Initial Quote", "Initial Schematic Proposal",
    "Blurred DWG", "Payment Gateway", "Booking Docs"
  ],
  "Approval of finalized designs": [
    "PDI Reports", "FM taken by AE", "2D Drawing",
    "3D Rendered Images", "Production Payment", "Approval of Finalized Designs"
  ],
  "Production": [
    "Factory Production", "Quality Check Process"
  ],
  "Installation": [
    "Installation Work", "Completion Certificate"
  ]
};

const emptyTask = {
  title: "",
  projectId: "",
  employeeId: "",
  startDate: "",
  dueDate: "",
  status: "Pending",
  priority: "Medium",
  type: "TASK",
  stage: "", // Added stage
  description: "",
};

const Tasks = () => {
  const { tasks, projects, employees, addTask, updateTask } = useApp();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyTask);

  // Navigation State
  const [selectedProject, setSelectedProject] = useState(null);

  // -------------------------------------------------------------------------
  // Auto-Calculate Dates for "Factory Production"
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (form.title === "Factory Production" && form.projectId) {
      const project = projects.find(p => p.id === form.projectId);
      if (project) {
        // Start Date: Project Start Date OR Today
        const startDateObj = project.startDate ? new Date(project.startDate) : new Date();

        // Duration: Use project timeline duration (default 45)
        const duration = project.timelineDuration || 45;

        // Calculate Due Date
        const dueDateObj = new Date(startDateObj);
        dueDateObj.setDate(dueDateObj.getDate() + duration);

        // Format to YYYY-MM-DD for input[type="date"]
        const toInputDate = (d) => d.toISOString().split('T')[0];

        setForm(prev => ({
          ...prev,
          startDate: toInputDate(startDateObj),
          dueDate: toInputDate(dueDateObj)
        }));
      }
    }
  }, [form.title, form.projectId, projects]);

  // Evidence Modal State
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  const [evidenceIndex, setEvidenceIndex] = useState(0);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isManager = (user.role || "").toUpperCase() === "MANAGER";

  const tasksOnly = tasks.filter((t) => t.type?.toUpperCase() === "TASK");

  // Calculate Project Metrics
  const projectMetrics = useMemo(() => {
    return projects.map(project => {
      const projectTasks = tasksOnly.filter(t => t.projectId === project.id);

      // Case-insensitive check for reliability
      const completed = projectTasks.filter(t => ['completed', 'done'].includes((t.status || "").toLowerCase())).length;
      const pending = projectTasks.filter(t => !['completed', 'done'].includes((t.status || "").toLowerCase())).length;
      const overdue = projectTasks.filter(t => isTaskOverdue(t)).length;

      return {
        ...project,
        taskCount: projectTasks.length,
        completedCount: completed,
        pendingCount: pending,
        overdueCount: overdue,
        progress: projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0
      };
    });
  }, [projects, tasksOnly]);

  const filteredTasks = useMemo(() => {
    let scopedTasks = tasksOnly;

    // Filter by Project if selected
    if (selectedProject) {
      scopedTasks = scopedTasks.filter(t => t.projectId === selectedProject.id);
    }

    // Filter by Search
    if (search) {
      scopedTasks = scopedTasks.filter((t) => {
        const project = projects.find((p) => p.projectId === t.projectId);
        const emp = employees.find((e) => e.id === t.employeeId);
        const target =
          (t.title +
            (project?.name || "") +
            (emp?.name || "") +
            (t.id || "") +
            (t.description || "") +
            (t.status || "")
          ).toLowerCase();
        return target.includes(search.toLowerCase());
      });
    }
    return scopedTasks;
  }, [tasksOnly, selectedProject, search, projects, employees]);


  const openCreate = () => {
    setForm(emptyTask);
    if (selectedProject) {
      setForm(prev => ({ ...prev, projectId: selectedProject.id }));
    }
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setForm(task);
    setEditingId(task.id);
    setModalOpen(true);
  };

  const openEvidence = (task) => {
    setViewingTask(task);
    setEvidenceIndex(0); // Reset gallery specific to this task
    setEvidenceModalOpen(true);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.projectId || !form.employeeId) {
      alert("Title, project and employee are required");
      return;
    }

    // Sanitize Payload (Whitelist)
    const allowedFields = [
      "title", "projectId", "employeeId", "startDate", "dueDate",
      "status", "priority", "type", "stage", "description"
    ];

    const payload = {};
    allowedFields.forEach(key => {
      if (form[key] !== undefined && form[key] !== null && form[key] !== "") {
        payload[key] = form[key];
      }
    });

    if (payload.startDate) payload.startDate = new Date(payload.startDate).toISOString();
    if (payload.dueDate) payload.dueDate = new Date(payload.dueDate).toISOString();

    payload.priority = (payload.priority || "MEDIUM").toUpperCase();
    payload.status = (payload.status || "PENDING").toUpperCase();
    if (!payload.stage) payload.stage = null;



    if (editingId) updateTask(editingId, payload);
    else addTask(payload);

    const emp = employees.find((e) => e.id === form.employeeId);
    if (emp) {
      alert(`Email sent to ${emp.email} (simulated).`);
    }

    setModalOpen(false);
  };

  const getStatus = (t) => {
    if (t.status === "Completed") return "Completed";
    if (isTaskOverdue(t)) return "Overdue";
    return t.status;
  };

  // --- RENDER PROJECT GRID ---
  if (!selectedProject) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Projects Overview</h1>
            <p className="text-sm text-slate-500">Select a project to view and manage its tasks.</p>
          </div>
          {!isManager && user.role !== 'VIEW_ONLY_ADMIN' && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-bold shadow-lg hover:bg-slate-800 transition"
            >
              <Plus size={16} />
              Global Task
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectMetrics.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedProject(p)}
              className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 transition-colors">
                  <Folder className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-bold ${p.overdueCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {p.overdueCount > 0 ? `${p.overdueCount} Overdue` : 'On Track'}
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1">{p.name}</h3>
              <p className="text-xs text-slate-500 font-medium mb-6 flex items-center gap-1">
                <MapPin size={12} /> {p.location || 'No Location'}
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-black text-slate-800">{p.taskCount}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-black text-orange-600">{p.pendingCount}</div>
                  <div className="text-[10px] uppercase font-bold text-orange-400">Pending</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-black text-emerald-600">{p.completedCount}</div>
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Done</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Reuse Modal for Global Task Creation */}
        {modalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-md md:max-w-lg p-3 overflow-auto max-h-[85vh]">
              <h2 className="text-lg font-semibold mb-3">
                {editingId ? "Edit Task" : "Create Task"}
              </h2>
              {/* Form (Simplified placeholder for brevity in grid view, real form below) */}
              {/* Note: In a real app, I'd extract the Form to a component to avoid duplication. 
                          For now, I'll allow the modal logic to be shared by moving the form rendering 
                          outside the conditional return if I could, but React requires one return.
                          
                          SOLUTION: I will keep the modal logic at the very end and wrap the logic 
                          in a Fragment or render conditionally.
                          
                          Actually, since I'm returning early, I must render the Modal HERE for the "Global Task" button to work.
                      */}
              <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                {/* ... Duplicated Form Logic for Grid View ... 
                              Ideally, I'd refactor. But to be safe and quick, I will just paste the form code again or 
                              structure the component so the returns are children of a layout that holds the modal.
                              
                              Let's restructure:
                              renderContent() -> returns Grid or List
                              return ( <div> {renderContent()} {modal} </div> )
                          */}
                {/* Wait, I cannot change the structure too much right now in this prompt block. 
                              I will Render the Modal here too.
                          */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Select Project*</label>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                      value={form.projectId}
                      onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                    >
                      <option value="">-- Select Project --</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.projectCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Assign Employee*</label>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                      value={form.employeeId}
                      onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    >
                      <option value="">-- Select Employee --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Type</label>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="TASK">Task</option>
                      <option value="ISSUE">Issue</option>
                    </select>
                  </div>
                  {form.type === "TASK" && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Stage</label>
                      <select
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                        value={form.stage || ""}
                        onChange={(e) => {
                          setForm({ ...form, stage: e.target.value, title: "" });
                        }}
                      >
                        <option value="">-- Select Stage --</option>
                        {Object.keys(STAGES).map((stage) => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">Task Title*</label>
                    {form.type === "TASK" && form.stage && STAGES[form.stage] ? (
                      <select
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                      >
                        <option value="">-- Select Standard Task --</option>
                        {STAGES[form.stage].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder={form.type === "TASK" ? "Select a stage first..." : "e.g. Fix login bug"}
                        disabled={form.type === "TASK" && !form.stage}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Due Date</label>
                    <input
                      type="date"
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Priority</label>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Description</label>
                  <textarea
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 h-20"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Additional details..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-sm rounded-lg bg-[#075E54] text-white hover:bg-[#05483f] inline-flex items-center gap-1 transition w-full sm:w-auto justify-center"
                  >
                    <Mail size={14} />
                    {editingId ? "Save & Notify" : "Create & Notify"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER TASK LIST (Drill-down) ---
  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedProject(null)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              {selectedProject.name} <span className="text-slate-300">/</span> Tasks
            </h1>
            <p className="text-sm text-slate-500">
              {selectedProject.location}
            </p>
          </div>
        </div>

        {!isManager && user.role !== 'VIEW_ONLY_ADMIN' && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 text-white px-4 py-2 text-sm hover:bg-orange-500 transition"
          >
            <Plus size={16} />
            New Project Task
          </button>
        )}
      </div>

      {/* SEARCH & GRID */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full sm:w-80 border border-slate-200 rounded-xl px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold">{filteredTasks.length}</span> tasks
          </p>
        </div>

        {/* HEADER ROW + ROWS (scrollable on small screens) */}
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[80px_2fr_1.5fr_1.5fr_1.5fr_1fr_1fr_1fr_120px] text-[11px] font-semibold text-slate-500 border-b px-2 py-2 bg-gray-50">
              <div>ID</div>
              <div>Task</div>
              <div>Assigned To</div>
              <div>Timeline</div>
              <div>Stage</div>
              <div>Priority</div>
              <div>Status</div>
              <div>Last Update</div>
              <div className="text-right">Actions</div>
            </div>

            {/* ROWS */}
            {filteredTasks.map((t) => {
              const emp = employees.find((e) => e.id === t.employeeId);
              const status = getStatus(t);

              return (
                <div
                  key={t.id}
                  className="grid grid-cols-[80px_2fr_1.5fr_1.5fr_1.5fr_1fr_1fr_1fr_120px] items-center border-b py-3 text-xs hover:bg-slate-50 transition-colors"
                >
                  <div className="font-mono text-[10px] text-slate-400 font-medium">#{t.id.slice(0, 6)}</div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm mb-0.5">{t.title}</p>
                    {t.type === 'ISSUE' && <span className="bg-rose-100 text-rose-600 text-[10px] px-1.5 rounded font-bold">ISSUE</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-[10px] font-bold">
                      {emp?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{emp?.name || "Unassigned"}</p>
                      <div className="text-[10px] text-slate-400">{emp?.role}</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      <span className="text-slate-600">{t.startDate ? new Date(t.startDate).toLocaleDateString() : 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                      <span className="text-slate-600">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'TBD'}</span>
                    </div>
                  </div>

                  <div>
                    {t.stage ? (
                      <span className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wide shadow-sm">
                        {t.stage}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </div>

                  <div><StatusBadge status={t.priority} /></div>

                  <div><StatusBadge status={status} /></div>

                  <div className="text-slate-400 italic">
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </div>

                  <div className="text-right space-x-2 flex justify-end">
                    {/* View Evidence or Completion File Button */}
                    {((t.evidence && t.evidence.length > 0) || t.completionFileUrl) && (
                      <button
                        onClick={() => openEvidence(t)}
                        className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 p-1.5 rounded-lg transition-colors border border-slate-200"
                        title="View Proof"
                      >
                        <Eye size={14} />
                      </button>
                    )}

                    {user.role === 'SUPER_ADMIN' && user.role !== 'VIEW_ONLY_ADMIN' && (
                      <button
                        onClick={() => openEdit(t)}
                        className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 p-1.5 rounded-lg transition-colors border border-slate-200"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (!emp) return alert("No employee assigned.");
                        alert(`Email sent to ${emp.email} for ${t.title} (simulated).`);
                      }}
                      className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 p-1.5 rounded-lg transition-colors border border-slate-200"
                      title="Send Mail"
                    >
                      <Mail size={14} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Folder className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No tasks found in this project.</p>
            <button onClick={openCreate} className="text-indigo-600 text-sm font-bold mt-2 hover:underline">
              Create the first task
            </button>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      {
        modalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-md md:max-w-lg p-3 overflow-auto max-h-[85vh]">
              <h2 className="text-lg font-semibold mb-3">
                {editingId ? "Edit Task" : "Create Task"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3 text-sm">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Select Project*</label>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                      value={form.projectId}
                      onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                    >
                      <option value="">-- Select Project --</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.projectCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Assign Employee*</label>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                      value={form.employeeId}
                      onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    >
                      <option value="">-- Select Employee --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Type</label>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="TASK">Task</option>
                      <option value="ISSUE">Issue</option>
                    </select>
                  </div>

                  {/* Stage Selection (Only for TASKS) */}
                  {form.type === "TASK" && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Stage</label>
                      <select
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                        value={form.stage || ""}
                        onChange={(e) => {
                          setForm({ ...form, stage: e.target.value, title: "" }); // Reset title on stage change
                        }}
                      >
                        <option value="">-- Select Stage --</option>
                        {Object.keys(STAGES).map((stage) => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Task Title (Dropdown for Tasks if Stage Selected, else Input) */}
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">Task Title*</label>
                    {form.type === "TASK" && form.stage && STAGES[form.stage] ? (
                      <select
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                      >
                        <option value="">-- Select Standard Task --</option>
                        {STAGES[form.stage].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder={form.type === "TASK" ? "Select a stage first..." : "e.g. Fix login bug"}
                        disabled={form.type === "TASK" && !form.stage}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Due Date</label>
                    <input
                      type="date"
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Priority</label>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Description</label>
                  <textarea
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 h-20"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Additional details..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-sm rounded-lg bg-[#075E54] text-white hover:bg-[#05483f] inline-flex items-center gap-1 transition w-full sm:w-auto justify-center"
                  >
                    <Mail size={14} />
                    {editingId ? "Save & Notify" : "Create & Notify"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* EVIDENCE VERIFICATION MODAL */}
      {evidenceModalOpen && viewingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
            {/* Left: Image Proof */}
            <div className="flex-1 bg-black relative min-h-[300px] md:h-auto group flex items-center justify-center">
              {(() => {
                const hasEvidence = viewingTask.evidence && viewingTask.evidence.length > 0;
                // If has evidence array, use index, otherwise fallback to completionFileUrl
                const currentEvidence = hasEvidence ? viewingTask.evidence[evidenceIndex] : null;
                const imageUrl = currentEvidence ? currentEvidence.url : viewingTask.completionFileUrl;

                // Helper to get full URL
                const getFullUrl = (path) => `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, '')}${path}`;
                const fullUrl = getFullUrl(imageUrl);

                const isImage = imageUrl?.match(/\.(jpeg|jpg|png|gif|webp)$/i);

                return (
                  <>
                    {!isImage ? (
                      <div className="text-white text-center p-6">
                        <Folder size={48} className="mx-auto mb-4 text-slate-400" />
                        <p className="text-lg font-bold mb-2">File Attachment</p>
                        <p className="text-sm text-slate-400 mb-6 break-all">{imageUrl}</p>
                        <a href={fullUrl} target="_blank" rel="noreferrer" className="px-6 py-2 bg-indigo-600 rounded-full font-bold hover:bg-indigo-500 transition">
                          Download / View File
                        </a>
                      </div>
                    ) : (
                      <img
                        src={fullUrl}
                        alt="Evidence"
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    )}

                    {/* Navigation Buttons (Only if multiple items) */}
                    {hasEvidence && viewingTask.evidence.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEvidenceIndex(prev => Math.max(0, prev - 1));
                          }}
                          disabled={evidenceIndex === 0}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 disabled:opacity-30 transition"
                        >
                          <ChevronLeft size={24} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEvidenceIndex(prev => Math.min(viewingTask.evidence.length - 1, prev + 1));
                          }}
                          disabled={evidenceIndex === viewingTask.evidence.length - 1}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 disabled:opacity-30 transition"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </>
                    )}
                  </>
                );
              })()}

              <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-1 items-start">
                  <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-mono border border-white/20">
                    {viewingTask.evidence && viewingTask.evidence.length > 0
                      ? new Date(viewingTask.evidence[evidenceIndex].capturedAt).toLocaleString()
                      : "Task Completion Upload"
                    }
                  </span>
                  {/* Counter Badge */}
                  {viewingTask.evidence && viewingTask.evidence.length > 1 && (
                    <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      {evidenceIndex + 1} / {viewingTask.evidence.length}
                    </span>
                  )}
                </div>

                {(() => {
                  const hasEvidence = viewingTask.evidence && viewingTask.evidence.length > 0;
                  const urlPath = hasEvidence ? viewingTask.evidence[evidenceIndex].url : viewingTask.completionFileUrl;
                  const dlUrl = `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, '')}${urlPath}`;

                  return (
                    <a
                      href={dlUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="bg-black/50 backdrop-blur-md text-white p-2 rounded-full border border-white/20 hover:bg-white/20 transition pointer-events-auto flex items-center justify-center"
                      title="Download File"
                    >
                      <Download size={16} />
                    </a>
                  );
                })()}
              </div>
            </div>

            {/* Right: Map & Details */}
            <div className="w-full md:w-[350px] bg-slate-50 p-6 flex flex-col border-l border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Verify Work</h2>
                <button
                  onClick={() => setEvidenceModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto">
                {/* Task Info */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Task Details</h3>
                  <p className="font-bold text-slate-800">{viewingTask.title}</p>
                  <p className="text-sm text-slate-500">{viewingTask.project?.name || 'Unknown Project'}</p>
                </div>

                {/* Location Map (Only if GPS Evidence exists) */}
                {viewingTask.evidence && viewingTask.evidence.length > 0 && viewingTask.evidence[evidenceIndex]?.latitude != null ? (
                  <>
                    <div className="h-48 rounded-2xl overflow-hidden border-2 border-white shadow-md relative">
                      <MapContainer
                        key={evidenceIndex} // Re-render map when index changes to flyTo new center
                        center={[viewingTask.evidence[evidenceIndex].latitude, viewingTask.evidence[evidenceIndex].longitude]}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        dragging={false}
                        zoomControl={false}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[viewingTask.evidence[evidenceIndex].latitude, viewingTask.evidence[evidenceIndex].longitude]} />
                      </MapContainer>
                      <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm z-[1000] flex items-center gap-1">
                        <MapPin size={10} className="text-red-500" />
                        GPS Location
                      </div>
                    </div>

                    {/* Status */}
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-emerald-700 uppercase">Live Proof</span>
                      </div>
                      <p className="text-xs text-emerald-600">
                        Supervisor captured this image at the specified location coordinates.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-100 rounded-xl p-6 text-center border border-slate-200">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 mb-1">Task Completed</p>
                    <p className="text-xs text-slate-500">
                      This file was uploaded by the employee upon task completion. No GPS data associated.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={() => setEvidenceModalOpen(false)}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                >
                  Close Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div >
  );
};

export default Tasks;
