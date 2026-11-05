import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Public pages
import { LandingPage } from '@/pages/LandingPage';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Dashboard sub-pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { JobRolesPage } from '@/pages/dashboard/JobRolesPage';
import { ResumeUploadPage } from '@/pages/dashboard/ResumeUploadPage';
import { HistoryPage } from '@/pages/dashboard/HistoryPage';
import { ProfilePage } from '@/pages/dashboard/ProfilePage';
import { SettingsPage } from '@/pages/dashboard/SettingsPage';

// Stage 3 pages
import { InsightsPage } from '@/pages/dashboard/InsightsPage';
import { CompareRolesPage } from '@/pages/dashboard/CompareRolesPage';
import { RoadmapPage } from '@/pages/dashboard/RoadmapPage';
import { LearningResourcesPage } from '@/pages/dashboard/LearningResourcesPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="analyze" element={<ResumeUploadPage />} />
            <Route path="job-roles" element={<JobRolesPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* Stage 3 routes */}
            <Route path="insights" element={<InsightsPage />} />
            <Route path="compare" element={<CompareRolesPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="resources" element={<LearningResourcesPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
