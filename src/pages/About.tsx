import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Shield, 
  Users, 
  Globe, 
  Zap, 
  Coffee, 
  Gift,
  ArrowRight,
  CheckCircle2,
  Info,
  X
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function About() {
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-zinc-900 py-24 px-8 text-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b981_0,transparent_50%)]" />
        </div>
        
        <motion.div 
          className="relative z-10 max-w-3xl mx-auto space-y-6"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.span 
            variants={fadeIn}
            className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20"
          >
            Our Story
          </motion.span>
          <motion.h1 
            variants={fadeIn}
            className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[0.9]"
          >
            Digitizing <span className="text-emerald-500">Trust</span> & <span className="text-blue-500">Community</span>.
          </motion.h1>
          <motion.p 
            variants={fadeIn}
            className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Anyuola Hub is more than just an app. It's a digital sanctuary for clans and communities to manage welfare, security, and collective growth with transparency.
          </motion.p>
          
          <motion.div variants={fadeIn} className="flex flex-wrap justify-center gap-4 pt-8">
            <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-2">
              Learn More <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-4 bg-zinc-800 text-white rounded-2xl font-black text-sm hover:bg-zinc-700 transition-all border border-zinc-700">
              Our Values
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-12 items-center px-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-zinc-900 tracking-tight leading-none">
              Built for the <br /> Modern Clan.
            </h2>
            <p className="text-zinc-500 font-medium leading-relaxed">
              In an increasingly fragmented world, maintaining community ties is harder than ever. We built Anyuola Hub to bridge the gap between traditional values and modern technology.
            </p>
          </div>

          <div className="grid gap-6">
            {[
              { 
                title: "Transparency First", 
                desc: "Every contribution, every welfare case, and every project is tracked and visible to authorized members.",
                icon: Shield
              },
              { 
                title: "Collective Welfare", 
                desc: "Automated support systems that ensure no member of the community is left behind during tough times.",
                icon: Heart
              },
              { 
                title: "Security & Alerts", 
                desc: "Real-time security reporting and location-based alerts to keep the clan safe and informed.",
                icon: Zap
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">{item.title}</h4>
                  <p className="text-sm text-zinc-500 font-medium mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200"
        >
          <img 
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000" 
            alt="Community" 
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent flex flex-col justify-end p-8">
            <p className="text-white font-black text-2xl italic">"Unity is strength, division is weakness."</p>
            <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest mt-2">— Clan Proverb</p>
          </div>
        </motion.div>
      </section>

      {/* Support & Logistics Section */}
      <section className="bg-zinc-50 rounded-[2.5rem] p-12 border border-zinc-200">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Support Our Logistics</h2>
            <p className="text-zinc-500 font-medium max-w-2xl mx-auto">
              Maintaining a secure, high-performance platform for our community requires resources. Your support helps cover server costs, security audits, and continuous development.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { label: "Server Maintenance", icon: Globe },
              { label: "Security Updates", icon: Shield },
              { label: "New Features", icon: Zap }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col items-center gap-3">
                <item.icon className="w-8 h-8 text-blue-600" />
                <span className="font-bold text-zinc-800 text-sm">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <button 
              onClick={() => setShowSupportModal(true)}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-zinc-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-2xl shadow-zinc-900/20"
            >
              <Coffee className="w-6 h-6 text-emerald-500 group-hover:rotate-12 transition-transform" />
              Support Logistics
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-tighter animate-bounce">
                Help Us Grow
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Guest Donation Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center bg-white rounded-[3rem] p-8 md:p-16 border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          
          <div className="space-y-8 relative z-10">
            <div className="space-y-4">
              <span className="text-rose-500 font-black text-[10px] uppercase tracking-[0.3em]">Guest Visitors</span>
              <h2 className="text-4xl font-black text-zinc-900 tracking-tight leading-none">
                Not a member? <br /> <span className="text-rose-500">You can still help.</span>
              </h2>
              <p className="text-zinc-500 font-medium leading-relaxed">
                We welcome friends and well-wishers who believe in our mission. Your donations go directly into our general welfare fund to support emergency cases and community projects.
              </p>
            </div>

            <ul className="space-y-3">
              {["100% Transparency", "Direct Impact", "Secure Processing"].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-rose-500" />
                  {text}
                </li>
              ))}
            </ul>

            <Link 
              to="/contribute?guest=true"
              className="w-full sm:w-auto px-10 py-5 bg-rose-500 text-white rounded-2xl font-black text-lg hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/30 flex items-center justify-center gap-3"
            >
              <Gift className="w-6 h-6" />
              Donate as Guest
            </Link>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-rose-100 rounded-[2.5rem] rotate-3 group-hover:rotate-1 transition-transform" />
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000" 
                alt="Giving" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / Info Section */}
      <section className="max-w-3xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-zinc-500 font-medium">Everything you need to know about Anyuola Hub.</p>
        </div>

        <div className="space-y-4">
          {[
            { q: "Is my data secure?", a: "Yes, we use industry-standard encryption and Supabase's secure infrastructure to protect all community data." },
            { q: "How are funds managed?", a: "Funds are managed by elected treasurers and all transactions are recorded on the platform for full transparency." },
            { q: "Can I join if I'm not from the clan?", a: "Membership is currently restricted to verified clan members, but guests can support through donations." }
          ].map((faq, i) => (
            <div key={i} className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-2">
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-zinc-900">{faq.q}</h4>
              </div>
              <p className="text-sm text-zinc-500 font-medium pl-7">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Support Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSupportModal(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
              <button 
                onClick={() => setShowSupportModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>

              <div className="space-y-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <Coffee className="w-8 h-8 text-emerald-600" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Support App Logistics</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                    Help us keep the servers running and the platform secure. Direct support for the app's infrastructure ensures Anyuola Hub remains free and accessible for the whole clan.
                  </p>
                </div>

                <div className="p-6 bg-zinc-900 rounded-3xl text-white space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Paybill</span>
                    <span className="font-mono font-black text-emerald-400">714777</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Account</span>
                    <span className="font-mono font-black text-emerald-400">0727774129</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 text-center uppercase font-black tracking-tighter">
                    Support Logistics
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                    This fund is strictly for technical maintenance, security audits, and domain renewals.
                  </p>
                </div>

                <button 
                  onClick={() => setShowSupportModal(false)}
                  className="w-full px-6 py-4 bg-zinc-900 text-white rounded-xl font-black text-sm text-center hover:bg-black transition-all"
                >
                  I've Supported / Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
