import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    MapPin,
    LogOut,
    Settings,
    UserCircle,
    ChevronLeft,
    Shield,
    MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const links = [
        { label: 'Dashboard', path: '/supervisor/dashboard', icon: LayoutDashboard },
        { label: 'My Tasks', path: '/supervisor/tasks', icon: ClipboardList },
        { label: 'Team Chat', path: '/supervisor/chat', icon: MessageSquare },
        { label: 'Map View', path: '/supervisor/map', icon: MapPin }, // Placeholder for future
        { label: 'Profile', path: '/supervisor/profile', icon: UserCircle },
    ];

    const sidebarVariants = {
        open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
        closed: { x: "-100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    };

    return (
        <>
            {/* Backdrop for mobile */}
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black z-40 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={isMobile ? "closed" : "open"}
                animate={isOpen || !isMobile ? "open" : "closed"}
                variants={sidebarVariants}
                className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white z-50 shadow-2xl flex flex-col border-r border-slate-800`}
            >
                {/* Header */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">Cookscape</h1>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Site Operations</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Menu</div>
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={() => isMobile && setIsOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
                                ${isActive
                                    ? 'bg-indigo-600/10 text-indigo-400 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full"
                                        />
                                    )}
                                    <link.icon className={`w-5 h-5 ${isActive ? 'text-indigo-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                    <span className="font-medium text-sm">{link.label}</span>
                                    {isActive && <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all duration-300"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>

                    <p className="text-center text-[10px] text-slate-600 mt-4">v1.2.0 Enterprise Build</p>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
