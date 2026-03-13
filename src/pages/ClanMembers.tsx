import React, { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone,
  ShieldCheck,
  User,
  X,
  MapPin,
  Home
} from "lucide-react";
import { fetchMembers, createMember } from "../lib/api";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

export default function ClanMembers() {
  const { hasPermission } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    phone: "",
    role: "member",
    subgroup: "",
    village: "",
    father_name: "",
    residence: ""
  });

  const clanId = "clan-1";

  const loadMembers = async () => {
    try {
      const data = await fetchMembers(clanId);
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load members", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMember({
        ...newMember,
        clan_id: clanId
      });
      loadMembers();
      setIsRegistering(false);
      setNewMember({
        name: "",
        phone: "",
        role: "member",
        subgroup: "",
        village: "",
        father_name: "",
        residence: ""
      });
    } catch (error) {
      console.error("Failed to register member", error);
    }
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Users className="w-3 h-3" />
            Community Directory
          </div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">
            Clan Members
          </h1>
          <p className="text-zinc-500 mt-2 text-lg leading-relaxed">
            Directory of all registered community members. Manage roles, permissions, 
            and contact information for our growing network.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            className="flex items-center gap-2 px-6 py-3 border border-zinc-200 text-zinc-600 rounded-xl font-bold hover:bg-zinc-50 transition-all shadow-sm"
            onClick={() => {
              const url = `${window.location.origin}/join`;
              navigator.clipboard.writeText(url);
              alert("Invite link copied to clipboard!");
            }}
          >
            Invite Link
          </button>
          {hasPermission("manage_members") && (
            <button 
              onClick={() => setIsRegistering(true)}
              className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20"
            >
              Register Member
            </button>
          )}
        </div>
      </header>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 bg-white border border-zinc-200 rounded-2xl text-zinc-600 font-bold hover:bg-zinc-50 transition-all shadow-sm shrink-0">
          <Filter className="w-5 h-5" />
          Filter List
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Member</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Origins & Residence</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Role</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Contact</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 overflow-hidden transition-transform group-hover:scale-105">
                        <User className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-black text-zinc-900 leading-none">{member.name}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">
                          {member.father_name ? `S/O ${member.father_name}` : `ID: ${member.id}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600">
                        <MapPin className="w-3.5 h-3.5 text-zinc-300" />
                        <span>{member.village || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        <Home className="w-3 h-3 text-zinc-300" />
                        <span>{member.residence || 'No Residence'}</span>
                      </div>
                      <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-5">
                        {member.subgroup || 'No Subgroup'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm font-bold text-zinc-600">
                        <Phone className="w-4 h-4 text-zinc-300" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                        <Mail className="w-4 h-4 text-zinc-200" />
                        <span>{member.name.toLowerCase().replace(' ', '.')}@community.org</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-zinc-500">
                      {format(new Date(member.created_at), 'MMM d, yyyy')}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-3 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-2xl transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredMembers.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-500">No members found matching your search.</p>
          </div>
        )}
      </div>

      {/* Register Member Modal */}
      <AnimatePresence>
        {isRegistering && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegistering(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900">Register New Member</h2>
                  <p className="text-sm text-zinc-500 mt-1">Directly add a new member to the community directory.</p>
                </div>
                <button onClick={() => setIsRegistering(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>
              <form onSubmit={handleRegister} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newMember.name}
                        onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={newMember.phone}
                        onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                        placeholder="0712345678"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Role</label>
                      <select
                        value={newMember.role}
                        onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                      >
                        <option value="member">Member</option>
                        <option value="subgroup_manager">Subgroup Manager</option>
                        <option value="treasurer">Treasurer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Father's Name</label>
                      <input
                        type="text"
                        value={newMember.father_name}
                        onChange={(e) => setNewMember({...newMember, father_name: e.target.value})}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                        placeholder="Father's Full Name"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Subgroup Name</label>
                      <input
                        type="text"
                        value={newMember.subgroup}
                        onChange={(e) => setNewMember({...newMember, subgroup: e.target.value})}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                        placeholder="e.g., Young Professionals"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Village Name</label>
                      <input
                        type="text"
                        value={newMember.village}
                        onChange={(e) => setNewMember({...newMember, village: e.target.value})}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                        placeholder="Ancestral Village"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Present Residence</label>
                      <input
                        type="text"
                        value={newMember.residence}
                        onChange={(e) => setNewMember({...newMember, residence: e.target.value})}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                        placeholder="Current City/Town"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="flex-1 px-6 py-4 border border-zinc-200 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-zinc-900 text-white rounded-2xl font-black hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20"
                  >
                    Register Member
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
