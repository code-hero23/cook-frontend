import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AdminApp from '@admin/App';
import EmployeeApp from '@employee/App';
import SupervisorApp from '@supervisor/App';
import ClientApp from '@client/App';
import Login from './pages/Login';
import ClientLogin from './pages/ClientLogin';
import ForgotPassword from './pages/ForgotPassword';
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

import ReloadPrompt from './components/pwa/ReloadPrompt';

function App() {
    return (
        <>
            <ReloadPrompt />
            <Toaster position="top-center" />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
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
        </>
    );
}

export default App;
