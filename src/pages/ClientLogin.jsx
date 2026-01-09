import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Hash, ArrowRight, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../shared/utils/axios";

const ClientLogin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        projectId: "",
        password: ""
    });

    useEffect(() => {
        // Auto-fill from URL token if present
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (token) {
            try {
                const decoded = JSON.parse(atob(token));
                if (decoded.projectId) {
                    setFormData(prev => ({ ...prev, projectId: decoded.projectId }));
                }
            } catch (e) {
                console.error("Invalid token");
            }
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await axios.post("/client/login", {
                projectId: formData.projectId,
                password: formData.password
            });
            localStorage.setItem("clientToken", res.data.token);
            localStorage.setItem("clientProject", JSON.stringify(res.data.project));
            navigate("/client");
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center p-4">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="flex justify-center mb-8">
                    <img src="/FINAL_LOGO.png" alt="Cookscape" className="h-16 object-contain" />
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-orange-100 border border-orange-100 p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 to-orange-600" />

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Client Portal</h2>
                        <p className="text-gray-500 text-sm mt-2">Track your project progress in real-time</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                            >
                                <AlertTriangle size={16} />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">Project ID</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                    <Hash size={18} />
                                </span>
                                <input
                                    type="text"
                                    name="projectId"
                                    value={formData.projectId}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm outline-none placeholder:text-gray-400 font-medium"
                                    placeholder="e.g. PRJ-001"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm outline-none placeholder:text-gray-400 font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-orange-200 bg-gradient-to-r from-orange-500 to-orange-600 hover:to-orange-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:shadow-none mt-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Access Project
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <a href="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-orange-600 transition-colors">
                            <ArrowLeft size={12} />
                            Staff Login
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ClientLogin;
