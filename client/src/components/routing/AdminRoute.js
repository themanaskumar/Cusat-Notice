import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../layout/Spinner';

const AdminRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default AdminRoute; 