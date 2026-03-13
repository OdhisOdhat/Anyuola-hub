import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchMembers, updateMember } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, UserCog, CheckCircle2, XCircle, Search, Filter, MoreVertical, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Member {
  id: string;
  name: string;
  phone: string;
  role: string;
  clan_id: string;
  subgroup?: string;
  village?: string;
  father_name?: string;
  residence?: string;
  created_at: string;
}

const ROLES = [
  { id: 'member', label: 'Member', icon: Users, color: 'text-zinc-500 bg-zinc-100' },
  { id: 'subgroup_manager', label: 'Subgroup Manager', icon: UserCog, color: 'text-blue-600 bg-blue-50' },
  { id: 'treasurer', label: 'Treasurer', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
  { id: 'admin', label: 'Admin', icon: ShieldAlert, color: 'text-red-600 bg-red-50' },
];

export default function MemberManagement() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.clan_id) {
      loadMembers();
    }
  }, [user?.clan_id]);

  const loadMembers = async () => {
    try {
      const data = await fetchMembers(user!.clan_id);
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setUpdatingId(memberId);
    try {
      await updateMember(memberId, { role: newRole });
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    } catch (error) {
      console.error('Failed to update role', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState<Partial<Member>>({});

  const handleEditClick = (member: Member) => {
    setEditingMember(member);
    setEditForm(member);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    
    setUpdatingId(editingMember.id);
    try {
      await updateMember(editingMember.id, editForm);
      setMembers(members.map(m => m.id === editingMember.id ? { ...m, ...editForm } : m));
      setEditingMember(null);
    } catch (error) {
      console.error('Failed to update member', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.phone?.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 mb-2">Access Denied</h2>
        <p className="text-zinc-500 font-medium max-w-md">
          Only administrators can access the member management dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Member Management</h1>
          <p className="text-zinc-500 font-medium mt-2">Manage roles and permissions for your community.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search members by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold appearance-none"
          >
            <option value="all">All Roles</option>
            {ROLES.map(role => (
              <option key={role.id} value={role.id}>{role.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Member</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Current Role</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Change Role</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                      <p className="text-zinc-500 font-bold">Loading community members...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-zinc-500 font-bold">No members found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center font-black text-zinc-400">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-zinc-900">{member.name}</div>
                          <div className="text-xs font-bold text-zinc-500">{member.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {(() => {
                        const role = ROLES.find(r => r.id === member.role) || ROLES[0];
                        const Icon = role.icon;
                        return (
                          <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black", role.color)}>
                            <Icon className="w-3.5 h-3.5" />
                            {role.label}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        {ROLES.map(role => (
                          <button
                            key={role.id}
                            disabled={updatingId === member.id || member.role === role.id}
                            onClick={() => handleRoleChange(member.id, role.id)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                              member.role === role.id 
                                ? "bg-zinc-900 text-white" 
                                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                            )}
                          >
                            {role.id === 'subgroup_manager' ? 'Manager' : role.label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-medium text-zinc-500 space-y-1">
                        {member.subgroup && <div><span className="font-black text-zinc-400">Subgroup:</span> {member.subgroup}</div>}
                        {member.village && <div><span className="font-black text-zinc-400">Village:</span> {member.village}</div>}
                        {member.residence && <div><span className="font-black text-zinc-400">Residence:</span> {member.residence}</div>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleEditClick(member)}
                        className="p-3 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                      >
                        <UserCog className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Member Modal */}
      <AnimatePresence>
        {editingMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingMember(null)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Edit Member Details</h2>
                <button onClick={() => setEditingMember(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <XCircle className="w-6 h-6 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleUpdateMember} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Village</label>
                    <input 
                      type="text" 
                      value={editForm.village || ''}
                      onChange={(e) => setEditForm({ ...editForm, village: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Residence</label>
                    <input 
                      type="text" 
                      value={editForm.residence || ''}
                      onChange={(e) => setEditForm({ ...editForm, residence: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Father's Name</label>
                    <input 
                      type="text" 
                      value={editForm.father_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, father_name: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Subgroup</label>
                    <input 
                      type="text" 
                      value={editForm.subgroup || ''}
                      onChange={(e) => setEditForm({ ...editForm, subgroup: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="flex-1 px-6 py-4 border border-zinc-200 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={updatingId === editingMember.id}
                    className="flex-1 px-6 py-4 bg-zinc-900 text-white rounded-2xl font-black hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 flex items-center justify-center gap-2"
                  >
                    {updatingId === editingMember.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
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
