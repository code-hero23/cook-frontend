import React, { useEffect, useState } from "react";
import { X, Check, Trash2, CloudUpload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../../shared/utils/axios";
import { useApp } from "../context/AppContext";

const ProjectDrawer = ({ isOpen, onClose, onSubmit, initialData, isEditing }) => {
    const { employees } = useApp();
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

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isViewOnly = user.role === 'VIEW_ONLY_ADMIN';

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-[100] w-full max-w-2xl bg-white shadow-2xl flex flex-col"
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
                                <fieldset disabled={isViewOnly && isEditing} className="space-y-8 disabled:opacity-80">

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
                                                {isEditing && (
                                                    <>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Project Code</label>
                                                        <input
                                                            disabled
                                                            name="projectCode"
                                                            value={form.projectCode}
                                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
                                                        />
                                                    </>
                                                )}
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
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Business Head (BH)</label>
                                                <select
                                                    name="businessHeadId"
                                                    value={form.businessHeadId || ""}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                >
                                                    <option value="">-- No Business Head Assigned --</option>
                                                    {employees.filter(emp => emp.role === 'SUPER_ADMIN').map(bh => (
                                                        <option key={bh.id} value={bh.id}>
                                                            {bh.name} ({bh.email})
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="text-[10px] text-slate-400 mt-1">Only SUPER_ADMIN employees can be Business Heads.</p>
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Created By</label>
                                                <input
                                                    name="createdBy"
                                                    value={form.createdBy || ""}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                    placeholder="e.g. Sales Team / Admin Name"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section: Project Tracking */}
                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-4 flex items-center gap-2">
                                            <span className="w-8 h-[1px] bg-amber-200"></span> Project Tracking
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
                                                <select
                                                    name="propertyType"
                                                    value={form.propertyType || ""}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                                >
                                                    <option value="">-- Select Type --</option>
                                                    <option value="Residential (Villa)">Residential (Villa)</option>
                                                    <option value="Residential (Apartment)">Residential (Apartment)</option>
                                                    <option value="Commercial">Commercial</option>
                                                    <option value="Office Space">Office Space</option>
                                                    <option value="Retail">Retail</option>
                                                </select>
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Scope of Work</label>
                                                <select
                                                    name="scopeOfWork"
                                                    value={form.scopeOfWork || ""}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                                >
                                                    <option value="">-- Select Scope --</option>
                                                    <option value="Full Interior">Full Interior</option>
                                                    <option value="Partial Interior">Partial Interior</option>
                                                    <option value="Renovation">Renovation</option>
                                                </select>
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Lead Source</label>
                                                <input
                                                    name="leadSource"
                                                    list="leadSourceOptions"
                                                    value={form.leadSource || ""}
                                                    onChange={handleChange}
                                                    placeholder="Walk-in, Referral, etc."
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                                />
                                                <datalist id="leadSourceOptions">
                                                    <option value="Walk-in" />
                                                    <option value="Referral" />
                                                </datalist>
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Client Relationship Executive (CRE)</label>
                                                <input
                                                    name="salesRep"
                                                    value={form.salesRep || ""}
                                                    onChange={handleChange}
                                                    placeholder="e.g. John Doe"
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Feasibility Architect (FA)</label>
                                                <select
                                                    name="faId"
                                                    value={form.faId || ""}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                                >
                                                    <option value="">-- No FA Assigned --</option>
                                                    {employees.filter(emp => emp.role === 'EMPLOYEE' && emp.department === 'FA').map(fa => (
                                                        <option key={fa.id} value={fa.id}>
                                                            {fa.name} ({fa.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Loading Architect (LA)</label>
                                                <select
                                                    name="laId"
                                                    value={form.laId || ""}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                                >
                                                    <option value="">-- No LA Assigned --</option>
                                                    {employees.filter(emp => emp.role === 'EMPLOYEE' && emp.department === 'LA').map(la => (
                                                        <option key={la.id} value={la.id}>
                                                            {la.name} ({la.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section: GPS Location (New) */}
                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-4 flex items-center gap-2">
                                            <span className="w-8 h-[1px] bg-purple-200"></span> Project Location (GPS)
                                        </h3>
                                        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-4">
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="Paste link here (e.g. https://maps.app.goo.gl/...)"
                                                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                                                    onChange={async (e) => {
                                                        const url = e.target.value;

                                                        // 1. Try Client-side Regex first (fastest)
                                                        const coords = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);

                                                        if (coords) {
                                                            setForm(prev => ({
                                                                ...prev,
                                                                latitude: coords[1],
                                                                longitude: coords[2]
                                                            }));
                                                            return;
                                                        }

                                                        // 2. Try Backend Expansion (for short links)
                                                        if (url.includes('goo.gl') || url.includes('maps.app')) {
                                                            try {
                                                                const res = await axios.post('/projects/parse-location', { url });
                                                                if (res.data.latitude && res.data.longitude) {
                                                                    setForm(prev => ({
                                                                        ...prev,
                                                                        latitude: res.data.latitude,
                                                                        longitude: res.data.longitude
                                                                    }));
                                                                }
                                                            } catch (err) {
                                                                console.warn("Could not resolve map link via backend:", err);
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">Paste a Google Maps link to auto-fill coordinates.</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase">Latitude</label>
                                                    <input
                                                        name="latitude"
                                                        value={form.latitude || ''}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 outline-none"
                                                        placeholder="12.9716"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase">Longitude</label>
                                                    <input
                                                        name="longitude"
                                                        value={form.longitude || ''}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 outline-none"
                                                        placeholder="77.5946"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section: Billing Details */}
                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-4 flex items-center gap-2">
                                            <span className="w-8 h-[1px] bg-blue-200"></span> Billing Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Billing Name</label>
                                                <input
                                                    name="billingName"
                                                    value={form.billingName}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                                                    placeholder="Legal Entity / Name"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Billing Phone</label>
                                                <input
                                                    name="billingPhone"
                                                    value={form.billingPhone}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Billing Address</label>
                                                <textarea
                                                    name="billingAddress"
                                                    value={form.billingAddress}
                                                    onChange={handleChange}
                                                    rows="2"
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none resize-none"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN</label>
                                                <input
                                                    name="gstin"
                                                    value={form.gstin}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
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

                                    {/* Section: Spouse Details */}
                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-pink-500 mb-4 flex items-center gap-2">
                                            <span className="w-8 h-[1px] bg-pink-200"></span> Spouse Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Spouse Name</label>
                                                <input
                                                    name="spouseName"
                                                    value={form.spouseName}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                                                <input
                                                    name="spousePhone"
                                                    value={form.spousePhone}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
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
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Total Project Budget (₹)</label>
                                                <input
                                                    type="number"
                                                    name="budget"
                                                    value={form.budget}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                                                    placeholder="e.g. 1000000"
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
                                                    <option value={30}>30 Days</option>
                                                    <option value={45}>45 Days</option>
                                                    <option value={60}>60 Days</option>
                                                    <option value={90}>90 Days</option>
                                                </select>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section: Freezing Mail Details (Only for Create) */}
                                    {!isEditing && (
                                        <section className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                                                    <span className="w-8 h-[1px] bg-amber-200"></span> Freezing Mail Info
                                                </h3>
                                                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg uppercase">Auto-Notify Team</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="col-span-1">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Freezing Amount (₹)</label>
                                                    <input
                                                        type="number"
                                                        name="freezingAmount"
                                                        value={form.freezingAmount || ""}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                                        placeholder="e.g. 30000"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Variant</label>
                                                    <input
                                                        name="variant"
                                                        value={form.variant || ""}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                                        placeholder="e.g. 4x Tuff Gloss"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Woodwork Amount (₹)</label>
                                                    <input
                                                        type="number"
                                                        name="woodworkAmount"
                                                        value={form.woodworkAmount || ""}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm outline-none"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Add ons Amount (₹)</label>
                                                    <input
                                                        type="number"
                                                        name="addOnsAmount"
                                                        value={form.addOnsAmount || ""}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm outline-none"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quote Spreadsheet Link</label>
                                                    <input
                                                        name="quoteLink"
                                                        value={form.quoteLink || ""}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm outline-none"
                                                        placeholder="https://docs.google.com/..."
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">NOTES (FM & PDI)</label>
                                                    <textarea
                                                        name="freezingMailNote"
                                                        value={form.freezingMailNote || ""}
                                                        onChange={handleChange}
                                                        rows="3"
                                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm outline-none resize-none"
                                                        placeholder="Add instructions or specific requirements..."
                                                    />
                                                </div>
                                            </div>

                                            {/* Recipients & Attachments UI can go here or below */}
                                            <div className="space-y-4 pt-4 border-t border-amber-100">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Send Freezing Mail to:</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {employees.map(emp => {
                                                            const isSelected = (form.recipients || []).includes(emp.email);
                                                            return (
                                                                <button
                                                                    key={emp.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const current = form.recipients || [];
                                                                        const next = isSelected 
                                                                            ? current.filter(e => e !== emp.email) 
                                                                            : [...current, emp.email];
                                                                        setForm(prev => ({ ...prev, recipients: next }));
                                                                    }}
                                                                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${isSelected 
                                                                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'}`}
                                                                >
                                                                    {emp.name}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Attachments (Files/Photos)</label>
                                                    <div 
                                                        className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-white hover:border-amber-400 hover:bg-amber-50/30 transition-all text-center group cursor-pointer relative"
                                                        onClick={() => document.getElementById('project-attachments').click()}
                                                    >
                                                        <input 
                                                            type="file" 
                                                            id="project-attachments" 
                                                            multiple 
                                                            hidden 
                                                            onChange={(e) => {
                                                                const files = Array.from(e.target.files);
                                                                setForm(prev => ({ ...prev, attachments: [...(prev.attachments || []), ...files] }));
                                                            }}
                                                        />
                                                        <div className="space-y-2">
                                                            <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-amber-100 text-slate-400 group-hover:text-amber-600 transition-colors">
                                                                <CloudUpload size={24} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-700">Click to upload files</p>
                                                                <p className="text-xs text-slate-400">PDFs, Images, Excel sheets supported</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* File List */}
                                                    {form.attachments?.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {form.attachments.map((file, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs shadow-sm">
                                                                    <span className="max-w-[150px] truncate">{file.name}</span>
                                                                    <button 
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                </fieldset>
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
                            {(!isViewOnly || !isEditing) && (
                                <button
                                    form="project-form"
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                >
                                    <Check size={18} />
                                    {isEditing ? "Save Changes" : "Create Project"}
                                </button>
                            )}
                        </div>

                    </motion.div >
                </>
            )
            }
        </AnimatePresence >
    );
};

export default ProjectDrawer;
