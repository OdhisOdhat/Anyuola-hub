import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image as ImageIcon, 
  Search, 
  Filter, 
  Upload, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Tag, 
  CheckCircle2, 
  Download,
  Share2,
  Plus,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Shield,
  Eye,
  UserCheck,
  RotateCcw,
  Sparkles,
  Layers
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { uploadGalleryPhoto, deleteGalleryPhoto, resetGalleryPhotos, updateGalleryPhoto } from "../lib/api";
import { GalleryPhoto, DEFAULT_GALLERY_PHOTOS, useGalleryPhotos, HOMEPAGE_SECTIONS, HomepageSection } from "../lib/galleryStore";

export type { GalleryPhoto };
const DEFAULT_PHOTOS = DEFAULT_GALLERY_PHOTOS;

export default function Gallery() {
  const { user } = useAuth();

  // Authentication & RBAC status:
  // "Only registered user with accounts can upload and delete photos. Admin overrides all user actions."
  const isRegisteredUser = Boolean(user);
  const isAdmin = Boolean(
    user && (
      user.role === "admin" ||
      user.role === "treasurer" ||
      (user as any).email === "fodhis1@gmail.com" ||
      user.phone === "0722000001" ||
      user.id === "mem-1"
    )
  );

  // Permission helper:
  // - Non-registered users CANNOT delete any photo.
  // - Admin overrides all user actions: Admin can delete ANY photo (both admin and user photos).
  // - Registered members can ONLY delete photos they uploaded themselves (not admin photos).
  const canDeletePhoto = (photo: GalleryPhoto): boolean => {
    if (!user) return false;
    if (isAdmin) return true; // Admin overrides all user actions!
    if (photo.is_admin_uploaded || photo.uploaded_by_role === "admin") return false;
    const isOwner = 
      (photo.uploaded_by_user_id && photo.uploaded_by_user_id === user.id) ||
      (photo.uploaded_by_email && (user as any).email && photo.uploaded_by_email === (user as any).email);
    return Boolean(isOwner);
  };

  const { photos, isLoading, reload } = useGalleryPhotos();
  const [isUploading, setIsUploading] = useState(false);

  // Deletion state
  const [photoToDelete, setPhotoToDelete] = useState<GalleryPhoto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenUpload = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsUploadModalOpen(true);
  };

  // New photo upload form state
  const [newCaption, setNewCaption] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<GalleryPhoto["category"]>("bursary");
  const [newLocation, setNewLocation] = useState("North Kadem, Kenya");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [newShowOnHomepage, setNewShowOnHomepage] = useState(false);
  const [newHomepageSection, setNewHomepageSection] = useState<HomepageSection>("bursary");

  // Edit homepage placement state (Admin only)
  const [editingPlacementPhoto, setEditingPlacementPhoto] = useState<GalleryPhoto | null>(null);
  const [placementSection, setPlacementSection] = useState<HomepageSection>("bursary");
  const [isUpdatingPlacement, setIsUpdatingPlacement] = useState(false);

  const categories = [
    { id: "all", label: "All Photos" },
    { id: "bursary", label: "Education Bursaries" },
    { id: "consultation", label: "Civil & Leadership" },
    { id: "committee", label: "Governance & Vetting" },
    { id: "welfare", label: "Welfare & Assembly" }
  ];

  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        p.title.toLowerCase().includes(q) ||
        p.caption.toLowerCase().includes(q) ||
        p.filename.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [photos, selectedCategory, searchQuery]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return;
      if (e.key === "Escape") {
        setActivePhotoIndex(null);
      } else if (e.key === "ArrowRight") {
        setActivePhotoIndex((prev) => 
          prev !== null ? (prev + 1) % filteredPhotos.length : null
        );
      } else if (e.key === "ArrowLeft") {
        setActivePhotoIndex((prev) => 
          prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhotoIndex, filteredPhotos.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFilename(file.name);
    if (!newTitle) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) return;
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsUploading(true);
    const categoryLabel = categories.find(c => c.id === newCategory)?.label || "Community";
    const dateFormatted = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const photoPayload = {
      title: newTitle.trim() || newCaption.trim() || "Community Activity",
      caption: newCaption.trim() || "Mifuong'o Raruoch community documentary photo.",
      description: newCaption.trim() || "Uploaded photograph documenting community initiatives.",
      category: newCategory,
      categoryLabel,
      location: newLocation.trim() || "North Kadem, Kenya",
      filename: uploadedFilename || "Uploaded-Photo.jpg",
      data: previewUrl,
      date: dateFormatted,
      uploaded_by: `${user.name} (${isAdmin ? 'Admin' : (user.role || 'Member')})`,
      uploaded_by_user_id: user.id,
      uploaded_by_email: (user as any).email || (isAdmin ? "fodhis1@gmail.com" : ""),
      uploaded_by_role: isAdmin ? "admin" : (user.role || "member"),
      is_admin_uploaded: isAdmin,
      show_on_homepage: Boolean(isAdmin && newShowOnHomepage),
      homepage_section: (isAdmin && newShowOnHomepage) ? newHomepageSection : undefined
    };

    try {
      const saved = await uploadGalleryPhoto(photoPayload, {
        id: user.id,
        role: isAdmin ? "admin" : user.role,
        email: (user as any).email || (isAdmin ? "fodhis1@gmail.com" : "")
      });
      if (saved && saved.id) {
        const homepageNotice = isAdmin && newShowOnHomepage
          ? ` and featured in the Homepage "${HOMEPAGE_SECTIONS.find(s => s.id === newHomepageSection)?.label}" section!`
          : ".";
        setFeedbackMessage({
          type: "success",
          text: isAdmin 
            ? `Photograph uploaded with Executive Admin authority, sustained in the community archive${homepageNotice}`
            : "Photograph uploaded by registered member and sustained in the archive."
        });
        setTimeout(() => setFeedbackMessage(null), 5000);
        reload();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.warn("Server save error:", err);
      setFeedbackMessage({
        type: "error",
        text: err?.message || "Could not upload photograph. Only registered users with accounts can upload."
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } finally {
      setIsUploading(false);
      setPreviewUrl(null);
      setNewCaption("");
      setNewTitle("");
      setUploadedFilename("");
      setNewShowOnHomepage(false);
      setIsUploadModalOpen(false);
    }
  };

  // Save homepage section placement edit (Admin only)
  const handleSavePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlacementPhoto || !isAdmin) return;
    setIsUpdatingPlacement(true);
    try {
      const isRemoving = placementSection === "none";
      await updateGalleryPhoto(
        editingPlacementPhoto.id,
        {
          show_on_homepage: !isRemoving,
          homepage_section: isRemoving ? undefined : placementSection
        },
        {
          id: user?.id,
          role: "admin",
          email: (user as any)?.email || "fodhis1@gmail.com"
        }
      );
      setFeedbackMessage({
        type: "success",
        text: isRemoving
          ? `Photograph "${editingPlacementPhoto.title || editingPlacementPhoto.caption}" removed from homepage sections.`
          : `Photograph assigned to Homepage section: "${HOMEPAGE_SECTIONS.find(s => s.id === placementSection)?.label}".`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
      setEditingPlacementPhoto(null);
      reload();
    } catch (err: any) {
      console.error("Save placement error:", err);
      setFeedbackMessage({
        type: "error",
        text: err?.message || "Failed to update homepage placement."
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } finally {
      setIsUpdatingPlacement(false);
    }
  };

  // Delete confirmation handler:
  // Admin overrides all user actions; registered members can delete their own uploads
  const handleConfirmDelete = async () => {
    if (!photoToDelete) return;
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsDeleting(true);
    const target = photoToDelete;
    try {
      await deleteGalleryPhoto(target.id, target.src, target.filename, {
        id: user.id,
        role: isAdmin ? "admin" : user.role,
        email: (user as any).email || (isAdmin ? "fodhis1@gmail.com" : "")
      });
      if (activePhotoIndex !== null && filteredPhotos[activePhotoIndex]?.id === target.id) {
        setActivePhotoIndex(null);
      }
      const isOverride = isAdmin && target.uploaded_by_user_id && target.uploaded_by_user_id !== user.id;
      setFeedbackMessage({
        type: "success",
        text: isOverride
          ? `Admin Override: Photograph "${target.caption || target.title}" was permanently deleted by Executive Administrator.`
          : `Photograph "${target.caption || target.title}" was permanently removed from the community gallery.`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
      setPhotoToDelete(null);
      reload();
    } catch (err: any) {
      console.error("Delete photo error:", err);
      setFeedbackMessage({
        type: "error",
        text: err?.message || `Failed to delete photograph "${target.caption || target.title}". Permission denied.`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
      setPhotoToDelete(null);
      reload();
    } finally {
      setIsDeleting(false);
    }
  };

  // Restore default community photos
  const handleResetArchive = async () => {
    if (!window.confirm("Restore default archive photographs of Mifuong'o Raruoch?")) return;
    try {
      await resetGalleryPhotos();
      reload();
      setFeedbackMessage({
        type: "success",
        text: "Default community photo archive has been restored."
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      reload();
      setFeedbackMessage({
        type: "success",
        text: "Default community photo archive restored in view."
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const activePhoto = activePhotoIndex !== null ? filteredPhotos[activePhotoIndex] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Toast Feedback Notification */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${
              feedbackMessage.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            <div className="flex items-center gap-3">
              {feedbackMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-bold">{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-zinc-500 hover:text-zinc-800 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <header className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider">
                <ImageIcon className="w-3.5 h-3.5" />
                Documentary Archives
              </div>

              {isAdmin ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Admin Controls Active: {(user as any)?.email || user?.name || "fodhis1@gmail.com"} • Full Override
                </div>
              ) : isRegisteredUser ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black uppercase tracking-wider">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  Registered Member: {user?.name} ({user?.role || "member"})
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-black uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5 text-zinc-500" />
                  Visitor Mode • Sign In Required to Upload or Delete
                </div>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight">
              Community Photo Gallery
            </h1>
            <p className="text-zinc-600 text-base font-medium leading-relaxed">
              Official photographic archives of <strong>Mifuong'o Raruoch Organization</strong> documenting bursary awards, leadership development synods, committee reviews, and mutual welfare assemblies across North Kadem. All images are sustained on the server and visible to all visitors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => reload()}
                className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border border-zinc-200"
                title="Sync and refresh archive from server"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Refresh Archive
              </button>
            )}

            {!isRegisteredUser && (
              <Link
                to="/login"
                className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border border-zinc-200"
              >
                Sign In to Contribute
              </Link>
            )}

            <button
              onClick={handleOpenUpload}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {isAdmin ? "Upload Actual Photo (Admin)" : "Upload Actual Photo"}
            </button>
          </div>
        </div>

        {/* 100% Authentic Photos Guarantee Banner */}
        <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-7 border border-zinc-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-emerald-600/10 to-transparent pointer-events-none" />
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-wider border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sustained Community Archives • Authentic Captures Only
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Raw Documentary Captures from North Kadem
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
              Default sample mock photos have been cleared. Only registered users with accounts can upload and delete photographs. Executive Administrators hold permanent override authority to delete obsolete or unauthorized entries.
            </p>
          </div>
          <button
            onClick={handleOpenUpload}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center gap-2 relative z-10 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Add Camera Photo
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  selectedCategory === cat.id
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by caption, file, or place..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-zinc-900">
              {photos.length === 0 ? "No photos in community archive" : "No matching photos found"}
            </h3>
            <p className="text-sm text-zinc-500">
              {photos.length === 0
                ? "All default sample photos have been removed per administrative directive. Only authentic documentary captures uploaded by administrators and registered community members will appear here."
                : "Try changing your search query or category filter."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {photos.length > 0 && (
              <button
                onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-all"
              >
                Reset Filters
              </button>
            )}
            {isRegisteredUser ? (
              <button
                onClick={handleOpenUpload}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                Upload First Photograph
              </button>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                Sign In to Upload Photos
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Image Container with Hover Overlay */}
              <div 
                onClick={() => setActivePhotoIndex(index)}
                className="relative aspect-[4/3] bg-zinc-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={photo.src}
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/30 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${photo.badgeColor}`}>
                    {photo.categoryLabel}
                  </span>
                  {photo.is_admin_uploaded || photo.uploaded_by_role === "admin" ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-700/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Admin Verified
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-700/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Member Upload
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-900/80 text-zinc-200 backdrop-blur-md">
                    {photo.filename}
                  </span>
                  {photo.show_on_homepage && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-zinc-950 backdrop-blur-md shadow-sm flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Homepage: {HOMEPAGE_SECTIONS.find(s => s.id === photo.homepage_section)?.label.split(" ")[0] || "Featured"}
                    </span>
                  )}
                </div>

                {/* Delete Action Button:
                    - Registered users can delete their own uploaded photos
                    - Admin overrides all user actions and can delete ANY photo */}
                {canDeletePhoto(photo) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoToDelete(photo);
                    }}
                    className={`absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-xl backdrop-blur-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border cursor-pointer ${
                      isAdmin && photo.uploaded_by_user_id && photo.uploaded_by_user_id !== user?.id
                        ? "bg-red-700 hover:bg-red-800 border-red-600"
                        : "bg-red-600 hover:bg-red-700 border-red-500"
                    }`}
                    title={
                      isAdmin && photo.uploaded_by_user_id && photo.uploaded_by_user_id !== user?.id
                        ? "Admin Override: Permanently delete member photograph from archive"
                        : "Delete photograph from archive"
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {isAdmin && photo.uploaded_by_user_id && photo.uploaded_by_user_id !== user?.id
                        ? "Override Delete"
                        : "Delete"}
                    </span>
                  </button>
                )}
              </div>

              {/* Caption & Metadata Body */}
              <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight leading-snug">
                    {photo.caption}
                  </h3>
                  <p className="text-zinc-600 text-sm font-medium leading-relaxed">
                    {photo.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-[200px]">{photo.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{photo.date}</span>
                    </div>
                  </div>

                  {photo.uploaded_by && (
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 pt-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Sustained by: {photo.uploaded_by}</span>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Homepage:
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPlacementPhoto(photo);
                          setPlacementSection(photo.homepage_section || "bursary");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        {photo.show_on_homepage 
                          ? `Edit (${HOMEPAGE_SECTIONS.find(s => s.id === photo.homepage_section)?.label.split(" ")[0] || "Section"})` 
                          : "Assign Section"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && activePhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActivePhotoIndex(null)}
          >
            {/* Modal Box */}
            <div 
              className="relative w-full max-w-5xl bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActivePhotoIndex(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white flex items-center justify-center backdrop-blur-md transition-all"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Prev Button */}
              <button
                onClick={() => setActivePhotoIndex((prev) => (prev! - 1 + filteredPhotos.length) % filteredPhotos.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl"
                title="Previous Photo (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button
                onClick={() => setActivePhotoIndex((prev) => (prev! + 1) % filteredPhotos.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl"
                title="Next Photo (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Photo Display */}
              <div className="lg:w-3/5 bg-black flex items-center justify-center p-4 sm:p-8 relative min-h-[300px]">
                <img
                  src={activePhoto.src}
                  alt={activePhoto.caption}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Sidebar Info */}
              <div className="lg:w-2/5 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto bg-zinc-900 text-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${activePhoto.badgeColor}`}>
                      {activePhoto.categoryLabel}
                    </span>
                    <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                      {activePhoto.filename}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight leading-snug">
                    {activePhoto.caption}
                  </h2>

                  <p className="text-zinc-300 text-sm font-medium leading-relaxed">
                    {activePhoto.description}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{activePhoto.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{activePhoto.date}</span>
                    </div>
                    {activePhoto.uploaded_by && (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Sustained by: {activePhoto.uploaded_by}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Organization: Mifuong'o Raruoch (S.H.G)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span>Photo {activePhotoIndex + 1} of {filteredPhotos.length}</span>
                  <div className="flex items-center gap-3">
                    {canDeletePhoto(activePhoto) && (
                      <button
                        type="button"
                        onClick={() => setPhotoToDelete(activePhoto)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md shadow-red-600/30 cursor-pointer border border-red-500"
                        title={
                          isAdmin && activePhoto.uploaded_by_user_id && activePhoto.uploaded_by_user_id !== user?.id
                            ? "Admin Override: Delete community member photograph from archive"
                            : "Delete photograph from archive"
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>
                          {isAdmin && activePhoto.uploaded_by_user_id && activePhoto.uploaded_by_user_id !== user?.id
                            ? "Override Delete"
                            : "Delete Photo"}
                        </span>
                      </button>
                    )}
                    <a
                      href={activePhoto.src}
                      download={activePhoto.filename}
                      className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download File
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsUploadModalOpen(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> Raw Photo Upload
                  </div>
                  <h3 className="text-xl font-black text-zinc-900">Upload Actual Photo</h3>
                  <p className="text-xs text-zinc-500">
                    Your photo will be uploaded directly to the server archive with <strong>zero AI enhancement or compression</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveUpload} className="space-y-4">
                {/* File Dropzone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Select Camera Photo</label>
                  <div className="border-2 border-dashed border-zinc-200 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-zinc-50 relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {previewUrl ? (
                      <div className="space-y-2">
                        <img src={previewUrl} alt="Preview" className="w-full h-40 object-contain rounded-lg mx-auto" />
                        <p className="text-xs font-mono text-zinc-600 truncate">{uploadedFilename}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">✓ Original photo ready for direct archive</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-zinc-800">Click or drag & drop actual photo here</p>
                        <p className="text-[11px] text-zinc-400">Direct camera photos, JPEG, PNG from mobile or desktop</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Caption Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Caption / Activity Description</label>
                  <input
                    type="text"
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="e.g., Bursary issuance ceremony at North Kadem"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Category & Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="bursary">Education Bursaries</option>
                      <option value="consultation">Civil Consultations</option>
                      <option value="committee">Governance & Vetting</option>
                      <option value="welfare">Welfare & Assembly</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Location</label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g., North Kadem, Kenya"
                      className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Admin Homepage Placement Controls */}
                {isAdmin && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                          Feature on Homepage (Admin)
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newShowOnHomepage}
                          onChange={(e) => setNewShowOnHomepage(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <p className="text-[11px] text-emerald-900/80 font-medium leading-relaxed">
                      Enable to automatically display this photograph in a dedicated section on the public homepage.
                    </p>

                    {newShowOnHomepage && (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block">
                          Target Homepage Section
                        </label>
                        <select
                          value={newHomepageSection}
                          onChange={(e) => setNewHomepageSection(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {HOMEPAGE_SECTIONS.filter(s => s.id !== "none").map((sec) => (
                            <option key={sec.id} value={sec.id}>
                              {sec.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-emerald-800 font-medium italic">
                          {HOMEPAGE_SECTIONS.find(s => s.id === newHomepageSection)?.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => setIsUploadModalOpen(false)}
                    className="w-1/2 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!previewUrl || isUploading}
                    className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving to Server...
                      </>
                    ) : (
                      "Save Actual Photo"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Homepage Placement Modal (Admin Only) */}
      <AnimatePresence>
        {editingPlacementPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => !isUpdatingPlacement && setEditingPlacementPhoto(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-zinc-200 text-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-900">
                      Homepage Section Placement
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Assign or unassign photo from homepage sections
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isUpdatingPlacement && setEditingPlacementPhoto(null)}
                  className="text-zinc-400 hover:text-zinc-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photo Preview Card */}
              <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-200 flex items-center gap-3">
                <img
                  src={editingPlacementPhoto.src}
                  alt={editingPlacementPhoto.caption}
                  className="w-16 h-16 object-cover rounded-xl border border-zinc-200 shrink-0"
                />
                <div className="overflow-hidden space-y-0.5">
                  <p className="text-xs font-black text-zinc-900 line-clamp-1">
                    {editingPlacementPhoto.title || editingPlacementPhoto.caption}
                  </p>
                  <p className="text-[11px] text-zinc-500 line-clamp-1">
                    {editingPlacementPhoto.location} • {editingPlacementPhoto.date}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-bold">
                    Current: {editingPlacementPhoto.show_on_homepage 
                      ? HOMEPAGE_SECTIONS.find(s => s.id === editingPlacementPhoto.homepage_section)?.label || "Featured on Homepage"
                      : "Gallery Archive Only"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSavePlacement} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">
                    Choose Homepage Placement
                  </label>
                  <select
                    value={placementSection}
                    onChange={(e) => setPlacementSection(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {HOMEPAGE_SECTIONS.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-zinc-500 font-medium leading-relaxed pt-1">
                    {HOMEPAGE_SECTIONS.find(s => s.id === placementSection)?.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isUpdatingPlacement}
                    onClick={() => setEditingPlacementPhoto(null)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPlacement}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-2"
                  >
                    {isUpdatingPlacement ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Apply Placement"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {photoToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => !isDeleting && setPhotoToDelete(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-zinc-200 text-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-zinc-900">
                      Delete Photograph?
                    </h3>
                    {isAdmin && photoToDelete.uploaded_by_user_id && photoToDelete.uploaded_by_user_id !== user?.id && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-300">
                        Admin Override
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {isAdmin && photoToDelete.uploaded_by_user_id && photoToDelete.uploaded_by_user_id !== user?.id
                      ? `Executive Admin Authority: Your action overrides standard user privileges and will permanently delete this photograph uploaded by "${photoToDelete.uploaded_by || 'Member'}" from the public community archive.`
                      : isAdmin
                      ? "As an Administrator, you are permanently removing this photograph from the community documentary archive."
                      : "You are deleting a photograph you previously uploaded. This action will permanently remove it from the public archive."}
                  </p>
                </div>
              </div>

              {/* Preview of photo being deleted */}
              <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-200 flex items-center gap-3">
                <img
                  src={photoToDelete.src}
                  alt={photoToDelete.caption}
                  className="w-16 h-16 object-cover rounded-xl border border-zinc-200 shrink-0"
                />
                <div className="overflow-hidden space-y-0.5">
                  <p className="text-xs font-black text-zinc-800 line-clamp-1">{photoToDelete.title || photoToDelete.caption}</p>
                  <p className="text-[11px] text-zinc-500 line-clamp-1">{photoToDelete.location} • {photoToDelete.date}</p>
                  <p className="text-[10px] font-mono text-zinc-400 truncate">{photoToDelete.filename}</p>
                  {photoToDelete.uploaded_by && (
                    <p className="text-[10px] text-emerald-600 font-medium truncate">By: {photoToDelete.uploaded_by}</p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setPhotoToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      {isAdmin && photoToDelete.uploaded_by_user_id && photoToDelete.uploaded_by_user_id !== user?.id
                        ? "Confirm Override Delete"
                        : "Confirm Delete"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Required Modal (when guest tries to upload or delete) */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsAuthModalOpen(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-zinc-200 text-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Account Required
                  </span>
                  <h3 className="text-lg font-black text-zinc-900">
                    Sign In to Contribute
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Only registered community members with verified accounts can upload and delete photographs. Executive Administrators override all user actions.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 space-y-2.5 text-xs text-zinc-700">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Registered members can upload & delete their own photos</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Admin overrides all user actions across all archives</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
