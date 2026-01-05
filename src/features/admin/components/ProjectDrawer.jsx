import React, { useEffect, useState } from "react";
import { X, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProjectDrawer = ({ isOpen, onClose, onSubmit, initialData, isEditing }) => {
    const [form, setForm] = useState(initialData);

    useEffect(() => {
        setForm(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {isEditing ? `Edit ${form.name || 'Project'}` : "Create New Project"}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    {isEditing ? "Update project details and contacts" : "Fill in the information to start a new project"}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Scrollable Form Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            <form id="project-form" onSubmit={handleSubmit} className="space-y-8">

                                {/* Section: Core Info */}
                                <section>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-[1px] bg-indigo-200"></span> Core Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Project Name <span className="text-red-500">*</span></label>
                                            <input
                                                required
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="e.g. Villa Renovation"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Project Code <span className="text-red-500">*</span></label>
                                            <input
                                                required
                                                name="projectCode"
                                                value={form.projectCode}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                                placeholder="PRJ-XXX"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">CP Number</label>
                                            <input
                                                name="cpNumber"
                                                value={form.cpNumber}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                                                placeholder="Contract/Plot No"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Site Location <span className="text-red-500">*</span></label>
                                            <input
                                                required
                                                name="location"
                                                value={form.location}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                                                placeholder="City, Area"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Section: Client Details */}
                                <section>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-[1px] bg-emerald-200"></span> Client Details
                                    </h3>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1">
                                            <label className="block text-xs text-slate-500 mb-1">First Name</label>
                                            <input
                                                required
                                                name="clientFirstName"
                                                value={form.clientFirstName}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-emerald-400"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-xs text-slate-500 mb-1">Last Name</label>
                                            <input
                                                required
                                                name="clientLastName"
                                                value={form.clientLastName}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-emerald-400"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-xs text-slate-500 mb-1">Email <span className="text-red-500">*</span></label>
                                            <input
                                                required
                                                type="email"
                                                name="clientEmail"
                                                value={form.clientEmail}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-emerald-400"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-xs text-slate-500 mb-1">Phone <span className="text-red-500">*</span></label>
                                            <input
                                                required
                                                name="clientPhone"
                                                value={form.clientPhone}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-emerald-400"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-xs text-slate-500 mb-1">Client Password {!isEditing && '*'}</label>
                                            <input
                                                type="password"
                                                name="clientPassword"
                                                value={form.clientPassword}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-1 focus:ring-emerald-400"
                                                placeholder={isEditing ? "Leave blank to keep current" : "Set login password"}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Section: Timeline & Finances */}
                                <section>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-orange-500 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-[1px] bg-orange-200"></span> Timeline & Budget
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                                            <input
                                                required
                                                type="date"
                                                name="startDate"
                                                value={form.startDate}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                                            <input
                                                type="date"
                                                name="deadline"
                                                value={form.deadline}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Total Budget (₹)</label>
                                            <input
                                                type="number"
                                                name="budget"
                                                value={form.budget}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Timeline</label>
                                            <select
                                                name="timelineDuration"
                                                value={form.timelineDuration}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none bg-white"
                                            >
                                                <option value={45}>45 Days (Standard)</option>
                                                <option value={30}>30 Days (Express)</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                            </form>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)] flex items-center justify-end gap-3 z-10">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                form="project-form"
                                type="submit"
                                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                            >
                                <Check size={18} />
                                {isEditing ? "Save Changes" : "Create Project"}
                            </button>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProjectDrawer;
