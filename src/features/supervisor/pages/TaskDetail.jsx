import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../shared/utils/axios';
import { ArrowLeft, MapPin, Calendar, CheckCircle2, AlertTriangle, Clock, Shield } from 'lucide-react';
import LiveCameraCapture from '../components/LiveCameraCapture';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const TaskDetail = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCamera, setShowCamera] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTaskDetails();
    }, [taskId]);

    const fetchTaskDetails = async () => {
        try {
            const response = await axios.get('/tasks');
            const foundTask = response.data.find(t => t.id === taskId);
            setTask(foundTask);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load task details");
        } finally {
            setLoading(false);
        }
    };

    const handleEvidenceCapture = async (file, location, timestamp) => {
        setSubmitting(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('taskId', taskId);
        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);
        formData.append('capturedAt', timestamp.toISOString());

        try {
            await axios.post(`/tasks/${taskId}/evidence`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Task completed successfully!", {
                icon: '🎉',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
            setShowCamera(false);
            navigate('../dashboard');
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Failed to submit evidence. Please try again.");
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
    );

    if (!task) return (
        <div className="text-center py-20">
            <h2 className="text-xl font-bold text-slate-800">Task not found</h2>
            <button onClick={() => navigate('../dashboard')} className="mt-4 text-indigo-600 font-bold hover:underline">Return to Dashboard</button>
        </div>
    );

    return (
        <div className="pb-20 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all hover:-translate-x-1"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Task Details</h1>
                    <p className="text-slate-500 text-sm font-medium">View and update work status</p>
                </div>
            </div>

            {/* Task Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-slate-100 relative overflow-hidden"
            >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-bl-[100%] -mr-10 -mt-10 opacity-50 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <span className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-wider border border-indigo-100">
                            {task.stage || 'General'}
                        </span>
                        {task.priority === 'HIGH' && (
                            <span className="flex items-center gap-1.5 text-rose-600 text-xs font-bold uppercase tracking-wider bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                                <AlertTriangle className="w-3.5 h-3.5" /> High Urgent
                            </span>
                        )}
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mb-4 leading-tight">{task.title}</h2>

                    {task.description && (
                        <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                            <p className="text-slate-600 text-sm leading-relaxed font-medium">{task.description}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                                <p className="text-sm font-bold text-slate-700">{task.project?.location || 'Site Location'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</p>
                                <p className="text-sm font-bold text-slate-700">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'ASAP'}</p>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!showCamera ? (
                            <motion.button
                                key="start-btn"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowCamera(true)}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-3 group"
                            >
                                <div className="p-1 bg-white/20 rounded-full">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                Update Task Status
                            </motion.button>
                        ) : (
                            <motion.div
                                key="camera-ui"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-slate-100 pt-8"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">Live Verification</h3>
                                            <p className="text-xs text-slate-400 font-medium">Geo-tagged evidence required</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowCamera(false)}
                                        className="px-3 py-1.5 text-xs text-rose-500 font-bold bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                                    >
                                        Cancel Update
                                    </button>
                                </div>

                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-xs text-amber-800 mb-6 font-medium">
                                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                                    <p>Strict Compliance: You must capture a real-time photo at the designated site location. Gallery uploads are disabled for security.</p>
                                </div>

                                {submitting ? (
                                    <div className="h-80 flex flex-col items-center justify-center space-y-4 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                                        <div className="relative">
                                            <div className="w-12 h-12 border-4 border-indigo-200 rounded-full"></div>
                                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-slate-800">Verifying Evidence...</p>
                                            <p className="text-xs text-slate-400 mt-1">Stamping Location & Time</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-3xl overflow-hidden shadow-2xl shadow-indigo-100 ring-4 ring-slate-50">
                                        <LiveCameraCapture onCapture={handleEvidenceCapture} />
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default TaskDetail;
