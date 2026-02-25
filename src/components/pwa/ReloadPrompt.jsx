import React, { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

function ReloadPrompt() {
    const sw = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.error('SW registration error', error)
        },
    })

    // Safety fallback for destructuring
    const {
        offlineReady: [offlineReady, setOfflineReady] = [false, () => { }],
        needUpdate: [needUpdate, setNeedUpdate] = [false, () => { }],
        updateServiceWorker,
    } = sw || {
        offlineReady: [false, () => { }],
        needUpdate: [false, () => { }],
        updateServiceWorker: () => { }
    };

    // Auto-reload instantly when an update is detected
    useEffect(() => {
        if (needUpdate) {
            updateServiceWorker(true);
        }
    }, [needUpdate, updateServiceWorker]);

    const close = () => {
        setOfflineReady(false)
        setNeedUpdate(false)
    }

    // Use react-hot-toast for a cleaner look if desired, but a custom floating UI is nice too.
    // We'll stick with a custom premium UI to match the dashboard.

    return (
        <AnimatePresence>
            {(offlineReady || needUpdate) && (
                <motion.div
                    initial={{ opacity: 0, y: 100, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: 100, x: "-50%" }}
                    className="fixed bottom-6 left-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm"
                >
                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-6 shadow-2xl shadow-indigo-100 flex items-start gap-4">
                        <div className={`p-3 rounded-2xl ${needUpdate ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
                            {needUpdate ? <RefreshCw size={24} className="animate-spin-slow" /> : <Info size={24} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">
                                {needUpdate ? 'Update Available' : 'Ready to use offline'}
                            </h4>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                {needUpdate
                                    ? 'New content available, click on reload button to update.'
                                    : 'App is ready to work offline for consistent performance.'}
                            </p>

                            <div className="flex items-center gap-3 mt-4">
                                {needUpdate && (
                                    <button
                                        onClick={() => updateServiceWorker(true)}
                                        className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                                    >
                                        Reload & Update
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
