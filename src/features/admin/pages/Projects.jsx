import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import { Plus, Pencil } from "lucide-react";
import { isProjectOverdue } from "../utils/dateUtils.js";

const emptyProject = {
  name: "",
  projectCode: "", // Added projectCode
  clientFirstName: "",
  clientLastName: "",
  clientEmail: "",
  clientPhone: "",
  spouseName: "",
  spousePhone: "",
  location: "",
  handingOverMonth: "",
  handingOverYear: "",
  budget: "",
  billingName: "",
  billingPhone: "",
  gstin: "",
  startDate: "",
  deadline: "",
  cpNumber: "",
  clientPassword: "",
};

const Projects = () => {
  const { projects, addProject, updateProject } = useApp();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProject);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isManager = (user.role || "").toUpperCase() === "MANAGER";

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.clientFirstName?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (p.clientLastName?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (p.projectCode?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm(emptyProject);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    // Sanitize and map for form
    const editForm = {
      ...emptyProject,
      ...p,
      // Ensure dates are strings for input[type="date"]
      startDate: p.startDate ? p.startDate.split('T')[0] : "",
      deadline: p.deadline ? p.deadline.split('T')[0] : "",
      // Budget to string for input
      budget: p.budget ? p.budget.toString() : "",
      // Password should be empty on edit to avoid showing hash
      clientPassword: "",
      handingOverMonth: p.handingOverMonth || "",
      handingOverYear: p.handingOverYear || "",
      // Ensure strings for names
      clientFirstName: p.clientFirstName || "",
      clientLastName: p.clientLastName || "",
    };
    setForm(editForm);
    setEditingId(p.id);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.clientFirstName || !form.clientLastName || !form.startDate || !form.clientPhone || !form.projectCode) {
      alert("Project Data Missing: Name, Code, Client Name, Contact, Start Date are required");
      return;
    }

    // Ensure numeric types are converted if necessary (budget handled as string in form, float in DB? Prisma handles implied conversion often, but clean up is good)
    // Sanitize payload for Prisma
    const secureForm = { ...form };

    // Handle Float
    if (secureForm.budget) {
      secureForm.budget = parseFloat(secureForm.budget);
    } else {
      delete secureForm.budget; // or set to null
    }

    // Handle Dates (Prisma DateTime expects ISO-8601 or Date object)
    if (secureForm.startDate) secureForm.startDate = new Date(secureForm.startDate).toISOString();
    if (secureForm.deadline) {
      secureForm.deadline = new Date(secureForm.deadline).toISOString();
    } else {
      delete secureForm.deadline;
    }

    // Clean up empty strings for optional fields to avoid "Provided String, expected Float/Int/Date" errors
    Object.keys(secureForm).forEach(key => {
      if (secureForm[key] === "") {
        delete secureForm[key];
      }
    });

    // Remove password if empty during edit to avoid overwriting with empty string
    if (editingId && !secureForm.clientPassword) {
      delete secureForm.clientPassword;
    }

    if (editingId) {
      updateProject(editingId, secureForm);
    } else {
      if (!secureForm.clientPassword) {
        alert("Client Password is required for new projects.");
        return;
      }
      addProject(secureForm);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className="text-sm text-slate-500">
            Create and maintain project details. Overdue = more than 45 days.
          </p>
        </div>
        {!isManager && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 text-white px-4 py-2 text-sm shadow-sm hover:bg-orange-500"
          >
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search by name, client, or ID..."
            className="w-full sm:w-72 border border-slate-200 rounded-xl px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <p className="text-xs text-slate-500">
            Total projects:{" "}
            <span className="font-semibold">{projects.length}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b bg-gray-300">
                <th className="py-2 px-4">Project ID</th>
                <th className="py-2 pr-4">Project Name</th>
                <th className="py-2 pr-4">Client Details</th>
                <th className="py-2 pr-4">Dates</th>
                <th className="py-2 pr-4">Location & Budget</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const overdue = isProjectOverdue(p);
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-2 px-4 font-mono text-xs text-brand-600 font-semibold">
                      {p.projectCode}
                    </td>
                    <td className="py-2 pr-4">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-[10px] text-slate-500">
                        CP: {p.cpNumber}
                      </p>
                    </td>
                    <td className="py-2 pr-4">
                      <p className="font-medium">{p.clientFirstName} {p.clientLastName}</p>
                      <p className="text-xs text-slate-500">{p.clientEmail}</p>
                      <p className="text-[10px] text-slate-400">{p.clientPhone}</p>
                    </td>
                    <td className="py-2 pr-4">
                      <p className="text-xs"><span className="text-slate-500">S:</span> {p.startDate ? new Date(p.startDate).toLocaleDateString() : ''}</p>
                      <p className="text-xs text-slate-500"><span className="text-slate-500">D:</span> {p.deadline ? new Date(p.deadline).toLocaleDateString() : ''}</p>
                      <p className="text-[10px] text-brand-600 font-medium">{p.handingOverMonth} {p.handingOverYear}</p>
                    </td>
                    <td className="py-2 pr-4">
                      <p className="text-xs">{p.location}</p>
                      <p className="text-xs font-semibold text-slate-700">₹{p.budget}</p>
                    </td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={overdue ? "Overdue" : "Active"} />
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {!isManager ? (
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/projects/${p.id}/manage`}
                            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline font-semibold"
                          >
                            Manage
                          </Link>
                          <button
                            onClick={() => openEdit(p)}
                            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/projects/${p.id}/manage`}
                            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline font-semibold"
                          >
                            View
                          </Link>
                          <span className="text-xs text-slate-400 italic">No Edit</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-lg md:max-w-2xl p-4 overflow-auto max-h-[90vh]">
            <h2 className="text-lg font-semibold mb-3">
              {editingId ? "Edit Project" : "Create Project"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Project Name*</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Project Code* (e.g. PRJ-001)</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.projectCode}
                    onChange={(e) => setForm({ ...form, projectCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">First Name*</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.clientFirstName}
                    onChange={(e) => setForm({ ...form, clientFirstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Last Name*</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.clientLastName}
                    onChange={(e) => setForm({ ...form, clientLastName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Email*</label>
                  <input
                    type="email"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.clientEmail}
                    onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Contact Number*</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.clientPhone}
                    onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Spouse Name</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.spouseName}
                    onChange={(e) => setForm({ ...form, spouseName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Spouse Contact Number</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.spousePhone}
                    onChange={(e) => setForm({ ...form, spousePhone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Site Location*</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Handing Over Month</label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.handingOverMonth}
                    onChange={(e) => setForm({ ...form, handingOverMonth: e.target.value })}
                  >
                    <option value="">Select Month</option>
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Handing Over Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2024"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.handingOverYear}
                    onChange={(e) => setForm({ ...form, handingOverYear: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Budget</label>
                  <input
                    type="number"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Billing Name</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.billingName}
                    onChange={(e) => setForm({ ...form, billingName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Billing Contact Number</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.billingPhone}
                    onChange={(e) => setForm({ ...form, billingPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">GSTIN</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.gstin}
                    onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">CP Number</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.cpNumber}
                    onChange={(e) => setForm({ ...form, cpNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Project Start Date*</label>
                  <input
                    type="date"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Project Deadline</label>
                  <input
                    type="date"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Project Timeline</label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.timelineDuration || 45} // Default 45
                    onChange={(e) => setForm({ ...form, timelineDuration: parseInt(e.target.value) })}
                  >
                    <option value={45}>45 Days (Standard)</option>
                    <option value={30}>30 Days (Fast Track)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Client Access Password</label>
                  <input
                    type="password"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.clientPassword}
                    onChange={(e) => setForm({ ...form, clientPassword: e.target.value })}
                    placeholder="Set password for client"
                  />
                </div>
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
                  className="px-4 py-1.5 text-sm rounded-lg bg-brand-500 text-white hover:bg-orange-500 w-full sm:w-auto"
                >
                  {editingId ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
