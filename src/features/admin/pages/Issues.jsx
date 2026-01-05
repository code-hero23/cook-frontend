import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import { Plus, Pencil, Mail, Filter, Search as SearchIcon, X } from "lucide-react";
import { isTaskOverdue } from "../utils/dateUtils.js";

import IssueStats from "../components/IssueStats.jsx";
import IssueDrawer from "../components/IssueDrawer.jsx";

const emptyIssue = {
  title: "",
  projectId: "",
  employeeId: "",
  startDate: "",
  dueDate: "",
  status: "Pending",
  priority: "Medium",
  type: "Issue",
  description: "",
};

const Issues = () => {
  const { tasks, projects, employees, addTask, updateTask, deleteTask } = useApp();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [activeFilter, setActiveFilter] = useState("All"); // All | Open | Closed
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyIssue);

  // Filter Logic
  const issues = tasks.filter((t) => (t.type || "").toLowerCase() === "issue");

  const filtered = issues.filter((t) => {
    // 1. Search Query
    const project = projects.find((p) => p.id === t.projectId);
    const emp = employees.find((e) => e.id === t.employeeId);
    const target = (t.title + (project?.name || "") + (emp?.name || "") + (t.id || "")).toLowerCase();
    const matchesSearch = target.includes(search.toLowerCase());

    // 2. Status Filter
    let matchesFilter = true;
    if (activeFilter === "Open") matchesFilter = t.status !== "Completed" && t.status !== "Resolved";
    if (activeFilter === "Closed") matchesFilter = t.status === "Completed" || t.status === "Resolved";

    return matchesSearch && matchesFilter;
  });

  const openCreate = () => {
    setForm(emptyIssue);
    setEditingId(null);
    setDrawerOpen(true);
  };

  const openEdit = (task) => {
    setForm({
      ...task,
      projectId: task.projectId || "",
      employeeId: task.employeeId || "",
      startDate: (task.startDate || task.createdAt) ? new Date(task.startDate || task.createdAt).toISOString().split('T')[0] : "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
    });
    setEditingId(task.id);
    setDrawerOpen(true);
  };

  const handleSubmit = (formData) => {
    if (!formData.title || !formData.projectId || !formData.employeeId) {
      alert("Title, project and employee are required");
      return;
    }

    if (editingId) updateTask(editingId, formData);
    else addTask(formData);

    const emp = employees.find((e) => e.id === formData.employeeId);
    if (emp) {
      // In real app, toast notification logic here
      // toast.success(`Email sent to ${emp.email}`);
    }

    setDrawerOpen(false);
  };

  const handleDelete = (id) => {
    deleteTask(id);
    setDrawerOpen(false);
  };

  const getStatus = (t) => {
    if (t.status === "Completed") return "Completed";
    if (t.status === "Resolved") return "Resolved";
    if (isTaskOverdue(t)) return "Overdue";
    return t.status;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Issues</h1>
          <p className="text-slate-500 font-medium">Track and triage feedback and problems</p>
        </div>

        <button
          onClick={openCreate}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={18} />
          New Issue
        </button>
      </div>

      {/* Stats Section */}
      <IssueStats issues={issues} />

      {/* Controls / Search */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-50 p-1 rounded-xl">
          {["All", "Open", "Closed"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeFilter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎉</span>
            </div>
            <p className="text-slate-500 font-bold">No issues found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            <div className="grid grid-cols-[80px_2fr_1.5fr_1.5fr_1fr_1fr_100px] text-[11px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4 bg-slate-50/50">
              <div>ID</div>
              <div>Issue</div>
              <div>Project</div>
              <div>Assignee</div>
              <div>Priority</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            {filtered.map((t) => {
              const project = projects.find((p) => p.id === t.projectId);
              const emp = employees.find((e) => e.id === t.employeeId);
              const status = getStatus(t);

              return (
                <div key={t.id} className="grid grid-cols-[80px_2fr_1.5fr_1.5fr_1fr_1fr_100px] items-center px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                  <div className="font-mono text-xs text-orange-600 font-bold">#{t.id.slice(-4)}</div>

                  <div className="pr-4">
                    <p className="font-bold text-slate-800 truncate">{t.title}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{t.description || "No description provided."}</p>
                  </div>

                  <div>
                    <p className="font-medium text-slate-700 truncate">{project?.name || "—"}</p>
                    <p className="text-[10px] font-mono text-slate-400">{project?.projectCode}</p>
                  </div>

                  <div>
                    {emp ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-600 font-medium truncate">{emp.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Unassigned</span>
                    )}
                  </div>

                  <div><StatusBadge status={t.priority} /></div>

                  <div><StatusBadge status={status} /></div>

                  <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                    <button
                      onClick={() => {
                        if (!emp) return alert("No employee assigned.");
                        alert(`Email sent to ${emp.email} for ${t.title} (simulated).`);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Send Email"
                    >
                      <Mail size={16} />
                    </button>
                    <button
                      onClick={() => openEdit(t)}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center gap-1"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawer */}
      <IssueDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialData={form}
        isEditing={!!editingId}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        projects={projects}
        employees={employees}
      />
    </div>
  );
};

export default Issues;
