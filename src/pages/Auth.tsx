import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, Loader2, Gift } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    // Check if we are in a password reset flow
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setIsResettingPassword(true);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && session && !isResettingPassword) {
      navigate('/dashboard');
    }
  }, [session, authLoading, navigate, isResettingPassword]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isResettingPassword) {
        const { error } = await supabase.auth.updateUser({
          password: formData.password
        });
        if (error) throw error;
        setSuccess(true);
        setTimeout(() => {
          setIsResettingPassword(false);
          setSuccess(false);
          navigate('/auth');
        }, 3000);
      } else if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: window.location.origin + '/auth',
        });
        if (error) throw error;
        setSuccess(true);
      } else if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: window.location.origin + '/auth',
            data: {
              full_name: formData.fullName,
            }
          }
        });
        if (error) throw error;

        // Create initial profile in members table
        if (data.user) {
          const { error: profileError } = await supabase
            .from('members')
            .insert([{
              id: data.user.id,
              name: formData.fullName,
              role: 'member',
              clan_id: 'clan-1' // Default clan
            }]);
          
          if (profileError) {
            console.error("Error creating profile:", profileError);
          }
        }

        setSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-600/20 mb-4">
            <Users className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">CommunityHub</h1>
          <p className="text-zinc-500 font-medium mt-2">Digitizing trust networks.</p>
        </div>

        <motion.div 
          layout
          className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-2xl shadow-zinc-200/50 p-8 md:p-10"
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-4"
              >
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-zinc-900">
                    {isResettingPassword ? 'Password Updated' : isForgotPassword ? 'Check your email' : 'Check your email'}
                  </h2>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                    {isResettingPassword 
                      ? 'Your password has been successfully reset. You can now sign in with your new password.'
                      : `We've sent a ${isForgotPassword ? 'password reset' : 'confirmation'} link to `
                    }
                    {!isResettingPassword && <span className="text-zinc-900 font-bold">{formData.email}</span>}
                  </p>
                </div>
                {!isResettingPassword && (
                  <button 
                    onClick={() => {
                      setSuccess(false);
                      setIsForgotPassword(false);
                    }}
                    className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
                  >
                    Back to Sign In
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={isResettingPassword ? 'reset' : isForgotPassword ? 'forgot' : isSignUp ? 'signup' : 'signin'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-black text-zinc-900 mb-6">
                  {isResettingPassword ? 'Reset Password' : isForgotPassword ? 'Forgot Password' : isSignUp ? 'Create an account' : 'Welcome back'}
                </h2>

                <form onSubmit={handleAuth} className="space-y-5">
                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {error}
                    </div>
                  )}

                  {isSignUp && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <input 
                          type="text" 
                          required
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {!isResettingPassword && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <input 
                          type="email" 
                          required
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {(isSignUp || !isForgotPassword || isResettingPassword) && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                        {isResettingPassword ? 'New Password' : 'Password'}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <input 
                          type="password" 
                          required
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {!isSignUp && !isForgotPassword && !isResettingPassword && (
                    <div className="flex justify-end">
                      <button 
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button 
                    disabled={loading}
                    className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        {isResettingPassword ? 'Update Password' : isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Sign In'}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-zinc-100 text-center space-y-4">
                  <p className="text-zinc-500 font-medium">
                    {isForgotPassword || isResettingPassword 
                      ? 'Remember your password?' 
                      : isSignUp ? 'Already have an account?' : "Don't have an account?"
                    }{' '}
                    <button 
                      onClick={() => {
                        setIsSignUp(!isSignUp && !isForgotPassword && !isResettingPassword);
                        setIsForgotPassword(false);
                        setIsResettingPassword(false);
                      }}
                      className="text-emerald-600 font-black hover:text-emerald-700 transition-colors"
                    >
                      {isForgotPassword || isResettingPassword || isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>

                  {!isResettingPassword && (
                    <div className="pt-2">
                      <button 
                        onClick={() => navigate('/contribute?guest=true')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
                      >
                        <Gift className="w-4 h-4" />
                        Donate as Guest
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
