import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  FileText, 
  Image as ImageIcon, 
  Layout, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Eye, 
  ExternalLink,
  ChevronRight,
  Search
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { 
  fetchPages, 
  createPage, 
  updatePage, 
  fetchBlogs, 
  createBlog, 
  updateBlog, 
  fetchAds, 
  createAd, 
  updateAd 
} from "../lib/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = "pages" | "blogs" | "ads";

export default function AdminCMS() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("pages");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const BLOG_CATEGORIES = ["General", "News", "Events", "Welfare", "Security", "Projects"];

  useEffect(() => {
    if (user?.clan_id) {
      loadItems();
    }
  }, [activeTab, user?.clan_id]);

  const loadItems = async () => {
    if (!user?.clan_id) return;
    setLoading(true);
    try {
      let data: any = [];
      if (activeTab === "pages") data = await fetchPages(user.clan_id);
      else if (activeTab === "blogs") data = await fetchBlogs(user.clan_id);
      else if (activeTab === "ads") data = await fetchAds(user.clan_id);
      
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        console.error("API did not return an array:", data);
        setItems([]);
      }
    } catch (error) {
      console.error("Error loading items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentItem.id) {
        if (activeTab === "pages") await updatePage(currentItem.id, currentItem);
        else if (activeTab === "blogs") await updateBlog(currentItem.id, currentItem);
        else if (activeTab === "ads") await updateAd(currentItem.id, currentItem);
      } else {
        const payload = { ...currentItem, clan_id: user?.clan_id };
        if (activeTab === "pages") await createPage(payload);
        else if (activeTab === "blogs") await createBlog(payload);
        else if (activeTab === "ads") await createAd(payload);
      }
      setIsEditing(false);
      setCurrentItem(null);
      loadItems();
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const filteredItems = Array.isArray(items) ? items.filter(item => {
    const matchesSearch = (item.title || item.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === "blogs" 
      ? (selectedCategory === "All" || item.category === selectedCategory)
      : true;
    return matchesSearch && matchesCategory;
  }) : [];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You must be an administrator to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage your clan's pages, blogs, and advertisements.</p>
        </div>
        <button
          onClick={() => {
            setCurrentItem(activeTab === "pages" ? { title: "", slug: "", content: "", is_published: false } :
                         activeTab === "blogs" ? { title: "", content: "", image_url: "", category: "General", is_published: false } :
                         { title: "", image_url: "", link_url: "", is_active: true });
            setIsEditing(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors shadow-brand"
        >
          <Plus className="w-5 h-5" />
          <span>Create New {activeTab.slice(0, -1)}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-8 w-fit">
        {[
          { id: "pages", icon: Layout, label: "Pages" },
          { id: "blogs", icon: FileText, label: "Blogs" },
          { id: "ads", icon: ImageIcon, label: "Ads" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg transition-all",
              activeTab === tab.id
                ? "bg-white text-brand shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search and List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-bottom border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
            />
          </div>
          {activeTab === "blogs" && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
            >
              <option value="All">All Categories</option>
              {BLOG_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading {activeTab}...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No {activeTab} found</h3>
              <p className="text-gray-500">Try adjusting your search or create a new one.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    activeTab === "pages" ? "bg-blue-100 text-blue-600" :
                    activeTab === "blogs" ? "bg-purple-100 text-purple-600" :
                    "bg-orange-100 text-orange-600"
                  )}>
                    {activeTab === "pages" ? <Layout className="w-5 h-5" /> :
                     activeTab === "blogs" ? <FileText className="w-5 h-5" /> :
                     <ImageIcon className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {activeTab === "pages" ? `/${item.slug}` :
                       activeTab === "blogs" ? `${item.category || "General"} • By ${item.author?.name || "Admin"}` :
                       item.link_url}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    (item.is_published || item.is_active) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  )}>
                    {(item.is_published || item.is_active) ? "Active" : "Draft"}
                  </div>
                  <button
                    onClick={() => {
                      setCurrentItem(item);
                      setIsEditing(true);
                    }}
                    className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {currentItem?.id ? "Edit" : "Create"} {activeTab.slice(0, -1)}
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    required
                    value={currentItem?.title || ""}
                    onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                  />
                </div>

                {activeTab === "pages" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Slug</label>
                    <input
                      type="text"
                      required
                      value={currentItem?.slug || ""}
                      onChange={(e) => setCurrentItem({ ...currentItem, slug: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                      placeholder="e.g. about-us"
                    />
                  </div>
                )}

                {activeTab === "blogs" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={currentItem?.category || "General"}
                      onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                    >
                      {BLOG_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(activeTab === "blogs" || activeTab === "ads") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      type="url"
                      value={currentItem?.image_url || ""}
                      onChange={(e) => setCurrentItem({ ...currentItem, image_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                )}

                {activeTab === "ads" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Link URL</label>
                    <input
                      type="url"
                      value={currentItem?.link_url || ""}
                      onChange={(e) => setCurrentItem({ ...currentItem, link_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                    />
                  </div>
                )}

                {(activeTab === "pages" || activeTab === "blogs") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Content</label>
                    <textarea
                      rows={8}
                      required
                      value={currentItem?.content || ""}
                      onChange={(e) => setCurrentItem({ ...currentItem, content: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={activeTab === "ads" ? currentItem?.is_active : currentItem?.is_published}
                    onChange={(e) => setCurrentItem({ 
                      ...currentItem, 
                      [activeTab === "ads" ? "is_active" : "is_published"]: e.target.checked 
                    })}
                    className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
                  />
                  <label htmlFor="is_published" className="text-sm text-gray-700">
                    {activeTab === "ads" ? "Active" : "Published"}
                  </label>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-brand text-white rounded-xl hover:bg-brand/90 transition-colors shadow-brand"
                  >
                    Save Changes
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
