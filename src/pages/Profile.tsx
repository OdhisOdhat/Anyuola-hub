import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateMember, fetchMe } from "../lib/api";
import { uploadProfilePicture } from "../lib/supabase";
import { User, MapPin, Home, Users, Save, CheckCircle, Camera, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subgroup: "",
    village: "",
    father_name: "",
    residence: "",
    photo_url: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        subgroup: user.subgroup || "",
        village: user.village || "",
        father_name: user.father_name || "",
        residence: user.residence || "",
        photo_url: user.photo_url || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setSuccess(false);
    try {
      await updateMember(user.id, formData);
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const publicUrl = await uploadProfilePicture(file, user.id);
      setFormData(prev => ({ ...prev, photo_url: publicUrl }));
      // Also update immediately in DB
      await updateMember(user.id, { ...formData, photo_url: publicUrl });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Member Profile</h1>
        <p className="text-zinc-500">Keep your clan details up to date to ensure proper coordination and support.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto group">
              <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center text-brand overflow-hidden border-2 border-zinc-100">
                {formData.photo_url ? (
                  <img 
                    src={formData.photo_url} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-12 h-12" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-zinc-900 text-white rounded-full cursor-pointer hover:bg-zinc-800 transition-all shadow-lg">
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Profile Photo URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
              />
            </div>
            <div>
              <h2 className="font-bold text-xl text-zinc-900">{user.name}</h2>
              <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold">{user.role}</p>
            </div>
            <div className="pt-4 border-t border-zinc-100">
              <p className="text-xs text-zinc-400 uppercase font-bold tracking-tighter">Member ID</p>
              <p className="text-sm font-mono text-zinc-600">{user.id}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-zinc-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="h-px bg-zinc-100 my-2" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-zinc-400" /> Clan Subgroup
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jo-Kanyuola"
                    value={formData.subgroup}
                    onChange={(e) => setFormData({ ...formData, subgroup: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-zinc-400" /> Village
                  </label>
                  <input
                    type="text"
                    placeholder="Ancestral village"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                    <Home className="w-4 h-4 text-zinc-400" /> Current Residence
                  </label>
                  <input
                    type="text"
                    placeholder="City / Area"
                    value={formData.residence}
                    onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-emerald-600 font-bold text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Profile updated successfully!
                  </motion.div>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-zinc-900 text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 disabled:opacity-50"
              >
                {loading ? "Saving..." : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
