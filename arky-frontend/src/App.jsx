import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import CreateObra from './pages/CreateObra';
import ObraDetails from './pages/ObraDetails';
import { ToastProvider } from './context/ToastContext';

import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-obra"
            element={
              <ProtectedRoute>
                <CreateObra />
              </ProtectedRoute>
            }
          />
          <Route
            path="/obras/:id"
            element={
              <ProtectedRoute>
                <ObraDetails />
              </ProtectedRoute>
            }
          />

        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}