import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/dashboard/*" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;