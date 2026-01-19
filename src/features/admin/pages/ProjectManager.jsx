import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from "../../../shared/utils/axios";
import { ArrowLeft, Upload, Trash2, FileText, Image as ImageIcon, Calendar, Eye, X } from 'lucide-react';

const ProjectManager = () => {
    const { id } = useParams();
    const { projects } = useApp();
    const project = projects.find(p => p.id === id);
    const [activeTab, setActiveTab] = useState('gallery');

    if (!project) return <div className="p-8">Loading Project or Not Found...</div>;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/admin/projects" className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50">
                    <ArrowLeft size={20} className="text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                    <p className="text-sm text-slate-500">Manage Project Assets & Timeline</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                {['gallery', 'documents', 'timeline', 'settings'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors
                            ${activeTab === tab ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'gallery' && <GalleryManager projectId={id} />}
                {activeTab === 'documents' && <DocumentManager projectId={id} />}
                {activeTab === 'timeline' && <TimelineManager projectId={id} />}
                {activeTab === 'settings' && <SettingsManager projectId={id} />}
            </div>
        </div>
    );
};

// --- SUB COMPONENTS ---

const GalleryManager = ({ projectId }) => {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    const fetchImages = async () => {
        try {
            const res = await axios.get(`/project-data/${projectId}/images`);
            setImages(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchImages(); }, [projectId]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload File
            const uploadRes = await axios.post('/project-data/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 2. Save Image Record
            await axios.post(`/project-data/${projectId}/images`, {
                url: uploadRes.data.url,
                caption: file.name
            });
            fetchImages();
        } catch (err) { alert('Upload Failed'); }
        finally { setUploading(false); }
    };

    const handleDelete = async (imgId) => {
        if (!confirm("Delete this image?")) return;
        try {
            await axios.delete(`/project-data/images/${imgId}`);
            fetchImages();
        } catch (err) { alert('Delete failed'); }
    };

    const [search, setSearch] = useState("");

    const filteredImages = images.filter(img =>
        (img.caption || "").toLowerCase().includes(search.toLowerCase())
    );

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-lg">Site Images</h3>

                <div className="flex gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search images..."
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-brand-100"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {user.role !== 'VIEW_ONLY_ADMIN' && (
                        <label className={`flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl cursor-pointer hover:bg-brand-600 ${uploading ? 'opacity-50' : ''}`}>
                            <Upload size={18} />
                            <span className="hidden sm:inline">{uploading ? 'Uploading...' : 'Upload'}</span>
                            <input type="file" accept="image/*" hidden onChange={handleUpload} disabled={uploading} />
                        </label>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredImages.map(img => (
                    <div key={img.id} className="group relative bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                        <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${img.url}`} alt="Project" className="w-full h-32 object-cover rounded-lg" />
                        {user.role !== 'VIEW_ONLY_ADMIN' && (
                            <button
                                onClick={() => handleDelete(img.id)}
                                className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                        <p className="mt-2 text-xs text-slate-500 truncate px-1">{img.caption}</p>
                    </div>
                ))}
                {filteredImages.length === 0 && <p className="text-slate-400 text-sm col-span-full text-center py-10">No images found.</p>}
            </div>
        </div>
    );
};

const DocumentManager = ({ projectId }) => {
    const [docs, setDocs] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fetchDocs = async () => {
        try {
            const res = await axios.get(`/project-data/${projectId}/documents`);
            setDocs(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchTasks = async () => {
        try {
            const res = await axios.get(`/tasks?projectId=${projectId}`);
            setTasks(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchDocs();
        fetchTasks();
    }, [projectId]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await axios.post('/project-data/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await axios.post(`/project-data/${projectId}/documents`, {
                url: uploadRes.data.url,
                name: file.name,
                taskId: selectedTaskId
            });
            fetchDocs();
        } catch (err) { alert('Upload Failed'); }
        finally { setUploading(false); }
    };

    const handleDelete = async (docId) => {
        if (!confirm("Delete this document?")) return;
        try {
            await axios.delete(`/project-data/documents/${docId}`);
            fetchDocs();
        } catch (err) { alert('Delete failed'); }
    };

    const [search, setSearch] = useState("");

    const filteredDocs = docs.filter(doc =>
        (doc.name || "").toLowerCase().includes(search.toLowerCase())
    );

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-lg">Project Documents</h3>

                <div className="flex gap-2 w-full sm:w-auto items-center">
                    {/* Task Selector Dropdown (Optional) */}
                    {user.role !== 'VIEW_ONLY_ADMIN' && (
                        <select
                            className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-100 max-w-[200px]"
                            value={selectedTaskId || ""}
                            onChange={(e) => setSelectedTaskId(e.target.value)}
                        >
                            <option value="">-- No Task Link --</option>
                            {tasks.map(t => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                        </select>
                    )}

                    <input
                        type="text"
                        placeholder="Search docs..."
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-brand-100"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {user.role !== 'VIEW_ONLY_ADMIN' && (
                        <label className={`flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl cursor-pointer hover:bg-brand-600 ${uploading ? 'opacity-50' : ''}`}>
                            <Upload size={18} />
                            <span className="hidden sm:inline">{uploading ? 'Uploading...' : 'Upload'}</span>
                            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" hidden onChange={handleUpload} disabled={uploading} />
                        </label>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                {filteredDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <FileText size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-slate-800">{doc.name}</p>
                                <p className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${doc.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-brand-600 hover:underline"
                            >
                                View
                            </a>
                            {user.role !== 'VIEW_ONLY_ADMIN' && (
                                <button onClick={() => handleDelete(doc.id)} className="text-red-400 hover:text-red-600">
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {filteredDocs.length === 0 && <p className="text-slate-400 text-sm text-center py-10">No documents found.</p>}
            </div>
        </div>
    );
};

const TimelineManager = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    const [loading, setLoading] = useState(true);
    const stages = ["Freezing Mail", "Approval of finalized designs", "Production", "Installation"];

    const fetchTasks = async () => {
        try {
            const res = await axios.get(`/tasks?projectId=${projectId}`);
            setTasks(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTasks(); }, [projectId]);

    const handleStageUpdate = async (taskId, newStage) => {
        try {
            await axios.put(`/tasks/${taskId}`, { stage: newStage });
            fetchTasks(); // refresh
        } catch (err) { alert('Update failed'); }
    };

    // Group tasks by stage for easier viewing
    const unassignedTasks = tasks.filter(t => !stages.includes(t.stage));

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="space-y-8">
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800 text-sm">
                <strong>How this works:</strong> Assign tasks to specific stages here. Updates will reflect on the Client's Timeline immediately.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stages.map((stage, idx) => (
                    <div key={stage} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                            <h4 className="font-bold text-slate-800">{stage}</h4>
                        </div>

                        <div className="space-y-2 flex-1">
                            {tasks.filter(t => t.stage === stage).map(t => (
                                <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <span className={t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-700'}>{t.title}</span>
                                        {/* Show Proof Eye Icon if evidence exists */}
                                        {t.evidence && t.evidence.length > 0 && (
                                            <button
                                                onClick={() => setSelectedEvidence(t)}
                                                className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded-full transition"
                                                title="View Task Proof"
                                            >
                                                <Eye size={14} />
                                            </button>
                                        )}
                                    </div>
                                    {user.role !== 'VIEW_ONLY_ADMIN' && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleStageUpdate(t.id, null)}
                                                className="text-[10px] text-red-500 hover:underline"
                                            >
                                                Unassign
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {tasks.filter(t => t.stage === stage).length === 0 && <p className="text-xs text-slate-400 italic">No tasks in this stage</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Proof Modal */}
            {selectedEvidence && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedEvidence(null)}>
                    <div className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Proof: {selectedEvidence.title}</h3>
                            <button onClick={() => setSelectedEvidence(null)} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedEvidence.evidence.map(ev => (
                                <div key={ev.id} className="group relative">
                                    <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                        <img src={`${apiUrl}${ev.url}`} alt="Proof" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                                    </div>
                                    <div className="mt-2 text-[10px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <p>📅 {new Date(ev.capturedAt).toLocaleString()}</p>
                                        {ev.latitude && <p>📍 {ev.latitude}, {ev.longitude}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Unassigned Tasks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {unassignedTasks.map(t => (
                        <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                            <div>
                                <p className="font-semibold text-sm text-slate-800 line-clamp-2">{t.title}</p>
                                <p className="text-xs text-slate-400 mt-1">{t.status}</p>
                            </div>

                            {user.role !== 'VIEW_ONLY_ADMIN' ? (
                                <select
                                    className="w-full text-xs border border-slate-200 rounded-lg p-1.5 mt-2 bg-white"
                                    value={t.stage || ""}
                                    onChange={(e) => handleStageUpdate(t.id, e.target.value)}
                                >
                                    <option value="">Select Stage to Assign...</option>
                                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            ) : (
                                <p className="text-xs text-slate-400 italic mt-2">View Only</p>
                            )}
                        </div>
                    ))}
                    {unassignedTasks.length === 0 && <p className="text-sm text-slate-400">All tasks are assigned!</p>}
                </div>
            </div>
        </div>
    );
};



const SettingsManager = ({ projectId }) => {
    const [percentage, setPercentage] = useState(0);
    const [form, setForm] = useState({
        percentage: 0,
        amount: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        mode: 'UPI',
        verifiedBy: ''
    });
    const [loading, setLoading] = useState(false);

    // Fetch latest project specific data
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await axios.get(`/projects/${projectId}`);
                setPercentage(res.data.paymentPercentage || 0);
                setForm(prev => ({ ...prev, percentage: res.data.paymentPercentage || 0 }));
            } catch (err) { console.error(err); }
        };
        fetchProject();
    }, [projectId]);

    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`/projects/${projectId}/payment`, {
                percentage: form.percentage,
                amount: form.amount,
                date: form.date,
                time: form.time,
                mode: form.mode,
                verifiedBy: form.verifiedBy
            });
            alert("Payment Recorded & Phase Unlocked Successfully!");
            setPercentage(form.percentage); // Update local display
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update payment");
        } finally {
            setLoading(false);
        }
    };

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="text-indigo-600" />
                Phase Control (Secure)
            </h3>

            {/* Current Status Banner */}
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8 flex justify-between items-center">
                <div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Current Unlocked Level</p>
                    <p className="text-4xl font-black text-indigo-900">{percentage}%</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase">Next Phase</p>
                    <p className="font-bold text-slate-700">
                        {percentage < 15 ? 'Design' : percentage < 50 ? 'Finalization' : percentage < 90 ? 'Production' : percentage < 100 ? 'Installation' : 'All Done'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleUpdatePayment} className="space-y-6">

                {/* 1. Select Phase Level */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Unlock Phase Level <span className="text-red-500">*</span></label>
                    <select
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold text-indigo-900 bg-white focus:ring-2 focus:ring-indigo-500"
                        value={form.percentage}
                        onChange={(e) => setForm({ ...form, percentage: parseInt(e.target.value) })}
                        disabled={user.role === 'VIEW_ONLY_ADMIN'}
                    >
                        <option value={0}>Locked (0%)</option>
                        <option value={15}>Unlock Design (15%)</option>
                        <option value={50}>Unlock Finalization (50%)</option>
                        <option value={90}>Unlock Production (90%)</option>
                        <option value={100}>Unlock Installation (100%)</option>
                    </select>
                </div>

                {/* 2. Transaction Details */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Payment Date <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            required
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Time <span className="text-red-500">*</span></label>
                        <input
                            type="time"
                            required
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                            value={form.time}
                            onChange={(e) => setForm({ ...form, time: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Payment Mode <span className="text-red-500">*</span></label>
                        <select
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                            value={form.mode}
                            onChange={(e) => setForm({ ...form, mode: e.target.value })}
                        >
                            <option value="UPI">UPI</option>
                            <option value="CASH">Cash</option>
                            <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Amount (Optional)</label>
                        <input
                            type="number"
                            placeholder="₹"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        />
                    </div>
                </div>

                {/* 3. Verification */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Verified By (Admin Name) <span className="text-red-500">*</span></label>
                    <input
                        required
                        placeholder="Enter your name to sign off"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                        value={form.verifiedBy}
                        onChange={(e) => setForm({ ...form, verifiedBy: e.target.value })}
                    />
                    <p className="text-xs text-slate-400 mt-2">This action will be permanently logged in the Payment Transaction history.</p>
                </div>

                {user.role !== 'VIEW_ONLY_ADMIN' && (
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing Transaction...' : 'Record Payment & Update Phase'}
                    </button>
                )}
            </form>

            <div className="mt-12 pt-8 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Transaction History (Admin Proof)</h4>
                <PaymentHistoryTable projectId={projectId} reloadTrigger={percentage} />
            </div>
        </div>
    );
};

const PaymentHistoryTable = ({ projectId, reloadTrigger }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`/projects/${projectId}/payments`);
                setHistory(res.data);
            } catch (err) { console.error(err); }
        };
        fetchHistory();
    }, [projectId, reloadTrigger]);

    if (history.length === 0) return <p className="text-xs text-slate-400 italic">No payments recorded yet.</p>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
                <thead className="text-slate-500 border-b border-slate-200">
                    <tr>
                        <th className="py-2 pl-2">Level</th>
                        <th className="py-2">Date</th>
                        <th className="py-2">Mode</th>
                        <th className="py-2">Verified By</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {history.map(tx => (
                        <tr key={tx.id}>
                            <td className="py-2 pl-2 font-bold text-indigo-600">{tx.percentage}%</td>
                            <td className="py-2 text-slate-600">
                                {new Date(tx.date).toLocaleDateString()}
                                <span className="block text-[10px] text-slate-400">{tx.time}</span>
                            </td>
                            <td className="py-2 text-slate-600">
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">{tx.mode}</span>
                                {tx.amount && <span className="block mt-0.5 font-mono">₹{tx.amount}</span>}
                            </td>
                            <td className="py-2 text-slate-600 font-medium">{tx.verifiedBy}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProjectManager;
