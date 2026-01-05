import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 z-[100] overflow-hidden"
                >
                    <div className="p-6 sm:p-8">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                    <Smartphone size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Install Orbix Projects</h3>
                                    <p className="text-sm font-medium text-slate-500">Get the best experience on your home screen.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleInstallClick}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-200"
                            >
                                <Download className="inline-block mr-2" size={18} />
                                Install Now
                            </button>
                            <button
                                onClick={handleClose}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InstallPrompt;
