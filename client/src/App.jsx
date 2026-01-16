import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import DashboardLayout from './pages/DashboardLayout'; // The Sidebar/Frame
import DashboardOverview from './pages/DashboardOverview'; // The Charts
import GenericPage from './pages/GenericPage'; // The Placeholders

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/auth" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        
        {/* --- NESTED DASHBOARD ROUTES --- */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            
            {/* Main Overview (Charts) */}
            <Route index element={<DashboardOverview />} />
            
            {/* Wildcard for all other sidebar links */}
            <Route path="*" element={<GenericPage />} />
            
            {/* Specific paths if you want to be explicit */}
            <Route path="jobs/*" element={<GenericPage />} />
            <Route path="hr/*" element={<GenericPage />} />
            <Route path="corporate/*" element={<GenericPage />} />
            <Route path="senior/*" element={<GenericPage />} />
            <Route path="campus/*" element={<GenericPage />} />
            <Route path="resume/*" element={<GenericPage />} />
            <Route path="email/*" element={<GenericPage />} />
            <Route path="settings" element={<GenericPage />} />
            
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;