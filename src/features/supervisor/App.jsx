import { Routes, Route, Navigate } from 'react-router-dom';
import SupervisorLayout from './layout/SupervisorLayout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Profile from './pages/Profile';
import MapView from './pages/MapView';

const SupervisorApp = () => {
    return (
        <Routes>
            <Route path="/" element={<SupervisorLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="tasks/:taskId" element={<TaskDetail />} />
                <Route path="map" element={<MapView />} />
                <Route path="profile" element={<Profile />} />
            </Route>
        </Routes>
    );
};

export default SupervisorApp;
