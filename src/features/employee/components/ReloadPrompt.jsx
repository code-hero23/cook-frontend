import React, { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    useEffect(() => {
        const interval = setInterval(() => {
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                const sw = navigator.serviceWorker.controller;
                if (sw) {
                    // This triggers a check for updates
                    navigator.serviceWorker.getRegistration().then(reg => {
                        if (reg) reg.update();
                    });
                }
            }
        }, 60 * 1000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    // Auto-update is handled by the plugin's registerType: 'autoUpdate' in vite.config.js
    // Manual reload is triggered by the "Reload Now" button in the UI.

    console.log('ReloadPrompt state:', { offlineReady, needRefresh })

    const close = () => {
        setOfflineReady(false)
        setNeedRefresh(false)
    }

    if (!needRefresh) return null

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] px-4 w-full max-w-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-indigo-100 dark:border-indigo-900/30 p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                            <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {needRefresh ? 'Update Available' : 'Ready for Offline'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {needRefresh
                                    ? 'A new version is available. Click reload to see the latest changes.'
                                    : 'App is ready to work offline.'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={close}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {needRefresh && (
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={() => updateServiceWorker(true)}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            Reload Now
                        </button>
                        <button
                            onClick={close}
                            className="flex-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold py-2 px-4 rounded-lg transition-all"
                        >
                            Later
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReloadPrompt
