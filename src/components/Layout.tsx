import React from "react";
import Navbar from "./Navbar";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
      <footer className="border-t border-zinc-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-zinc-500 text-sm text-center md:text-left">
              <p className="font-semibold text-zinc-700">Mifuong'o Raruoch Organization • North Kadem, Nyatike</p>
              <p className="text-xs text-zinc-500 mt-0.5">© 2026 MIFUONG'O RARUOCH ORGANIZATION (S.H.G). Mutual aid, education bursaries & community empowerment.</p>
              <p className="mt-1 text-xs">
                developed by{" "}
                <a 
                  href="https://odhistechie.web.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand font-bold hover:underline"
                >
                  odhistechie.web.app
                </a>
                <span className="mx-2 text-zinc-300">•</span>
                <span>Mifuong'o Raruoch Organization Network: </span>
                <a 
                  href="https://anyuola-hub.vercel.app/" 
                  target="_blank" 
                  rel="noopener"
                  className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                  title="Anyuola Hub (https://anyuola-hub.vercel.app/) — Mifuong'o Raruoch Organization"
                >
                  Anyuola Hub
                </a>
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
              <Link to="/" className="text-sm font-bold text-zinc-500 hover:text-brand transition-colors">About Us</Link>
              <Link to="/security" className="text-sm font-bold text-zinc-500 hover:text-brand transition-colors">Security</Link>
              <Link to="/welfare" className="text-sm font-bold text-zinc-500 hover:text-brand transition-colors">Welfare</Link>
              <Link to="/projects" className="text-sm font-bold text-zinc-500 hover:text-brand transition-colors">Projects</Link>
              <a 
                href="https://anyuola-hub.vercel.app/" 
                target="_blank" 
                rel="noopener"
                className="text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
              >
                Anyuola Hub &nearr;
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
