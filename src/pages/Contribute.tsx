import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Heart, 
  CreditCard, 
  Hash, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle,
  ChevronRight,
  Gift
} from "lucide-react";
import { fetchEvents, createContribution } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export default function Contribute() {
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get("event_id") || "";
  const isGuest = searchParams.get("guest") === "true";
  
  const [events, setEvents] = useState<any[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    event_id: initialEventId,
    amount: "",
    payment_reference: ""
  });

  const clanId = "clan-1";

  useEffect(() => {
    async function loadData() {
      try {
        const eventsData = await fetchEvents(clanId);
        setEvents(eventsData.filter((e: any) => e.status === 'active'));
        
        // If event_id was in URL, ensure it's set in form data after events load
        if (initialEventId) {
          setFormData(prev => ({ ...prev, event_id: initialEventId }));
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialEventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.event_id || !formData.amount || !formData.payment_reference) {
      setError("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createContribution({
        member_id: isGuest ? "guest-user" : user?.id,
        event_id: formData.event_id,
        amount: parseFloat(formData.amount),
        payment_reference: formData.payment_reference
      });
      setSuccess(true);
      setFormData({ event_id: "", amount: "", payment_reference: "" });
    } catch (err) {
      setError("Failed to submit contribution. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
            isGuest ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-blue-50 border-blue-100 text-blue-600"
          )}
        >
          {isGuest ? <Gift className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5 fill-current" />}
          {isGuest ? "Guest Donation" : "Mutual Support"}
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-black text-zinc-900 tracking-tight"
        >
          {isGuest ? "Welcome, Friend" : "Contribute Funds"}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-500 text-lg max-w-xl mx-auto leading-relaxed"
        >
          {isGuest 
            ? "Thank you for supporting our community. Your contribution helps us maintain our welfare programs and security initiatives."
            : "Support your community members during their time of need. Your contribution makes a real difference in someone's life."
          }
        </motion.p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-50 border border-emerald-100 rounded-3xl p-12 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-emerald-900">Contribution Received!</h2>
                  <p className="text-emerald-700/70">
                    Thank you for your generosity. Your payment is being verified by the treasurer.
                  </p>
                </div>
                <button 
                  onClick={() => setSuccess(false)}
                  className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:gap-3 transition-all"
                >
                  Make another contribution <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl border border-zinc-200 shadow-xl shadow-zinc-200/50 p-8 space-y-8"
              >
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                      Select Welfare Event
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {events.map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, event_id: event.id })}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border transition-all text-left group",
                            formData.event_id === event.id 
                              ? "bg-blue-50 border-blue-500 ring-4 ring-blue-500/10" 
                              : "bg-zinc-50 border-zinc-100 hover:border-zinc-300"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                              formData.event_id === event.id ? "bg-blue-500 text-white" : "bg-white text-zinc-400"
                            )}>
                              <Heart className="w-5 h-5" />
                            </div>
                            <div>
                              <p className={cn(
                                "font-bold leading-none",
                                formData.event_id === event.id ? "text-blue-900" : "text-zinc-900"
                              )}>{event.title}</p>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">{event.type}</p>
                            </div>
                          </div>
                          <ChevronRight className={cn(
                            "w-5 h-5 transition-transform",
                            formData.event_id === event.id ? "text-blue-500 translate-x-1" : "text-zinc-300"
                          )} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                        Contribution Amount (KES)
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <input 
                          type="number" 
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                        Payment Reference (M-Pesa)
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <input 
                          type="text" 
                          placeholder="e.g. RBT4X..."
                          value={formData.payment_reference}
                          onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value.toUpperCase() })}
                          className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={submitting}
                  className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Contribution
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900 rounded-3xl p-8 text-white space-y-6">
            <h3 className="text-xl font-black tracking-tight">Payment Instructions</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black shrink-0">1</div>
                <div className="space-y-1">
                  <p className="font-bold text-sm">Go to M-Pesa Menu</p>
                  <p className="text-xs text-zinc-400">Select Lipa na M-Pesa, then Paybill.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black shrink-0">2</div>
                <div className="space-y-1">
                  <p className="font-bold text-sm">Enter Business Number</p>
                  <p className="text-xs text-zinc-400 font-mono">714777 (Support Logistics)</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black shrink-0">3</div>
                <div className="space-y-1">
                  <p className="font-bold text-sm">Enter Account Number</p>
                  <p className="text-xs text-zinc-400 font-mono">0727774129</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black shrink-0">4</div>
                <div className="space-y-1">
                  <p className="font-bold text-sm">Enter Amount & PIN</p>
                  <p className="text-xs text-zinc-400">Complete the transaction on your phone.</p>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-white/10">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Important Note</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Please ensure you enter the correct M-Pesa reference code in the form to help us 
                reconcile your payment quickly.
              </p>
            </div>
          </div>

          <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group">
            <Heart className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 -rotate-12 transition-transform group-hover:scale-110" />
            <div className="relative space-y-4">
              <h3 className="text-xl font-black tracking-tight">Your Impact</h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                Last month, Anyuola members contributed over KES 150,000 to support 
                4 families with medical and education expenses.
              </p>
              <div className="pt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                See Community Impact <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
