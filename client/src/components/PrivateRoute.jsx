import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!user || !user.id) {
    // User is not logged in
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    // User is logged in but doesn't have the required role (or isn't admin)
    // Admins can access any requiredRole route in this basic setup
    console.warn(`Access denied: User with role '${user.role}' attempted to access route requiring '${requiredRole}'`);
    return <Navigate to="/" replace />;
  }

  // User is logged in and has the required role (or is admin)
  return <Outlet />;
};

export default PrivateRoute; 