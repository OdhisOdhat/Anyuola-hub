import React, { useEffect, useState } from "react";
import { 
  HeartHandshake, 
  GraduationCap, 
  Activity, 
  Church,
  Plus,
  DollarSign,
  Users,
  X,
  Settings2
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchEvents, createEvent, updateEvent } from "../lib/api";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

export default function Welfare() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();

  const clanId = "clan-1";

  const [isInitiating, setIsInitiating] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "general",
    description: "",
    target_amount: 0,
    date: ""
  });

  const [editForm, setEditForm] = useState({
    title: "",
    type: "general",
    description: "",
    target_amount: 0,
    date: "",
    status: "active"
  });

  const loadEvents = async () => {
    try {
      const data = await fetchEvents(clanId);
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEvent({
        ...newEvent,
        clan_id: clanId
      });
      loadEvents();
      setIsInitiating(false);
      setNewEvent({ title: "", type: "general", description: "", date: "" });
    } catch (error) {
      console.error("Failed to create welfare case", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      await updateEvent(editingEvent.id, editForm);
      loadEvents();
      setEditingEvent(null);
    } catch (error) {
      console.error("Failed to update welfare case", error);
    }
  };

  const startEditing = (event: any) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title,
      type: event.type,
      description: event.description,
      target_amount: event.target_amount || 0,
      date: event.date.split('T')[0],
      status: event.status || 'active'
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'education': return GraduationCap;
      case 'medical': return Activity;
      case 'funeral': return Church;
      default: return HeartHandshake;
    }
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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-widest mb-4">
            <HeartHandshake className="w-3 h-3" />
            Social Support Network
          </div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">
            Welfare & Support
          </h1>
          <p className="text-zinc-500 mt-2 text-lg leading-relaxed">
            Managing community trust funds for education, medical emergencies, and funerals. 
            Every contribution strengthens our collective resilience.
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/contribute"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 shrink-0"
          >
            <DollarSign className="w-5 h-5" />
            Contribute Funds
          </Link>
          {hasPermission("create_welfare") && (
            <button 
              onClick={() => setIsInitiating(true)}
              className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 shrink-0"
            >
              <Plus className="w-5 h-5" />
              Initiate New Case
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => {
          const Icon = getIcon(event.type);
          const progress = Math.min(100, Math.floor(Math.random() * 60) + 20); // Demo progress
          return (
            <motion.div 
              whileHover={{ y: -4 }}
              key={event.id} 
              className="bg-white rounded-3xl border border-zinc-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group"
            >
              <div className="p-8 flex-grow">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${
                    event.type === 'education' ? 'bg-blue-50 text-blue-600' :
                    event.type === 'medical' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-zinc-100 text-zinc-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{event.type}</span>
                    {hasPermission("create_welfare") && (
                      <button 
                        onClick={() => startEditing(event)}
                        className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-zinc-900 leading-tight mb-3">{event.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 mb-6">{event.description}</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Target</p>
                      <p className="text-lg font-black text-zinc-900">KES {event.target_amount?.toLocaleString() || '0'}</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-600">{progress}%</p>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full rounded-full ${
                        event.type === 'education' ? 'bg-blue-500' :
                        event.type === 'medical' ? 'bg-emerald-500' :
                        'bg-zinc-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Deadline</span>
                  <span className="text-xs font-bold text-zinc-600">{format(new Date(event.date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Initiated By</span>
                  <span className="text-xs font-bold text-zinc-600">{event.creator_name || 'Unknown'}</span>
                </div>
                <Link 
                  to={`/contribute?event_id=${event.id}`}
                  className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
                >
                  Contribute
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Edit Case Modal */}
      <AnimatePresence>
        {editingEvent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingEvent(null)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900">Edit Welfare Case</h2>
                  <p className="text-sm text-zinc-500 mt-1">Update the details of this support fundraiser.</p>
                </div>
                <button onClick={() => setEditingEvent(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Case Title</label>
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Type</label>
                      <select
                        value={editForm.type}
                        onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                      >
                        <option value="education">Education</option>
                        <option value="medical">Medical</option>
                        <option value="funeral">Funeral</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Target Amount (KES)</label>
                      <input
                        type="number"
                        required
                        value={editForm.target_amount}
                        onChange={(e) => setEditForm({...editForm, target_amount: Number(e.target.value)})}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Deadline Date</label>
                    <input
                      type="date"
                      required
                      value={editForm.date}
                      onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                    <textarea
                      required
                      rows={4}
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="flex-1 px-6 py-4 border border-zinc-200 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isInitiating && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInitiating(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900">Initiate Welfare Case</h2>
                  <p className="text-sm text-zinc-500 mt-1">Start a new community support fundraiser.</p>
                </div>
                <button onClick={() => setIsInitiating(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>
              <form onSubmit={handleInitiate} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Case Title</label>
                    <input
                      type="text"
                      required
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-bold"
                      placeholder="e.g., Education Fund for Sarah"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Target Amount (KES)</label>
                    <input
                      type="number"
                      required
                      value={newEvent.target_amount}
                      onChange={(e) => setNewEvent({...newEvent, target_amount: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-bold"
                      placeholder="e.g. 50000"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Type</label>
                      <select
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-bold"
                      >
                        <option value="education">Education</option>
                        <option value="medical">Medical</option>
                        <option value="funeral">Funeral</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Deadline Date</label>
                      <input
                        type="date"
                        required
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                    <textarea
                      required
                      rows={4}
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-medium resize-none"
                      placeholder="Explain the need for support..."
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsInitiating(false)}
                    className="flex-1 px-6 py-4 border border-zinc-200 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20"
                  >
                    Initiate Case
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
