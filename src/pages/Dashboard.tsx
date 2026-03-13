import React, { useEffect, useState } from "react";
import { 
  Users, 
  HeartHandshake, 
  ShieldAlert, 
  Briefcase,
  TrendingUp,
  ArrowRight,
  Settings,
  Upload,
  Palette
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchClan, fetchAlerts, fetchProjects, fetchEvents } from "../lib/api";
import { uploadBrandLogo, updateClanBranding } from "../lib/supabase";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [clan, setClan] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Branding UI State
  const [showBrandingPanel, setShowBrandingPanel] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const clanId = user?.clan_id || "clan-1";

  useEffect(() => {
    async function loadData() {
      if (!clan) setLoading(true);
      try {
        const clanData = await fetchClan(clanId);
        setClan(clanData);
        
        // Update local brand color variables
        if (clanData?.primary_color) {
          document.documentElement.style.setProperty('--brand-primary', clanData.primary_color);
        }

        const [alertsData, projectsData, eventsData] = await Promise.all([
          fetchAlerts(clanId),
          fetchProjects(clanId),
          fetchEvents(clanId)
        ]);
        
        setAlerts(Array.isArray(alertsData) ? alertsData.slice(0, 3) : []);
        setProjects(Array.isArray(projectsData) ? projectsData.slice(0, 2) : []);
        setEvents(Array.isArray(eventsData) ? eventsData.slice(0, 3) : []);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [clanId]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUpdating(true);
    try {
      const publicUrl = await uploadBrandLogo(e.target.files[0], clanId);
      await updateClanBranding(clanId, { logo_url: publicUrl });
      setClan({ ...clan, logo_url: publicUrl });
      alert("Logo updated successfully!");
    } catch (error) {
      alert("Upload failed. Check console.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleColorChange = async (color: string) => {
    setIsUpdating(true);
    try {
      await updateClanBranding(clanId, { primary_color: color });
      setClan({ ...clan, primary_color: color });
      document.documentElement.style.setProperty('--brand-primary', color);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && !clan) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 bg-zinc-200 rounded-3xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-zinc-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const primaryColor = clan?.primary_color || "#10b981";

  return (
    <div className="space-y-8">
      {/* Header / Hero - Dynamically styled */}
      <header 
        className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-white shadow-2xl transition-colors duration-500"
        style={{ backgroundColor: '#18181b' }} // Dark neutral background
      >
        <div className="relative z-10 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest mb-6"
            style={{ 
              backgroundColor: `${primaryColor}15`, 
              borderColor: `${primaryColor}30`,
              color: primaryColor 
            }}
          >
            <TrendingUp className="w-3 h-3" />
            {clan?.tagline || "Community Operating System"}
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 flex items-center gap-4">
            {clan?.logo_url && (
              <img src={clan.logo_url} className="w-12 h-12 object-contain" alt="Logo" />
            )}
            Welcome to {clan?.name || "My Anyuola App"}
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            {clan?.description || "Empowering our community through digital trust."}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link 
              to="/welfare" 
              className="px-6 py-3 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
              style={{ backgroundColor: primaryColor, boxShadow: `0 10px 15px -3px ${primaryColor}40` }}
            >
              Support Welfare
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            {user?.role === 'admin' && (
              <button 
                onClick={() => setShowBrandingPanel(!showBrandingPanel)}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all border border-zinc-700 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Customize Branding
              </button>
            )}
          </div>
        </div>
        {/* Glow effect matching brand color */}
        <div 
          className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 blur-[120px] rounded-full opacity-30" 
          style={{ backgroundColor: primaryColor }}
        />
      </header>

      {/* Admin Branding Panel */}
      <AnimatePresence>
        {showBrandingPanel && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-white border-2 border-dashed border-zinc-200 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-zinc-900">
                  <Upload className="w-4 h-4" /> Brand Logo
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-100 rounded-xl flex items-center justify-center border overflow-hidden">
                    {clan?.logo_url ? <img src={clan.logo_url} className="w-full h-full object-contain" /> : <Users />}
                  </div>
                  <input 
                    type="file" 
                    onChange={handleLogoUpload} 
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer" 
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-zinc-900">
                  <Palette className="w-4 h-4" /> Theme Color
                </h3>
                <div className="flex gap-3">
                  {['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b'].map(color => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`w-10 h-10 rounded-full border-4 ${clan.primary_color === color ? 'border-zinc-900' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-10 h-10 rounded-full overflow-hidden border-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Members" value="156" icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Active Welfare" value={events.length.toString()} icon={HeartHandshake} color="text-rose-600" bg="bg-rose-50" />
        <StatCard title="Security Alerts" value={alerts.length.toString()} icon={ShieldAlert} color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="Ongoing Projects" value={projects.length.toString()} icon={Briefcase} color={primaryColor} colorClass="text-brand" bg="bg-brand-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Alerts (Simplified for brevity) */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" /> Recent Alerts
          </h2>
          {/* ... existing alert map ... */}
        </div>

        {/* Active Projects - Progress bar now uses brand color */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5" style={{ color: primaryColor }} /> Active Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="p-5 bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col">
                <h3 className="font-semibold text-zinc-900">{project.title}</h3>
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-500">Progress</span>
                    <span style={{ color: primaryColor }}>{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${project.progress}%`, backgroundColor: primaryColor }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Updated StatCard to handle custom brand colors
function StatCard({ title, value, icon: Icon, color, bg, colorClass }: any) {
  const isBrand = colorClass === 'text-brand';
  return (
    <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group">
      <div 
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${bg}`}
        style={isBrand ? { backgroundColor: `${color}15`, color: color } : {}}
      >
        <Icon className={`w-6 h-6 ${!isBrand ? color : ''}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        <p className="text-2xl font-bold text-zinc-900">{value}</p>
      </div>
    </div>
  );
}