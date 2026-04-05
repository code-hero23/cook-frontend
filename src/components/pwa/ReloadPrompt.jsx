import React, { useEffect, useState } from 'react'
import { RefreshCw, X, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function ReloadPrompt() {
    const [needRefresh, setNeedRefresh] = useState(false)
    const [registration, setRegistration] = useState(null)

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then((reg) => {
                    setRegistration(reg)

                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    setNeedRefresh(true);
                                }
                            });
                        }
                    });
                })
                .catch((err) => {
                    console.error('SW Registration Failed:', err)
                });

            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                }
            });
        }
    }, [])

    const updateServiceWorker = () => {
        if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        setNeedRefresh(false);
    }

    const close = () => {
        setNeedRefresh(false)
    }

    return (
        <AnimatePresence>
            {needRefresh && (
                <motion.div
                    initial={{ opacity: 0, y: 100, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: 100, x: "-50%" }}
                    className="fixed bottom-6 left-1/2 z-[200] w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-sm"
                >
                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-6 shadow-2xl shadow-indigo-100 flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                            <RefreshCw size={24} className="animate-spin-slow" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">
                                {needRefresh ? 'Update Available' : 'Ready to use offline'}
                            </h4>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                {needRefresh
                                    ? 'New content available, click on reload button to update.'
                                    : 'App is ready to work offline for consistent performance.'}
                            </p>

                            <div className="flex items-center gap-3 mt-4">
                                {needRefresh && (
                                    <button
                                        onClick={() => updateServiceWorker(true)}
                                        className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                                    >
                                        Reload Now
                                    </button>
                                )}
                                <button
                                    onClick={close}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>

                        <button onClick={close} className="text-slate-400 hover:text-slate-600">
                            <X size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ReloadPrompt
