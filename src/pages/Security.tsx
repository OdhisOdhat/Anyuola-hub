import React, { useEffect, useState } from "react";
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Plus,
  Search,
  Filter,
  User,
  Settings2,
  X
} from "lucide-react";
import { fetchAlerts, createAlert, updateAlert } from "../lib/api";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

export default function Security() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReporting, setIsReporting] = useState(false);
  const [editingAlert, setEditingAlert] = useState<any>(null);
  const { user, hasPermission } = useAuth();
  const [newAlert, setNewAlert] = useState({
    title: "",
    description: "",
    severity: "medium",
    location: ""
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    severity: "medium",
    location: ""
  });

  const clanId = "clan-1";

  const loadAlerts = async () => {
    try {
      const data = await fetchAlerts(clanId);
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load alerts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAlert({
        ...newAlert,
        clan_id: clanId,
        created_by: user?.id || "mem-1"
      });
      loadAlerts();
      setIsReporting(false);
      setNewAlert({ title: "", description: "", severity: "medium", location: "" });
    } catch (error) {
      console.error("Failed to create alert", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlert) return;
    try {
      await updateAlert(editingAlert.id, editForm);
      loadAlerts();
      setEditingAlert(null);
    } catch (error) {
      console.error("Failed to update alert", error);
    }
  };

  const startEditing = (alert: any) => {
    setEditingAlert(alert);
    setEditForm({
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      location: alert.location
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden bg-amber-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-6">
            <ShieldAlert className="w-3 h-3" />
            Live Security Network
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Security & Vigilance
          </h1>
          <p className="text-amber-50 text-lg leading-relaxed opacity-90">
            Real-time community security monitoring. Report suspicious activities 
            and stay informed about the safety of our neighborhood.
          </p>
          <div className="mt-8">
            <button 
              onClick={() => setIsReporting(true)}
              className="px-8 py-4 bg-white text-amber-600 rounded-2xl font-black transition-all shadow-xl hover:scale-105 flex items-center gap-3"
            >
              <AlertTriangle className="w-6 h-6" />
              Report Incident Now
            </button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 blur-[120px] rounded-full" />
      </header>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search security reports..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 bg-white border border-zinc-200 rounded-2xl text-zinc-600 font-bold hover:bg-zinc-50 transition-all shadow-sm shrink-0">
          <Filter className="w-5 h-5" />
          Filter Feed
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {alerts.map((alert) => (
          <motion.div 
            layout
            key={alert.id} 
            className="bg-white rounded-3xl border border-zinc-200 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
          >
            <div className="p-8 flex flex-col md:flex-row gap-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                alert.severity === 'high' ? 'bg-red-50 text-red-600' : 
                alert.severity === 'medium' ? 'bg-amber-50 text-amber-600' : 
                'bg-blue-50 text-blue-600'
              }`}>
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="flex-grow space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-2xl font-black text-zinc-900 leading-tight">{alert.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shrink-0 ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-700' : 
                      alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {alert.severity} Priority
                    </span>
                    {hasPermission("edit_alerts") && (
                      <button 
                        onClick={() => startEditing(alert)}
                        className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-zinc-600 text-lg leading-relaxed">{alert.description}</p>
                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-zinc-50 text-sm font-bold text-zinc-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-zinc-300" />
                    <span>{alert.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-zinc-300" />
                    <span>{format(new Date(alert.created_at), 'MMM d, h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-zinc-300" />
                    <span>Reported by: {alert.creator_name || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingAlert && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingAlert(null)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">Edit Security Report</h2>
                  <p className="text-sm text-zinc-500 mt-1">Update the details of this security incident.</p>
                </div>
                <button onClick={() => setEditingAlert(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Incident Title</label>
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Severity</label>
                    <select
                      value={editForm.severity}
                      onChange={(e) => setEditForm({...editForm, severity: e.target.value})}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingAlert(null)}
                    className="flex-1 px-4 py-2 border border-zinc-200 text-zinc-600 rounded-lg font-medium hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {isReporting && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReporting(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100">
                <h2 className="text-xl font-bold text-zinc-900">Report Security Incident</h2>
                <p className="text-sm text-zinc-500 mt-1">Provide details about the suspicious activity or incident.</p>
              </div>
              <form onSubmit={handleReport} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Incident Title</label>
                    <input
                      type="text"
                      required
                      value={newAlert.title}
                      onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="e.g., Suspicious vehicle spotted"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Severity</label>
                    <select
                      value={newAlert.severity}
                      onChange={(e) => setNewAlert({...newAlert, severity: e.target.value})}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={newAlert.location}
                      onChange={(e) => setNewAlert({...newAlert, location: e.target.value})}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="e.g., North Gate"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={newAlert.description}
                      onChange={(e) => setNewAlert({...newAlert, description: e.target.value})}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                      placeholder="Describe what happened..."
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReporting(false)}
                    className="flex-1 px-4 py-2 border border-zinc-200 text-zinc-600 rounded-lg font-medium hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-sm"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
