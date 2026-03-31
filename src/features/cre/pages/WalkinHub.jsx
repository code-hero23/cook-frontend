import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Phone, MapPin, User, LogOut, Clock, Calendar, CheckCircle, Activity, Briefcase, Edit2, Star } from 'lucide-react';
import { useCRE } from '../context/CREContext';
import ShowroomMonitor from '../components/ShowroomMonitor';
import toast from 'react-hot-toast';

const WalkinHub = () => {
    const { walkins, stats, loading, bhs, cres, addWalkin, updateWalkin, deleteWalkin } = useCRE();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isPrivileged = ['SUPER_ADMIN', 'MANAGER', 'BUSINESS_HEAD'].includes(user.role);
    const location = useLocation();
    const isDark = false; 
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWalkin, setEditingWalkin] = useState(null);
    
    const initialEntryState = {
        clientName: '',
        contactNumber: '',
        showroom: 'MTRS',
        architect: '',
        bhId: '',
        bhName: '',
        project: '',
        tentativeTime: '',
        inTime: '',
        outTime: '',
        remarks: '',
        dateOfVisit: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        creId: ''
    };

    const [newEntry, setNewEntry] = useState(initialEntryState);

    const [filter, setFilter] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        cre: '',
        bh: ''
    });

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentWalkins = walkins.filter(w => {
        const date = new Date(w.createdAt);
        const matchDate = date.getMonth() + 1 === parseInt(filter.month) && 
                         date.getFullYear() === parseInt(filter.year);
        
        const matchCre = !filter.cre || 
                        w.cre?.name.toLowerCase().includes(filter.cre.toLowerCase());
        
        const matchBh = !filter.bh || 
                       (w.bh?.name.toLowerCase().includes(filter.bh.toLowerCase()) || 
                        w.bhName?.toLowerCase().includes(filter.bh.toLowerCase()));
        
        return matchDate && matchCre && matchBh;
    });

    const filteredWalkins = currentWalkins.filter(w => 
        w.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.contactNumber.includes(searchTerm)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingWalkin) {
                res = await updateWalkin(editingWalkin.id, newEntry);
            } else {
                res = await addWalkin(newEntry);
            }

            if (res.success) {
                toast.success(editingWalkin ? "Entry updated!" : "Visitor recorded!");
                setIsModalOpen(false);
                setEditingWalkin(null);
                setNewEntry(initialEntryState);
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Process failed");
        }
    };

    const handleEdit = (walkin) => {
        setEditingWalkin(walkin);
        setNewEntry({
            clientName: walkin.clientName,
            contactNumber: walkin.contactNumber,
            showroom: walkin.showroom,
            architect: walkin.architect || '',
            project: walkin.project || '',
            tentativeTime: walkin.tentativeTime || '',
            inTime: walkin.inTime || '',
            outTime: walkin.outTime || '',
            remarks: walkin.remarks || '',
            dateOfVisit: walkin.dateOfVisit ? new Date(walkin.dateOfVisit).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: walkin.status || 'ACTIVE',
            creId: walkin.creId || '',
            bhName: walkin.bhName || '',
            bhId: walkin.bhId || ''
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingWalkin(null);
        setNewEntry(initialEntryState);
        setIsModalOpen(true);
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE';
        await updateWalkin(id, { status: nextStatus });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className={`text-3xl font-black tracking-widest flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        WALKIN <span className="text-orange-500 ml-2">HUB</span>
                    </h1>
                    <p className="text-slate-500 text-xs font-bold tracking-[0.2em] mt-1 uppercase">Showroom Live Traffic Monitor</p>
                    <div className="flex items-center gap-2 mt-2">
                        <select 
                            value={filter.month}
                            onChange={(e) => setFilter({...filter, month: e.target.value})}
                            className={`border rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-orange-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.66667%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] min-w-[120px] ${isDark ? 'bg-slate-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <input 
                            type="number"
                            value={filter.year}
                            onChange={(e) => setFilter({...filter, year: e.target.value})}
                            className={`w-20 border rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-orange-500/50 ${isDark ? 'bg-slate-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white border-slate-200 px-4 py-2 rounded-2xl border flex flex-col items-center min-w-[100px] shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                        <span className="text-xl font-black text-orange-500 tracking-tighter">{stats.activeVisitors}</span>
                    </div>
                    <div className="bg-white border-slate-200 px-4 py-2 rounded-2xl border flex flex-col items-center min-w-[100px] shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today</span>
                        <span className="text-xl font-black text-slate-900 tracking-tighter">{stats.totalToday}</span>
                    </div>
                </div>
            </div>

            {/* Showroom Monitor Cards */}
            <ShowroomMonitor walkins={walkins} />

            {/* Advanced Filters Bar */}
            <div className="flex flex-wrap gap-4 items-center bg-white border border-slate-200 p-6 rounded-[32px] shadow-sm">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Filters</span>
                </div>
                <input 
                    type="text"
                    placeholder="Filter by CRE Name..."
                    value={filter.cre}
                    onChange={(e) => setFilter({...filter, cre: e.target.value})}
                    className="border border-slate-100 bg-slate-50/50 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-orange-500/50 min-w-[180px]"
                />
                <input 
                    type="text"
                    placeholder="Filter by BH Name..."
                    value={filter.bh}
                    onChange={(e) => setFilter({...filter, bh: e.target.value})}
                    className="border border-slate-100 bg-slate-50/50 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-orange-500/50 min-w-[180px]"
                />
                <button 
                    onClick={() => setFilter({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), cre: '', bh: '' })}
                    className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 ml-auto"
                >
                    Reset Filters
                </button>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search Client or Contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full border rounded-2xl py-3 pl-12 pr-4 text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-all backdrop-blur-md ${isDark ? 'bg-slate-900/50 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className={`flex-1 md:flex-none flex items-center justify-center px-4 py-3 border rounded-2xl transition-all ${isDark ? 'bg-slate-900/50 border-white/5 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm'}`}>
                        <Filter className="w-4 h-4 mr-2" />
                        <span className="text-xs font-extrabold uppercase">Filters</span>
                    </button>
                    <button 
                        onClick={openAddModal}
                        className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-orange-500 rounded-2xl text-white font-black text-xs uppercase shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Visitor
                    </button>
                </div>
            </div>

            {/* Entries Table */}
            <div className="rounded-[40px] border border-slate-200 overflow-hidden bg-white shadow-sm shadow-slate-200/50">
                <div className="overflow-x-auto min-h-[500px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visitor Info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Showroom</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence>
                                {filteredWalkins.map((w, idx) => (
                                    <motion.tr 
                                        key={w.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center">
                                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-orange-500 font-black border border-orange-100 bg-orange-50 shadow-sm group-hover:scale-110 transition-transform">
                                                        {w.clientName.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="text-sm font-black text-slate-900 tracking-tight">{w.clientName}</p>
                                                        <div className="flex items-center text-[10px] text-slate-400 font-black mt-1 tracking-widest uppercase">
                                                            <Phone className="w-3 h-3 mr-1 text-slate-300" />
                                                            {w.contactNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="inline-flex items-center px-4 py-1.5 rounded-2xl border bg-slate-50 border-slate-200/50">
                                                    <MapPin className="w-3 h-3 mr-2 text-orange-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{w.showroom}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center text-[10px] font-black text-slate-400">
                                                        <User className="w-3 h-3 mr-2 text-slate-300" />
                                                        <span className="uppercase tracking-widest">BH:</span>
                                                        <span className="ml-2 text-slate-600">{w.bh?.name || w.bhName || 'Unassigned'}</span>
                                                    </div>
                                                    <div className="flex items-center text-[10px] font-black text-slate-400">
                                                        <Star className="w-3 h-3 mr-2 text-orange-300" />
                                                        <span className="uppercase tracking-widest text-orange-500/80">CRE:</span>
                                                        <span className="ml-2 font-black text-orange-600 uppercase">{w.cre?.name || 'System'}</span>
                                                    </div>
                                                    <div className="flex items-center text-[10px] font-black text-slate-400">
                                                        <Briefcase className="w-3 h-3 mr-2 text-slate-300" />
                                                        <span className="uppercase tracking-widest">Arch:</span>
                                                        <span className="ml-2 text-slate-600">{w.architect || 'None'}</span>
                                                    </div>
                                                    {w.remarks && (
                                                        <div className="flex items-center text-[10px] font-black text-slate-400">
                                                            <div className="w-3 h-3 mr-2 bg-orange-500/20 rounded-full" />
                                                            <span className="uppercase tracking-widest">Remarks:</span>
                                                            <span className="ml-2 text-slate-500 italic truncate max-w-[150px]">{w.remarks}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black uppercase text-slate-300">In</span>
                                                            <span className="text-[10px] font-black text-slate-600">{w.inTime || '--:--'}</span>
                                                        </div>
                                                        <div className="flex flex-col border-l border-slate-100 pl-3">
                                                            <span className="text-[8px] font-black uppercase text-slate-300">Out</span>
                                                            <span className="text-[10px] font-black text-slate-600">{w.outTime || '--:--'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className={`inline-flex items-center px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${w.status === 'ACTIVE' ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-slate-100 text-slate-400 border border-slate-200/50'}`}>
                                                    {w.status === 'ACTIVE' && <Activity className="w-3 h-3 mr-2 animate-pulse" />}
                                                    {w.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button 
                                                        onClick={() => handleEdit(w)}
                                                        className="p-3 rounded-2xl bg-white text-slate-400 border border-slate-200 hover:text-orange-500 hover:border-orange-500 transition-all shadow-sm"
                                                        title="Edit Entry"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusToggle(w.id, w.status)}
                                                        className={`p-3 rounded-2xl border transition-all ${w.status === 'ACTIVE' ? 'bg-slate-900 text-white border-slate-800 hover:bg-black shadow-lg shadow-slate-200' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-900 hover:border-slate-900 shadow-sm'}`}
                                                        title={w.status === 'ACTIVE' ? "Mark as Out" : "Mark as Active"}
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteWalkin(w.id)}
                                                        className="p-3 rounded-2xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Plus className="w-4 h-4 rotate-45" />
                                                    </button>
                                                </div>
                                            </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredWalkins.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center mb-6 shadow-inner">
                                                <Clock className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">No activity recorded yet</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for New Entry */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={`relative w-full max-w-lg rounded-[32px] border shadow-2xl p-8 overflow-y-auto max-h-[90vh] ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}
                        >
                            <h2 className={`text-2xl font-black uppercase tracking-widest mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{editingWalkin ? 'Edit' : 'New'} <span className="text-orange-500">Visitor</span></h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Client Name</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="John Doe"
                                            value={newEntry.clientName}
                                            onChange={(e) => setNewEntry({...newEntry, clientName: e.target.value})}
                                            className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        />
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Number</label>
                                        <input 
                                            required
                                            type="tel" 
                                            placeholder="99620 XXXXX"
                                            value={newEntry.contactNumber}
                                            onChange={(e) => setNewEntry({...newEntry, contactNumber: e.target.value})}
                                            className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Showroom</label>
                                        <select 
                                            value={newEntry.showroom}
                                            onChange={(e) => setNewEntry({...newEntry, showroom: e.target.value})}
                                            className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.66667%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        >
                                            <option value="MTRS" className={!isDark ? 'text-slate-900' : ''}>MTRS</option>
                                            <option value="OMR" className={!isDark ? 'text-slate-900' : ''}>OMR</option>
                                            <option value="PORUR" className={!isDark ? 'text-slate-900' : ''}>PORUR</option>
                                            <option value="COIMBATORE" className={!isDark ? 'text-slate-900' : ''}>COIMBATORE</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tentative Time</label>
                                        <input 
                                            type="time" 
                                            value={newEntry.tentativeTime}
                                            onChange={(e) => setNewEntry({...newEntry, tentativeTime: e.target.value})}
                                            className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Architect</label>
                                        <input 
                                            type="text" 
                                            placeholder="Name"
                                            value={newEntry.architect}
                                            onChange={(e) => setNewEntry({...newEntry, architect: e.target.value})}
                                            className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Location</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Velachery"
                                            value={newEntry.project}
                                            onChange={(e) => setNewEntry({...newEntry, project: e.target.value})}
                                            className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date of Visit</label>
                                        <input 
                                            type="date" 
                                            value={newEntry.dateOfVisit}
                                            onChange={(e) => setNewEntry({...newEntry, dateOfVisit: e.target.value})}
                                            className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">In Time</label>
                                        <input 
                                            type="time" 
                                            value={newEntry.inTime}
                                            onChange={(e) => setNewEntry({...newEntry, inTime: e.target.value})}
                                            className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Out Time</label>
                                        <input 
                                            type="time" 
                                            value={newEntry.outTime}
                                            onChange={(e) => setNewEntry({...newEntry, outTime: e.target.value})}
                                            className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        />
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label>
                                        <select 
                                            value={newEntry.status}
                                            onChange={(e) => setNewEntry({...newEntry, status: e.target.value})}
                                            className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.66667%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        >
                                            <option value="ACTIVE text-slate-900">ACTIVE</option>
                                            <option value="COMPLETED text-slate-900">COMPLETED</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Remarks</label>
                                        <textarea 
                                            rows="2"
                                            placeholder="Special requirements or observations..."
                                            value={newEntry.remarks}
                                            onChange={(e) => setNewEntry({...newEntry, remarks: e.target.value})}
                                            className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        />
                                    </div>

                                    {/* Business Head Selector */}
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Business Head (BH)</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <select 
                                                value={newEntry.bhName || (newEntry.bhId ? 'EXISTING' : '')}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'MANUAL') {
                                                        setNewEntry({...newEntry, bhId: '', bhName: ''});
                                                    } else if (val === 'EXISTING') {
                                                        setNewEntry({...newEntry, bhName: ''});
                                                    } else if (val === '') {
                                                        setNewEntry({...newEntry, bhId: '', bhName: ''});
                                                    } else {
                                                        setNewEntry({...newEntry, bhId: '', bhName: val});
                                                    }
                                                }}
                                                className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.66667%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                            >
                                                <option value="">Unassigned</option>
                                                <option value="Leo Jenison">Leo Jenison</option>
                                                <option value="Sanghatamizh">Sanghatamizh</option>
                                                <option value="Rajkumar">Rajkumar</option>
                                                <option value="Pughazh">Pughazh</option>
                                                <option value="Shanmugham">Shanmugham</option>
                                                <option value="EXISTING">Registered BH User</option>
                                                <option value="MANUAL">Manual Input...</option>
                                            </select>

                                            {/* Show manual input only if explicitly requested */}
                                            {newEntry.bhName === 'MANUAL' && (
                                                <input 
                                                    type="text"
                                                    placeholder="Enter BH Name"
                                                    value={newEntry.bhName === 'MANUAL' ? '' : newEntry.bhName}
                                                    onChange={(e) => setNewEntry({...newEntry, bhName: e.target.value})}
                                                    className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-orange-50 border-orange-200 text-slate-900'}`}
                                                />
                                            )}

                                            {/* Show registered users list only if 'EXISTING' is selected or bhId is already set */}
                                            {(newEntry.bhId || (newEntry.bhName === 'EXISTING')) && (
                                                <select 
                                                    value={newEntry.bhId}
                                                    onChange={(e) => setNewEntry({...newEntry, bhId: e.target.value, bhName: ''})}
                                                    className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.66667%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                                >
                                                    <option value="">Select Registered User...</option>
                                                    {(bhs || []).map(bh => (
                                                        <option key={bh.id} value={bh.id}>{bh.name}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>

                                    {/* CRE Attribution - Only for Privileged Roles */}
                                    {isPrivileged && (
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-1">Attributed CRE</label>
                                            <select 
                                                value={newEntry.creId}
                                                onChange={(e) => setNewEntry({...newEntry, creId: e.target.value})}
                                                className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%23f97316%22%20stroke-width%3D%221.66667%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-orange-50/50 border-orange-100 text-slate-900'}`}
                                            >
                                                <option value="">Select CRE (Default: You)</option>
                                                {cres.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className={`flex-1 px-6 py-4 border rounded-2xl font-bold text-xs uppercase transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-2 px-8 py-4 bg-orange-500 rounded-2xl text-white font-black text-xs uppercase shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all flex-[2]"
                                    >
                                        Record Visit
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WalkinHub;
