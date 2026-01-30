import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { UserRole } from './types';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Checkout } from './pages/Checkout';
import { Success } from './pages/Success';
import { ClientDashboard } from './pages/ClientDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Members } from './pages/admin/Members';
import { Offers } from './pages/admin/Offers';
import { Affiliates } from './pages/admin/Affiliates';
import { PaymentGateways } from './pages/admin/PaymentGateways';
import { Settings } from './pages/admin/Settings';
import { SuccessPreview } from './pages/admin/SuccessPreview';

const ProtectedRoute: React.FC<{ children: React.ReactNode, roles?: UserRole[] }> = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes - Common */}
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/success" element={
                  <ProtectedRoute>
                    <Success />
                  </ProtectedRoute>
                } />

                {/* Protected Routes - Client */}
                <Route path="/dashboard" element={
                  <ProtectedRoute roles={[UserRole.CLIENT]}>
                    <ClientDashboard />
                  </ProtectedRoute>
                } />

                {/* Protected Routes - Admin */}
                <Route path="/admin" element={
                  <ProtectedRoute roles={[UserRole.ADMIN]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="members" element={<Members />} />
                  <Route path="offers" element={<Offers />} />
                  <Route path="affiliates" element={<Affiliates />} />
                  <Route path="gateways" element={<PaymentGateways />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="success-preview" element={<SuccessPreview />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;