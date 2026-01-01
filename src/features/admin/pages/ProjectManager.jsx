import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from "../../../shared/utils/axios";
import { ArrowLeft, Upload, Trash2, FileText, Image as ImageIcon, Calendar } from 'lucide-react';

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Site Images</h3>
                <label className={`flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl cursor-pointer hover:bg-brand-600 ${uploading ? 'opacity-50' : ''}`}>
                    <Upload size={18} />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" accept="image/*" hidden onChange={handleUpload} disabled={uploading} />
                </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map(img => (
                    <div key={img.id} className="group relative bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                        <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${img.url}`} alt="Project" className="w-full h-32 object-cover rounded-lg" />
                        <button
                            onClick={() => handleDelete(img.id)}
                            className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={16} />
                        </button>
                        <p className="mt-2 text-xs text-slate-500 truncate px-1">{img.caption}</p>
                    </div>
                ))}
                {images.length === 0 && <p className="text-slate-400 text-sm col-span-full text-center py-10">No images uploaded yet.</p>}
            </div>
        </div>
    );
};

const DocumentManager = ({ projectId }) => {
    const [docs, setDocs] = useState([]);
    const [uploading, setUploading] = useState(false);

    const fetchDocs = async () => {
        try {
            const res = await axios.get(`/project-data/${projectId}/documents`);
            setDocs(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchDocs(); }, [projectId]);

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
                name: file.name
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Project Documents</h3>
                <label className={`flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl cursor-pointer hover:bg-brand-600 ${uploading ? 'opacity-50' : ''}`}>
                    <Upload size={18} />
                    {uploading ? 'Uploading...' : 'Upload Doc'}
                    <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" hidden onChange={handleUpload} disabled={uploading} />
                </label>
            </div>

            <div className="space-y-2">
                {docs.map(doc => (
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
                            <button onClick={() => handleDelete(doc.id)} className="text-red-400 hover:text-red-600">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {docs.length === 0 && <p className="text-slate-400 text-sm text-center py-10">No documents uploaded yet.</p>}
            </div>
        </div>
    );
};

const TimelineManager = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
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
                                    <span className={t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-700'}>{t.title}</span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleStageUpdate(t.id, null)}
                                            className="text-[10px] text-red-500 hover:underline"
                                        >
                                            Unassign
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {tasks.filter(t => t.stage === stage).length === 0 && <p className="text-xs text-slate-400 italic">No tasks in this stage</p>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Unassigned Tasks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {unassignedTasks.map(t => (
                        <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                            <div>
                                <p className="font-semibold text-sm text-slate-800 line-clamp-2">{t.title}</p>
                                <p className="text-xs text-slate-400 mt-1">{t.status}</p>
                            </div>

                            <select
                                className="w-full text-xs border border-slate-200 rounded-lg p-1.5 mt-2 bg-white"
                                value={t.stage || ""}
                                onChange={(e) => handleStageUpdate(t.id, e.target.value)}
                            >
                                <option value="">Select Stage to Assign...</option>
                                {stages.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
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
    const [loading, setLoading] = useState(false);

    // Fetch latest project specific data
    useEffect(() => {
        const fetchProject = async () => {
            try {
                // Admin can use the generic getProjectById endpoint
                const res = await axios.get(`/projects/${projectId}`);
                setPercentage(res.data.paymentPercentage || 0);
            } catch (err) { console.error(err); }
        };
        fetchProject();
    }, [projectId]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.put(`/projects/${projectId}`, { paymentPercentage: parseInt(percentage) });
            alert("Project Phase Updated!");
        } catch (err) {
            alert("Failed to update");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="text-indigo-600" />
                Phase Control
            </h3>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 mb-8">
                <div className="flex justify-between items-end mb-4">
                    <label className="text-sm font-bold text-indigo-900 uppercase tracking-widest">
                        Phase Unlocking Progress
                    </label>
                    <span className="text-4xl font-black text-indigo-600 tabular-nums">
                        {percentage}%
                    </span>
                </div>

                <input
                    type="range"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    className="w-full h-4 bg-indigo-200 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
                />

                <div className="flex justify-between text-[10px] font-bold text-indigo-400 mt-2 uppercase tracking-widest">
                    <span>Locked (0%)</span>
                    <div className="flex gap-8">
                        <span>Phase 1 (15%)</span>
                        <span>Phase 2 (50%)</span>
                        <span>Phase 3 (90%)</span>
                    </div>
                    <span>Done (100%)</span>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Saving...' : 'Update Phase Status'}
                </button>
            </div>

            <p className="mt-4 text-xs text-slate-400 text-center">
                Moving this slider updates the "Physical Completion" and unlocks phases on the Client Dashboard.
            </p>
        </div>
    );
};

export default ProjectManager;
