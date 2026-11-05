import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-slate-400 font-medium">Verifying authentication session...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to sign in while preserving attempted destination
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : null;
};
