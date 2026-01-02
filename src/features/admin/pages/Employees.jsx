import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import { Plus, Pencil } from "lucide-react";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  role: "EMPLOYEE",
  status: "ACTIVE",
  password: "",
};

const Employees = () => {
  const { employees, addEmployee, updateEmployee } = useApp();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (emp) => {
    setForm({
      ...emp,
      role: emp.role ? emp.role.toUpperCase() : "EMPLOYEE",
      status: emp.status ? emp.status.toUpperCase() : "ACTIVE",
    });
    setEditingId(emp.id);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert("Name and email are required");
      return;
    }

    if (editingId) {
      updateEmployee(editingId, form);
    } else {
      addEmployee(form);
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Employees</h1>
          <p className="text-sm text-slate-500">
            Manage Cookscape internal team members. Admin can create and maintain credentials.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 text-white px-4 py-2 text-sm shadow-sm hover:bg-orange-500 transition"
        >
          <Plus size={16} />
          Add Employee
        </button>
      </div>

      {/* SEARCH + TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            className="w-full sm:w-72 border border-slate-200 rounded-xl px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <p className="text-xs text-slate-500">
            Total employees: <span className="font-semibold">{employees.length}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b bg-gray-300">
                <th className="py-2 pr-4">Employee</th>
                <th className="py-2 pr-4">Department</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b last:border-0 hover:bg-orange-50/40 transition">
                  <td className="py-2 pr-4">
                    <p className="font-medium">{e.name}</p>
                    <p className="text-xs text-slate-500">
                      {e.id} · {e.email}
                    </p>
                  </td>
                  <td className="py-2 pr-4">{e.department}</td>
                  <td className="py-2 pr-4">{e.role}</td>
                  <td className="py-2 pr-4">{e.phone}</td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="py-2 pr-4 text-right">
                    <button
                      onClick={() => openEdit(e)}
                      className="inline-flex items-center gap-1 text-xs text-orange-600 hover:underline transition"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-md md:max-w-lg p-3 overflow-auto max-h-[85vh]">
            <h2 className="text-lg font-semibold mb-3">
              {editingId ? "Edit Employee" : "Add Employee"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Name*</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Email*</label>
                  <input
                    type="email"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Phone</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Department</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Role</label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="SITE_SUPERVISOR">Site Supervisor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Status</label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                {!editingId && (
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Password*</label>
                    <input
                      type="password"
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 w-full sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-1.5 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition w-full sm:w-auto"
                >
                  {editingId ? "Save Changes" : "Create Employee"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Employees;
