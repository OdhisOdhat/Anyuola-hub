import React, { useEffect, useState, useRef } from "react";
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
  FileText,
  Settings,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [branding, setBranding] = useState({
    name: "My Anyuola App",
    tagline: "Trust Network",
    logo_url: null as string | null,
    primary_color: "#10b981", // Default Emerald
  });

  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        document.documentElement.style.setProperty('--brand-primary', data.primary_color);
      }
    }
    fetchBranding();
  }, [user?.clan_id]);

  const communityItems = [
    { name: "Members", path: "/members", icon: Users },
    { name: "Welfare", path: "/welfare", icon: HeartHandshake },
    { name: "Security", path: "/security", icon: ShieldAlert },
    { name: "Projects", path: "/projects", icon: Briefcase },
  ];

  const financeItems = [
    { name: "Financial Report", path: "/financial-report", icon: BarChart3 },
  ];

  if (hasPermission("view_contributions")) {
    financeItems.push({ name: "Contributions", path: "/contributions", icon: DollarSign });
  }

  const adminItems: any[] = [];
  if (user?.role === "admin") {
    adminItems.push({ name: "Admin Panel", path: "/admin/members", icon: ShieldCheck });
    adminItems.push({ name: "CMS Management", path: "/admin/cms", icon: FileText });
  }

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 shadow-sm" ref={dropdownRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 overflow-hidden"
                style={{ backgroundColor: branding.primary_color }}
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
            <Link
              to="/"
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-bold transition-all",
                location.pathname === "/" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              )}
              style={location.pathname === "/" ? { color: branding.primary_color, backgroundColor: `${branding.primary_color}10` } : {}}
            >
              Home
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-bold transition-all",
                    location.pathname === "/dashboard" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                  )}
                  style={location.pathname === "/dashboard" ? { color: branding.primary_color, backgroundColor: `${branding.primary_color}10` } : {}}
                >
                  Dashboard
                </Link>

                {/* Community Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('community')}
                    className={cn(
                      "flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-bold transition-all",
                      activeDropdown === 'community' ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                    )}
                    style={activeDropdown === 'community' ? { color: branding.primary_color, backgroundColor: `${branding.primary_color}10` } : {}}
                  >
                    <span>Community</span>
                    <ChevronDown className={cn("w-3 h-3 transition-transform", activeDropdown === 'community' && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'community' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 mt-2 w-56 bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden py-2 z-50"
                      >
                        {communityItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-white transition-colors border border-transparent group-hover:border-zinc-200">
                              <item.icon className="w-4 h-4" />
                            </div>
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Finance Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('finance')}
                    className={cn(
                      "flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-bold transition-all",
                      activeDropdown === 'finance' ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                    )}
                    style={activeDropdown === 'finance' ? { color: branding.primary_color, backgroundColor: `${branding.primary_color}10` } : {}}
                  >
                    <span>Finance</span>
                    <ChevronDown className={cn("w-3 h-3 transition-transform", activeDropdown === 'finance' && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'finance' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 mt-2 w-56 bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden py-2 z-50"
                      >
                        {financeItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-white transition-colors border border-transparent group-hover:border-zinc-200">
                              <item.icon className="w-4 h-4" />
                            </div>
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Admin Dropdown */}
                {adminItems.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('admin')}
                      className={cn(
                        "flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-bold transition-all",
                        activeDropdown === 'admin' ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                      )}
                      style={activeDropdown === 'admin' ? { color: branding.primary_color, backgroundColor: `${branding.primary_color}10` } : {}}
                    >
                      <span>Admin</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform", activeDropdown === 'admin' && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === 'admin' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 mt-2 w-56 bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden py-2 z-50"
                        >
                          {adminItems.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-white transition-colors border border-transparent group-hover:border-zinc-200">
                                <item.icon className="w-4 h-4" />
                              </div>
                              <span>{item.name}</span>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
            
            <div className="h-6 w-px bg-zinc-200 mx-4" />

            {user ? (
              <>
                <div className="flex items-center gap-2 mr-2">
                  <Link to="/messages" className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all relative">
                    <Mail className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  </Link>
                </div>

                <Link
                  to="/contribute"
                  className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2 rounded-xl font-black text-sm hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 mr-4"
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
                          className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-3"
                        >
                          <User className="w-4 h-4 text-zinc-400" />
                          My Profile
                        </Link>
                        <div className="border-t border-zinc-100 mt-2 pt-2">
                          <button 
                            onClick={() => {
                              logout();
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
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
              className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-zinc-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-bold text-zinc-900 hover:bg-zinc-50"
              >
                Home
              </Link>
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-bold text-zinc-900 hover:bg-zinc-50"
                  >
                    Dashboard
                  </Link>
                  
                  <div className="py-2">
                    <p className="px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Community</p>
                    {communityItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-zinc-600 hover:bg-zinc-50"
                      >
                        <item.icon className="w-5 h-5 text-zinc-400" />
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  <div className="py-2">
                    <p className="px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Finance</p>
                    {financeItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-zinc-600 hover:bg-zinc-50"
                      >
                        <item.icon className="w-5 h-5 text-zinc-400" />
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  {adminItems.length > 0 && (
                    <div className="py-2">
                      <p className="px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Admin</p>
                      {adminItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-zinc-600 hover:bg-zinc-50"
                        >
                          <item.icon className="w-5 h-5 text-zinc-400" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t border-zinc-100">
                    <Link
                      to="/contribute"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full bg-zinc-900 text-white px-4 py-3 rounded-xl font-black text-base"
                    >
                      <DollarSign className="w-5 h-5" />
                      Contribute Now
                    </Link>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-bold text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
              {!user && (
                <div className="pt-4 space-y-2">
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl text-base font-black text-zinc-900 border border-zinc-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl text-base font-black text-white bg-zinc-900"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
