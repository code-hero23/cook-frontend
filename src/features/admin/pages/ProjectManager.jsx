import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from "../../../shared/utils/axios";
import { ArrowLeft, Upload, Trash2, FileText, Image as ImageIcon, Calendar, Eye, X, CheckCircle, MapPin, Clock, Folder, Download } from 'lucide-react';
import RefreshButton from "../../../shared/components/RefreshButton.jsx";

const ProjectManager = () => {
    const { id } = useParams();
    const { projects, refreshData, loading } = useApp();
    const project = projects.find(p => p.id === id);
    const [activeTab, setActiveTab] = useState('details');

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
                <div className="ml-auto">
                    <RefreshButton
                        onRefresh={refreshData}
                        isLoading={loading}
                        label="Sync App"
                        className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                {['details', 'gallery', 'documents', 'timeline', 'settings'].map(tab => (
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
                {activeTab === 'details' && <ProjectDetails project={project} />}
                {activeTab === 'gallery' && <GalleryManager projectId={id} />}
                {activeTab === 'documents' && <DocumentManager projectId={id} />}
                {activeTab === 'timeline' && <TimelineManager projectId={id} />}
                {activeTab === 'settings' && <SettingsManager projectId={id} onUpdate={refreshData} />}
            </div>
        </div>
    );
};

// --- SUB COMPONENTS ---

const DetailCard = ({ title, children }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            {children}
        </div>
    </div>
);

const DetailField = ({ label, value }) => (
    <div>
        <dt className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</dt>
        <dd className="text-sm font-medium text-slate-800 break-words">{value || <span className="text-slate-300 italic">Not provided</span>}</dd>
    </div>
);

const ProjectDetails = ({ project }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Core Info & Tracking */}
                <div className="space-y-6">
                    <DetailCard title="Core Information">
                        <DetailField label="Project Code" value={project.projectCode} />
                        <DetailField label="Project Name" value={project.name} />
                        <DetailField label="CP/Contract No" value={project.cpNumber} />
                        <DetailField label="Location" value={project.location} />
                        {project.latitude && project.longitude && (
                            <DetailField label="GPS Coordinates" value={`${project.latitude}, ${project.longitude}`} />
                        )}
                        <DetailField label="Status" value={project.status} />
                    </DetailCard>

                    <DetailCard title="Project Tracking & Team">
                        <DetailField label="Property Type" value={project.propertyType} />
                        <DetailField label="Scope of Work" value={project.scopeOfWork} />
                        <DetailField label="Lead Source" value={project.leadSource} />
                        <DetailField label="Client Relationship Executive (CRE)" value={project.salesRep} />
                        <DetailField label="Business Head" value={project.businessHead?.name || project.businessHeadId} />
                        <DetailField label="Feasibility Architect (FA)" value={project.fa?.name || project.faId} />
                        <DetailField label="Loading Architect (LA)" value={project.la?.name || project.laId} />
                    </DetailCard>

                    <DetailCard title="Timeline & Financials">
                        <DetailField label="Start Date" value={project.startDate ? new Date(project.startDate).toLocaleDateString() : null} />
                        <DetailField label="Deadline" value={project.deadline ? new Date(project.deadline).toLocaleDateString() : null} />
                        <DetailField label="Timeline Duration" value={`${project.timelineDuration} Days`} />
                        <DetailField label="Budget" value={project.budget ? `₹${project.budget.toLocaleString()}` : null} />
                        <DetailField label="Payment Earned" value={`${project.paymentPercentage || 0}%`} />
                    </DetailCard>
                </div>

                {/* People Info */}
                <div className="space-y-6">
                    <DetailCard title="Client Details">
                        <DetailField label="Full Name" value={`${project.clientFirstName} ${project.clientLastName}`} />
                        <DetailField label="Email Address" value={project.clientEmail} />
                        <DetailField label="Phone Number" value={project.clientPhone} />
                    </DetailCard>

                    <DetailCard title="Spouse Details">
                        <DetailField label="Spouse Name" value={project.spouseName} />
                        <DetailField label="Spouse Phone" value={project.spousePhone} />
                    </DetailCard>

                    <DetailCard title="Billing Details">
                        <DetailField label="Billing Name" value={project.billingName} />
                        <DetailField label="GSTIN" value={project.gstin} />
                        <DetailField label="Billing Phone" value={project.billingPhone} />
                        <DetailField label="Billing Address" value={project.billingAddress} />
                    </DetailCard>
                </div>

            </div>
        </div>
    );
};

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
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">Site Images</h3>
                    <RefreshButton
                        onRefresh={fetchImages}
                        isLoading={uploading}
                        className="p-1.5 border-none shadow-none bg-transparent hover:bg-slate-100"
                    />
                </div>

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
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">Project Documents</h3>
                    <RefreshButton
                        onRefresh={() => { fetchDocs(); fetchTasks(); }}
                        isLoading={uploading}
                        className="p-1.5 border-none shadow-none bg-transparent hover:bg-slate-100"
                    />
                </div>

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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800 text-sm flex-1">
                    <strong>How this works:</strong> Assign tasks to specific stages here. Updates will reflect on the Client's Timeline immediately.
                </div>
                <RefreshButton
                    onRefresh={fetchTasks}
                    isLoading={loading}
                    className="bg-white border-slate-200 shadow-sm"
                />
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

            {/* Verified Proof Modal - Polished UI */}
            {selectedEvidence && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedEvidence(null)}>
                    <div className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{selectedEvidence.title}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    <Folder size={12} />
                                    <span>{project.name} • WEB PROOF v2.0</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEvidence(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="overflow-y-auto">
                            {/* Main Banner Image (First Evidence) */}
                            {selectedEvidence.evidence.length > 0 && (
                                <div className="bg-slate-900 border-b border-slate-100">
                                    <img
                                        src={`${apiUrl}${selectedEvidence.evidence[0].url}`}
                                        alt="Proof Evidence"
                                        className="w-full h-80 object-contain mx-auto"
                                    />
                                    {selectedEvidence.evidence.length > 1 && (
                                        <div className="p-2 bg-slate-900 text-center text-xs text-slate-400 border-t border-slate-800">
                                            + {selectedEvidence.evidence.length - 1} more photo(s) available in gallery
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
                                {/* Status Card */}
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                                        <p className="font-bold text-slate-800">Completed</p>
                                    </div>
                                </div>

                                {/* Time Card */}
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</p>
                                        <p className="font-bold text-slate-800">
                                            {selectedEvidence.evidence[0]
                                                ? new Date(selectedEvidence.evidence[0].capturedAt).toLocaleDateString()
                                                : new Date().toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* GPS Card */}
                                <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center text-center">
                                    {selectedEvidence.evidence[0]?.latitude ? (
                                        <div className="w-full">
                                            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2">
                                                <MapPin size={24} />
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GPS Location</p>
                                            <p className="font-mono text-sm font-bold text-slate-700 mt-1">
                                                {selectedEvidence.evidence[0].latitude}, {selectedEvidence.evidence[0].longitude}
                                            </p>
                                            <a
                                                href={`https://maps.google.com/?q=${selectedEvidence.evidence[0].latitude},${selectedEvidence.evidence[0].longitude}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-indigo-600 hover:underline mt-2 inline-block"
                                            >
                                                View on Maps
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="opacity-50">
                                            <MapPin size={32} className="mx-auto text-slate-400 mb-2" />
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No GPS Data Captured</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white border-t border-slate-100 flex gap-4">
                            <button
                                onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = `${apiUrl}${selectedEvidence.evidence[0].url}`;
                                    link.download = `Proof-${selectedEvidence.title}-${Date.now()}`;
                                    link.target = "_blank";
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                                className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={20} />
                                Download Original Image
                            </button>
                            <button
                                onClick={() => setSelectedEvidence(null)}
                                className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-[0.99]"
                            >
                                Close Verification
                            </button>
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



const SettingsManager = ({ projectId, onUpdate }) => {
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
            if (onUpdate) await onUpdate(); // Sync with global AppContext so 'Details' tab updates instantly
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
