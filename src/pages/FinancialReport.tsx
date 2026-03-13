import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchFinancialReport } from "../lib/api";
import { BarChart3, TrendingUp, DollarSign, PieChart, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function FinancialReport() {
  const { user } = useAuth();
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.clan_id) {
      loadReport();
    }
  }, [user?.clan_id]);

  const loadReport = async () => {
    try {
      setError(null);
      const data = await fetchFinancialReport(user!.clan_id);
      if (data.error) throw new Error(data.error);
      setReport(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load financial report", err);
      setError(err.message || "Failed to load financial report");
    } finally {
      setLoading(false);
    }
  };

  const totalTarget = report.reduce((sum, item) => sum + (item.target_amount || 0), 0);
  const totalRaised = report.reduce((sum, item) => sum + (item.total_raised || 0), 0);
  const overallPercentage = totalTarget > 0 ? (totalRaised / totalTarget) * 100 : 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Unable to load report</h2>
        <p className="text-zinc-500">{error}</p>
        <button 
          onClick={loadReport}
          className="px-6 py-2 bg-brand text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Financial Report</h1>
          <p className="text-zinc-500">Real-time overview of clan contributions and welfare fund status.</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl">
          <button className="px-4 py-2 bg-white text-zinc-900 rounded-lg text-sm font-bold shadow-sm">Overview</button>
          <button className="px-4 py-2 text-zinc-500 rounded-lg text-sm font-bold hover:text-zinc-900">Detailed</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-4"
        >
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Total Raised</p>
            <h2 className="text-3xl font-black text-zinc-900">KSh {totalRaised.toLocaleString()}</h2>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>Across all active cases</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-4"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Total Target</p>
            <h2 className="text-3xl font-black text-zinc-900">KSh {totalTarget.toLocaleString()}</h2>
          </div>
          <p className="text-sm text-zinc-500">Combined goal for all initiatives</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-4"
        >
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Completion</p>
            <h2 className="text-3xl font-black text-zinc-900">{overallPercentage.toFixed(1)}%</h2>
          </div>
          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-purple-600 h-full transition-all duration-1000" 
              style={{ width: `${overallPercentage}%` }} 
            />
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="font-black text-zinc-900">Welfare Case Breakdown</h3>
        </div>
        <div className="divide-y divide-zinc-100">
          {report.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-zinc-500 font-medium">No welfare cases or contributions found.</p>
              <p className="text-xs text-zinc-400">Contributions will appear here once they are verified or approved.</p>
            </div>
          ) : (
            report.map((item, index) => (
              <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-50 transition-colors">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px] font-bold uppercase tracking-widest">
                      {item.type}
                    </span>
                    <h4 className="font-bold text-zinc-900">{item.title}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    {item.target_amount > 0 && (
                      <>
                        <span>Target: KSh {item.target_amount.toLocaleString()}</span>
                        <span>•</span>
                      </>
                    )}
                    <span className="text-emerald-600 font-bold">Raised: KSh {item.total_raised.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="w-full md:w-64 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-500">Progress</span>
                    <span className="text-zinc-900">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand h-full" 
                      style={{ width: `${Math.min(item.percentage, 100)}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
