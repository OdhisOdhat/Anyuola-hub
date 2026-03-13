import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  HeartHandshake, 
  ShieldAlert, 
  Briefcase, 
  Menu, 
  X,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  DollarSign,
  BarChart3,
  Info,
  Mail,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase"; // Ensure this import exists

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [branding, setBranding] = useState({
    name: "My Anyuola App",
    tagline: "Trust Network",
    logo_url: null as string | null,
    primary_color: "#10b981", // Default Emerald
  });

  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();

  // Fetch Branding Data
  useEffect(() => {
    async function fetchBranding() {
      if (!user?.clan_id) return;
      
      const { data, error } = await supabase
        .from('clans')
        .select('name, tagline, logo_url, primary_color')
        .eq('id', user.clan_id)
        .single();

      if (data && !error) {
        setBranding({
          name: data.name,
          tagline: data.tagline,
          logo_url: data.logo_url,
          primary_color: data.primary_color,
        });
        // Optional: Update global CSS variable for buttons/icons
        document.documentElement.style.setProperty('--brand-primary', data.primary_color);
      }
    }
    fetchBranding();
  }, [user?.clan_id]);

  const navItems = [
    { name: "Home", path: "/", icon: Info },
  ];

  if (user) {
    navItems.push({ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard });
    navItems.push({ name: "Messages", path: "/messages", icon: Mail });
    navItems.push({ name: "Members", path: "/members", icon: Users });
    navItems.push({ name: "Welfare", path: "/welfare", icon: HeartHandshake });
    navItems.push({ name: "Security", path: "/security", icon: ShieldAlert });
    navItems.push({ name: "Projects", path: "/projects", icon: Briefcase });
    navItems.push({ name: "Financial Report", path: "/financial-report", icon: BarChart3 });
  }

  if (hasPermission("view_contributions")) {
    navItems.push({ name: "Finance", path: "/contributions", icon: DollarSign });
  }

  if (user?.role === "admin") {
    navItems.push({ name: "Admin", path: "/admin/members", icon: ShieldCheck });
    navItems.push({ name: "CMS", path: "/admin/cms", icon: FileText });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              {/* Dynamic Logo Container */}
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 overflow-hidden"
                style={{ 
                  backgroundColor: branding.primary_color,
                  shadowColor: `${branding.primary_color}33` // adds 20% opacity for shadow
                }}
              >
                {branding.logo_url ? (
                  <img src={branding.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Users className="text-white w-6 h-6" />
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-zinc-900 leading-none">
                  {branding.name}
                </span>
                <span 
                  className="text-[10px] font-bold uppercase tracking-widest mt-1"
                  style={{ color: branding.primary_color }}
                >
                  {branding.tagline}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                    isActive 
                      ? "bg-zinc-100 text-zinc-900" // Neutral active state to let primary color shine elsewhere
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                  style={isActive ? { color: branding.primary_color, backgroundColor: `${branding.primary_color}10` } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            <div className="h-6 w-px bg-zinc-200 mx-4" />

            {user ? (
              <>
                <Link
                  to="/contribute"
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 mr-4"
                >
                  <DollarSign className="w-4 h-4" />
                  Contribute
                </Link>

                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-all text-sm font-bold text-zinc-700"
                  >
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white shadow-md"
                      style={{ backgroundColor: branding.primary_color }}
                    >
                      {user?.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="hidden lg:inline leading-none">{user?.name}</span>
                      <span className="hidden lg:inline text-[9px] text-zinc-400 uppercase tracking-tighter mt-0.5">{user?.role}</span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform", isUserMenuOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden py-2"
                      >
                        <div className="px-4 py-2 border-b border-zinc-100 mb-2">
                          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Account</p>
                        </div>
                        <Link 
                          to="/profile" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        <div className="px-4 py-2">
                          <p className="text-sm font-bold text-zinc-900">{user?.name}</p>
                          <p className="text-xs text-zinc-500">{user?.role}</p>
                        </div>
                        <div className="border-t border-zinc-100 mt-2 pt-2">
                          <button 
                            onClick={() => {
                              logout();
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              // Auth Links... (omitted for brevity, keep your original sign-in/register logic)
              <div className="flex items-center gap-3">
                 <Link to="/auth" className="text-sm font-black text-zinc-600 hover:text-zinc-900 px-4 py-2">Sign In</Link>
                 <Link to="/auth" className="bg-zinc-900 text-white px-5 py-2 rounded-xl font-black text-sm hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav... (Same logic applies: update logo/colors in mobile view) */}
    </nav>
  );
}