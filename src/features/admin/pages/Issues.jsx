import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import { Plus, Pencil, Mail } from "lucide-react";
import { isTaskOverdue } from "../utils/dateUtils.js";

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
  const { tasks, projects, employees, addTask, updateTask } = useApp();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyIssue);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isManager = (user.role || "").toUpperCase() === "MANAGER";

  const issues = tasks.filter((t) => (t.type || "").toUpperCase() === "ISSUE");

  const filtered = issues.filter((t) => {
    const project = projects.find((p) => p.id === t.projectId);
    const emp = employees.find((e) => e.id === t.employeeId);
    const target =
      (t.title + (project?.name || "") + (emp?.name || "") + (t.id || "")).toLowerCase();
    return target.includes(search.toLowerCase());
  });

  const openCreate = () => {
    setForm(emptyIssue);
    setEditingId(null);
    setModalOpen(true);
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
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.projectId || !form.employeeId) {
      alert("Title, project and employee are required");
      return;
    }

    if (editingId) updateTask(editingId, form);
    else addTask(form);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Issues</h1>
          <p className="text-sm text-slate-500">Track and triage issues raised against projects.</p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 text-white px-4 py-2 text-sm hover:bg-orange-500 transition"
        >
          <Plus size={16} />
          New Issue
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search by title, project, or employee..."
            className="w-full sm:w-80 border border-slate-200 rounded-xl px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <p className="text-xs text-slate-500">
            Total issues: <span className="font-semibold">{issues.length}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[100px_2fr_1.5fr_1.5fr_1.5fr_1fr_1fr_100px] text-[11px] font-semibold text-slate-500 border-b px-2 py-2 bg-gray-300">
              <div>ID</div>
              <div>Issue</div>
              <div>Project</div>
              <div>Employee</div>
              <div>Start / Due</div>
              <div>Priority</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            {filtered.map((t) => {
              const project = projects.find((p) => p.id === t.projectId);
              const emp = employees.find((e) => e.id === t.employeeId);
              const status = getStatus(t);

              return (
                <div key={t.id} className="grid grid-cols-[100px_2fr_1.5fr_1.5fr_1.5fr_1fr_1fr_100px] items-center border-b py-2 text-xs">
                  <div className="font-mono text-xs text-orange-600 font-semibold">{t.id}</div>
                  <div>
                    <p className="font-medium">{t.title}</p>
                  </div>

                  <div>
                    <p>{project?.name || "—"}</p>
                    <p className="text-[11px] text-slate-500">{t.projectId}</p>
                  </div>

                  <div>
                    <p>{emp?.name || "Unassigned"}</p>
                    <p className="text-[11px] text-slate-500">{emp?.email || ""}</p>
                  </div>

                  <div>
                    <p>{t.startDate}</p>
                    <p className="text-[11px] text-slate-500">{t.dueDate}</p>
                  </div>

                  <div><StatusBadge status={t.priority} /></div>

                  <div><StatusBadge status={status} /></div>

                  <div className="text-right space-x-2">
                    <button
                      onClick={() => openEdit(t)}
                      className="inline-flex items-center gap-1 text-orange-600 hover:underline"
                    >
                      <Pencil size={14} /> Edit
                    </button>

                    <button
                      onClick={() => {
                        if (!emp) return alert("No employee assigned.");
                        alert(`Email sent to ${emp.email} for ${t.title} (simulated).`);
                      }}
                      className="inline-flex items-center gap-1 text-[#075E54] hover:underline"
                    >
                      <Mail size={14} /> Mail
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="py-4 text-center text-slate-500 text-sm">No issues found.</div>
        )}
      </div>

      {/* Modal */}
      {
        modalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-md md:max-w-lg p-3 overflow-auto max-h-[85vh]">
              <h2 className="text-lg font-semibold mb-3">{editingId ? "Edit Issue" : "Create Issue"}</h2>

              <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Issue Title*</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Issue description"
                  />
                </div>

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
                        <option key={p.id} value={p.id}>{p.name} ({p.projectCode})</option>
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
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Start Date</label>
                    <input type="date" className="w-full border border-slate-200 rounded-lg px-2 py-1.5" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Due Date</label>
                    <input type="date" className="w-full border border-slate-200 rounded-lg px-2 py-1.5" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Priority</label>
                    <select className="w-full border border-slate-200 rounded-lg px-2 py-1.5" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Type</label>
                    <select className="w-full border border-slate-200 rounded-lg px-2 py-1.5" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      <option>Issue</option>
                      <option>Task</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Description</label>
                  <textarea className="w-full border border-slate-200 rounded-lg px-2 py-1.5 h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Additional details..." />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 w-full sm:w-auto">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-sm rounded-lg bg-[#075E54] text-white hover:bg-[#05483f] inline-flex items-center gap-1 transition w-full sm:w-auto justify-center">
                    <Mail size={14} />
                    {editingId ? "Save & Notify" : "Create & Notify"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default Issues;
