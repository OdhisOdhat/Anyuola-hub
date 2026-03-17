import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { fetchMe } from "../lib/api";

interface User {
  id: string;
  name: string;
  phone?: string;
  role: "admin" | "treasurer" | "member" | "subgroup_manager";
  clan_id: string;
  subgroup?: string;
  village?: string;
  father_name?: string;
  residence?: string;
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasPermission: (action: "create_welfare" | "view_contributions" | "manage_members") => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    console.log("fetchProfile called for:", userId);
    try {
      const data = await fetchMe();
      console.log("fetchMe returned:", data);
      
      if (data.error) {
        console.error("Error fetching profile:", data.error);
        return null;
      }
      
      localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
      return data;
    } catch (err) {
      console.error("Failed to fetch profile", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session fetch error:", error);
          if (error.message.includes("Refresh Token Not Found") || error.message.includes("Invalid Refresh Token")) {
            console.warn("Invalid refresh token detected, signing out...");
            await supabase.auth.signOut();
            if (mounted) {
              setSession(null);
              setUser(null);
            }
            return;
          }
        }
        
        if (initialSession && mounted) {
          setSession(initialSession);
          
          const cached = localStorage.getItem(`profile_${initialSession.user.id}`);
          if (cached && mounted) {
            try {
              setUser(JSON.parse(cached));
            } catch (e) {
              console.error("Failed to parse cached profile", e);
              localStorage.removeItem(`profile_${initialSession.user.id}`);
            }
          }

          // Fetch fresh profile in background
          fetchProfile(initialSession.user.id).then(profile => {
            if (mounted && profile) setUser(profile);
          });
        }
      } catch (error) {
        console.error("Auth initialization failed", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      if (currentSession) {
        setSession(currentSession);
        // Set loading false immediately if we have a session
        setLoading(false);
        
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          // Check cache first for instant UI
          const cached = localStorage.getItem(`profile_${currentSession.user.id}`);
          if (cached && mounted) {
            try {
              setUser(JSON.parse(cached));
            } catch (e) {
              localStorage.removeItem(`profile_${currentSession.user.id}`);
            }
          }

          // Fetch fresh profile in background
          fetchProfile(currentSession.user.id).then(profile => {
            if (mounted && profile) setUser(profile);
          });
        }
      } else {
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const hasPermission = (action: string) => {
    if (!user) return false;
    switch (action) {
      case "create_welfare":
      case "edit_welfare":
        return user.role === "admin" || user.role === "treasurer" || user.role === "subgroup_manager";
      case "view_contributions":
      case "edit_contributions":
        return user.role === "admin" || user.role === "treasurer";
      case "manage_members":
      case "edit_members":
        return user.role === "admin";
      case "manage_projects":
      case "edit_projects":
        return user.role === "admin";
      case "manage_alerts":
      case "edit_alerts":
        return user.role === "admin";
      default:
        return false;
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      const profile = await fetchProfile(session.user.id);
      if (profile) setUser(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, logout, refreshProfile, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
