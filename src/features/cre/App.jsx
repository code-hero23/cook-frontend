import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { CREProvider } from './context/CREContext';
import WalkinHub from './pages/WalkinHub';

import WorkReports from './pages/WorkReports';
import MonthlyReports from './pages/MonthlyReports';

const CREApp = () => {
    return (
        <CREProvider>
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="walkin-hub" replace />} />
                    <Route path="walkin-hub" element={<WalkinHub />} />
                    <Route path="work-reports" element={<WorkReports />} />
                    <Route path="monthly-reports" element={<MonthlyReports />} />
                    <Route path="*" element={<Navigate to="walkin-hub" replace />} />
                </Routes>
            </Layout>
        </CREProvider>
    );
};


export default CREApp;
