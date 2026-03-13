import React, { useEffect, useState } from "react";
import { 
  DollarSign, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock,
  ArrowLeft,
  Settings2,
  X,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchAllContributions, updateContribution } from "../lib/api";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Contributions() {
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContribution, setEditingContribution] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user, hasPermission } = useAuth();

  const isAdmin = hasPermission("edit_contributions");

  const [editForm, setEditForm] = useState({
    amount: 0,
    payment_reference: "",
    status: "verified"
  });

  const loadData = async () => {
    try {
      const data = await fetchAllContributions();
      setContributions(data);
    } catch (error) {
      console.error("Failed to load contributions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [hasPermission]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContribution) return;
    setSubmitting(true);
    try {
      await updateContribution(editingContribution.id, editForm);
      setEditingContribution(null);
      await loadData();
    } catch (error) {
      console.error("Failed to update contribution", error);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (cont: any) => {
    setEditingContribution(cont);
    setEditForm({
      amount: cont.amount,
      payment_reference: cont.payment_reference,
      status: cont.status || 'verified'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const totalRaised = contributions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/welfare" className="text-sm text-zinc-500 hover:text-emerald-600 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Welfare
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
            <DollarSign className="text-emerald-600 w-8 h-8" />
            Financial Records
          </h1>
          <p className="text-zinc-500 mt-2">
            Detailed view of all community contributions and welfare funding.
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Total Funds Collected</p>
          <p className="text-2xl font-black text-emerald-900">KES {totalRaised.toLocaleString()}</p>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Contributor</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Event / Case</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Reference</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {contributions.map((cont) => {
                const canEdit = isAdmin || (cont.member_id === user?.id && cont.status === 'pending');
                return (
                  <tr key={cont.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-zinc-400" />
                        <span className="font-medium text-zinc-900">{cont.member_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {cont.event_title}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900">
                      KES {cont.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-zinc-400">
                      {cont.payment_reference}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(cont.created_at), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        cont.status?.toLowerCase() === 'approved' || cont.status?.toLowerCase() === 'verified'
                          ? 'bg-emerald-50 text-emerald-700'
                          : cont.status?.toLowerCase() === 'rejected' || cont.status?.toLowerCase() === 'failed'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {cont.status?.toLowerCase() === 'approved' || cont.status?.toLowerCase() === 'verified' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {cont.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canEdit && (
                        <button 
                          onClick={() => startEditing(cont)}
                          className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-emerald-600 transition-colors"
                        >
                          <Settings2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {contributions.length === 0 && (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-500">No contributions recorded yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingContribution && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-zinc-900">Edit Contribution</h2>
                <button 
                  onClick={() => setEditingContribution(null)}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount (KES)</label>
                  <input
                    required
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Payment Reference</label>
                  <input
                    required
                    type="text"
                    value={editForm.payment_reference}
                    onChange={(e) => setEditForm({ ...editForm, payment_reference: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                {isAdmin && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingContribution(null)}
                    className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-600 font-bold rounded-xl hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
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
