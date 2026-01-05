import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Shield,
    User,
    FolderKey,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    ChevronRight,
    Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../shared/utils/axios";

// NOTE: We assume the mock axios instances are available and work for their respective endpoints.
// For the unified login, we'll try to use the admin axios as a base if it points to the same API.

const UnifiedLogin = () => {
    const navigate = useNavigate();
    const [activePortal, setActivePortal] = useState("admin"); // 'admin', 'employee', 'client'
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form states
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        projectId: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (activePortal === "admin" || activePortal === "employee") {
                const res = await axios.post("/auth/login", {
                    email: formData.email,
                    password: formData.password
                });

                const userRole = res.data.user.role;

                // Strict Role Validation based on selected tab
                if (activePortal === 'admin' && !['SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
                    setError("Access denied. You are not an authorized administrator.");
                    setLoading(false);
                    return;
                }

                if (activePortal === 'employee' && !['EMPLOYEE', 'SITE_SUPERVISOR'].includes(userRole)) {
                    setError("Access denied. Please use the Admin portal.");
                    setLoading(false);
                    return;
                }

                // Store Auth Data
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));

                // Routing
                if (userRole === 'SUPER_ADMIN' || userRole === 'MANAGER') {
                    navigate("/admin/dashboard");
                } else if (userRole === 'EMPLOYEE') {
                    navigate("/employee");
                } else if (userRole === 'SITE_SUPERVISOR') {
                    navigate("/supervisor");
                } else {
                    setError("Unknown role.");
                }

            }
            else if (activePortal === "client") {
                // Client login pending backend implementation
                // For now, keeping original logic if needed or placeholder
                const res = await axios.post("/client/login", {
                    projectId: formData.projectId,
                    password: formData.password
                });
                localStorage.setItem("clientToken", res.data.token);
                localStorage.setItem("clientProject", JSON.stringify(res.data.project));
                navigate("/client");
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const portals = [
        { id: "admin", label: "Admin", icon: Shield, color: "blue" },
        { id: "employee", label: "Employee", icon: User, color: "green" },
        { id: "client", label: "Client", icon: FolderKey, color: "orange" },
    ];

    // Auto-Login for Clients via Link
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (token) {
            try {
                const decoded = JSON.parse(atob(token));
                if (decoded.projectId) {
                    setActivePortal("client");
                    setFormData(prev => ({ ...prev, projectId: decoded.projectId }));
                    // Optional: You could auto-submit here if you trust the token strictly
                    // But for security, usually you want them to input password OR the token implies a temporary authed session.
                    // The 'ClientAccess.jsx' prompt implies "one-click login", so let's try to auto-authenticate if the token IS the auth.
                    // However, ClientAccess.jsx generates a simple base64 of ID+Email. That is NOT a secure auth token.
                    // It's just a pre-fill mechanism unless we change the backend to accept this specific token type.
                    // Given the current backend 'clientController.login' requires 'password', this token IS NOT enough for full login.
                    // It only pre-fills the Project ID.

                    // User Request: "Generate secure, one-click login links".
                    // To support TRUE one-click, we need a backend change to accept a 'magic link' token or similar.
                    // OR we change the frontend to just pre-fill.
                    // Looking at ClientAccess.jsx: "This encrypted URL bypasses standard login... instant access".
                    // PROPOSAL: We should implement a real 'magic-login' endpoint or update client login to accept this token if signed.
                    // BUT for now, strict adherence to current backend:
                    // I will purely Pre-fill the Project ID.
                }
            } catch (e) {
                console.error("Invalid token");
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="/FINAL_LOGO.png"
                        alt="Orbix Projects"
                        className="h-16 mb-4 object-contain"
                    />
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Orbix Projects Unified</h1>
                    <p className="text-slate-500 text-sm mt-1">Select your portal to continue</p>
                </div>

                {/* Portal Selector */}
                <div className="flex bg-slate-200/50 p-1 rounded-2xl mb-8 backdrop-blur-sm">
                    {portals.map(p => {
                        const Icon = p.icon;
                        const isActive = activePortal === p.id;
                        return (
                            <button
                                key={p.id}
                                onClick={() => { setActivePortal(p.id); setError(""); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Icon size={16} className={isActive ? `text-${p.color}-500` : ''} />
                                {p.label}
                            </button>
                        )
                    })}
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8">
                    <AnimatePresence mode="wait">
                        <motion.form
                            key={activePortal}
                            initial={{ opacity: 0, x: activePortal === "admin" ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: activePortal === "admin" ? 20 : -20 }}
                            onSubmit={handleLogin}
                            className="space-y-5"
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900 capitalize">{activePortal} Login</h2>
                                {activePortal === "client" && (
                                    <p className="text-xs text-slate-500 mt-1">Track your project progress in real-time</p>
                                )}
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2"
                                >
                                    <AlertTriangle size={14} />
                                    {error}
                                </motion.div>
                            )}

                            {/* Dynamic Inputs */}
                            {activePortal === "client" ? (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Project ID</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                            <Hash size={18} />
                                        </span>
                                        <input
                                            type="text"
                                            name="projectId"
                                            value={formData.projectId}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm outline-none placeholder:text-slate-400"
                                            placeholder="e.g. PRJ-001"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Email Address</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                            <Mail size={18} />
                                        </span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm outline-none placeholder:text-slate-400"
                                            placeholder={activePortal === "admin" ? "admin@orbix.com" : "employee@orbix.com"}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Password</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                        <Lock size={18} />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm outline-none placeholder:text-slate-400"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group ${activePortal === "admin" ? "bg-blue-600 shadow-blue-200 hover:bg-blue-700" :
                                    activePortal === "employee" ? "bg-green-600 shadow-green-200 hover:bg-green-700" :
                                        "bg-orange-600 shadow-orange-200 hover:bg-orange-700"
                                    } disabled:opacity-70 disabled:shadow-none`}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Sign In to {activePortal.charAt(0).toUpperCase() + activePortal.slice(1)}
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </motion.form>
                    </AnimatePresence>

                    {/* Quick Hints */}
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Demo Credentials</p>
                        <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 font-medium">
                            {activePortal === "admin" && "admin@orbix.com | admin123"}
                            {activePortal === "employee" && "Any credentials will work (Mock mode)"}
                            {activePortal === "client" && "PRJ001 | password123 (Try PRJ001 / password123)"}
                        </div>
                    </div>
                </div>

                {/* Global Footer */}
                <p className="text-center text-slate-400 text-xs mt-8">
                    &copy; 2026 Orbix Projects. All rights reserved.
                </p>
            </motion.div>

            {/* In-page Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}} />
        </div>
    );
};

export default UnifiedLogin;
