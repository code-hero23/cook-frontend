import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AdminApp from '@admin/App';
import EmployeeApp from '@employee/App';
import SupervisorApp from '@supervisor/App';
import ClientApp from '@client/App';
import Login from './pages/Login';
import ReloadPrompt from './components/pwa/ReloadPrompt';
import InstallPrompt from './components/pwa/InstallPrompt';
import IOSInstallPrompt from './components/pwa/IOSInstallPrompt';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-center" />
            <ReloadPrompt />
            <InstallPrompt />
            <IOSInstallPrompt />
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />

                {/* Feature Routes */}
                <Route path="/admin/*" element={<AdminApp />} />
                <Route path="/employee/*" element={<EmployeeApp />} />
                <Route path="/supervisor/*" element={<SupervisorApp />} />
                <Route path="/client/*" element={<ClientApp />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
