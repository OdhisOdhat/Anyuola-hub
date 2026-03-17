import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ClanMembers from "./pages/ClanMembers";
import Welfare from "./pages/Welfare";
import Security from "./pages/Security";
import Projects from "./pages/Projects";
import Contributions from "./pages/Contributions";
import Contribute from "./pages/Contribute";
import About from "./pages/About";
import Auth from "./pages/Auth";
import MemberManagement from "./pages/MemberManagement";
import AdminCMS from "./pages/AdminCMS";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import FinancialReport from "./pages/FinancialReport";
import { fetchClan } from "./lib/api";

// This component handles the global branding application
function ThemeManager({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    async function applyBranding() {
      if (user?.clan_id) {
        try {
          const clan = await fetchClan(user.clan_id);
          if (clan?.primary_color) {
            // Injects the brand color as a CSS variable available to all components
            document.documentElement.style.setProperty('--brand-primary', clan.primary_color);
          }
        } catch (err) {
          console.error("ThemeManager: Failed to load clan color", err);
        }
      }
    }
    applyBranding();
  }, [user?.clan_id]);

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div 
          className="w-10 h-10 border-4 border-zinc-200 border-t-[var(--brand-primary,#10b981)] rounded-full animate-spin" 
        />
      </div>
    );
  }

  // Use session for the initial check to allow background profile loading
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeManager>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Layout><About /></Layout>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><ClanMembers /></ProtectedRoute>} />
            <Route path="/welfare" element={<ProtectedRoute><Welfare /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/contributions" element={<ProtectedRoute><Contributions /></ProtectedRoute>} />
            <Route path="/contribute" element={
              <ThemeManager>
                <Layout><Contribute /></Layout>
              </ThemeManager>
            } />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/financial-report" element={<ProtectedRoute><FinancialReport /></ProtectedRoute>} />
            <Route path="/admin/members" element={<ProtectedRoute><MemberManagement /></ProtectedRoute>} />
            <Route path="/admin/cms" element={<ProtectedRoute><AdminCMS /></ProtectedRoute>} />
          </Routes>
        </Router>
      </ThemeManager>
    </AuthProvider>
  );
}