import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import AdminApp from '@admin/App';
import EmployeeApp from '@employee/App';
import SupervisorApp from '@supervisor/App';
import ClientApp from '@client/App';
import Login from './pages/Login';
import ClientLogin from './pages/ClientLogin';
import ReloadPrompt from './components/pwa/ReloadPrompt';
import InstallPrompt from './components/pwa/InstallPrompt';
import IOSInstallPrompt from './components/pwa/IOSInstallPrompt';
import SplashScreen from './components/pwa/SplashScreen';
import LoadingBar from './components/ui/LoadingBar';
import { Toaster } from 'react-hot-toast';

// Smart Redirect Component
const RootRedirect = () => {
    const clientToken = localStorage.getItem("clientToken");
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (clientToken) {
        return <Navigate to="/client" replace />;
    }

    if (token) {
        if (['SUPER_ADMIN', 'MANAGER'].includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'EMPLOYEE') return <Navigate to="/employee" replace />;
        if (user.role === 'SITE_SUPERVISOR') return <Navigate to="/supervisor" replace />;
    }

    return <Navigate to="/login" replace />;
};

function App() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Wait for 2.5 seconds to simulate loading/branding
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Toaster position="top-center" />
            <LoadingBar />
            <ReloadPrompt />
            <InstallPrompt />
            <IOSInstallPrompt />

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <SplashScreen key="splash" />
                ) : (
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<RootRedirect />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/client/login" element={<ClientLogin />} />

                            {/* Feature Routes */}
                            <Route path="/admin/*" element={<AdminApp />} />
                            <Route path="/employee/*" element={<EmployeeApp />} />
                            <Route path="/supervisor/*" element={<SupervisorApp />} />
                            <Route path="/client/*" element={<ClientApp />} />

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </BrowserRouter>
                )}
            </AnimatePresence>
        </>
    );
}

export default App;
