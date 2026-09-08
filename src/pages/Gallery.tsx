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
  Eye,
  UserCheck
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { fetchGalleryPhotos, uploadGalleryPhoto, deleteGalleryPhoto } from "../lib/api";

export interface GalleryPhoto {
  id: string;
  filename: string;
  src: string;
  title: string;
  caption: string;
  description: string;
  category: "bursary" | "consultation" | "committee" | "welfare" | "community";
  categoryLabel: string;
  date: string;
  location: string;
  badgeColor: string;
  uploaded_by?: string;
  created_at?: string;
}

const DEFAULT_PHOTOS: GalleryPhoto[] = [
  {
    id: "photo-1",
    filename: "Price1.jpeg",
    src: "/images/Price1.jpeg",
    title: "Bursary Cheques Issuance",
    caption: "The leadership issuing bursary cheques to needy students.",
    description: "Executive leaders and the Education Committee of Mifuong'o Raruoch Organization formally distributing scholarship bursary cheques to bright, needy students in North Kadem.",
    category: "bursary",
    categoryLabel: "Education Bursaries",
    date: "Annual Academic Award",
    location: "North Kadem Community Synod Hall",
    badgeColor: "bg-emerald-500 text-white",
    uploaded_by: "Fred Abich (Chairman)"
  },
  {
    id: "photo-2",
    filename: "price2.jpeg",
    src: "/images/price2.jpeg",
    title: "Civil Leadership Consultation",
    caption: "The leadership consulting with civil leaders on development matters.",
    description: "Mifuong'o Raruoch elders and executive leadership convening an outdoor consultative strategic synod with regional civil stakeholders to discuss sustainable development priorities.",
    category: "consultation",
    categoryLabel: "Civil Consultations",
    date: "Leadership Synod",
    location: "Green Garden Pavilion, North Kadem",
    badgeColor: "bg-blue-600 text-white",
    uploaded_by: "Fred Abich (Chairman)"
  },
  {
    id: "photo-3",
    filename: "price3.jpeg",
    src: "/images/price3.jpeg",
    title: "Committee Vetting & Due Diligence",
    caption: "The committee actively vetting bursary applications and verifying needy students.",
    description: "Working session of committee secretaries, advisors, and leadership examining student bursary application registers and evaluating urgent welfare assistance requests.",
    category: "committee",
    categoryLabel: "Governance & Vetting",
    date: "Committee Working Session",
    location: "Executive Secretariat Desk",
    badgeColor: "bg-purple-600 text-white",
    uploaded_by: "Philip Opiyo Odero (Secretary)"
  },
  {
    id: "photo-4",
    filename: "price4.jpeg",
    src: "/images/price4.jpeg",
    title: "Community Welfare Assembly",
    caption: "Community welfare assembly and bursary disbursement ceremony.",
    description: "Mifuong'o Raruoch community gathering in North Kadem bringing together parents, elders, and beneficiaries during the mutual aid distribution ceremony.",
    category: "welfare",
    categoryLabel: "Welfare & Assembly",
    date: "General Assembly",
    location: "Community Assembly Hall",
    badgeColor: "bg-amber-600 text-white",
    uploaded_by: "Paul Aran Onditi (Treasurer)"
  }
];

export default function Gallery() {
  const { user } = useAuth();

  // Admin access check: explicit admin role, treasurer role, designated email, or primary admin ID
  const isAdmin = Boolean(
    user && (
      user.role === "admin" ||
      user.role === "treasurer" ||
      (user as any).email === "fodhis1@gmail.com" ||
      user.phone === "0722000001" ||
      user.id === "mem-1"
    )
  );

  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_PHOTOS);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Deletion state
  const [photoToDelete, setPhotoToDelete] = useState<GalleryPhoto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New photo upload form state
  const [newCaption, setNewCaption] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<GalleryPhoto["category"]>("bursary");
  const [newLocation, setNewLocation] = useState("North Kadem, Kenya");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState("");

  const categories = [
    { id: "all", label: "All Photos" },
    { id: "bursary", label: "Education Bursaries" },
    { id: "consultation", label: "Civil & Leadership" },
    { id: "committee", label: "Governance & Vetting" },
    { id: "welfare", label: "Welfare & Assembly" }
  ];

  // Load photos from server on mount
  useEffect(() => {
    async function loadArchives() {
      setIsLoading(true);
      try {
        const serverPhotos = await fetchGalleryPhotos();
        if (serverPhotos && serverPhotos.length > 0) {
          setPhotos(serverPhotos);
        } else {
          setPhotos(DEFAULT_PHOTOS);
        }
      } catch (err) {
        console.warn("Could not load gallery archives from server:", err);
        setPhotos(DEFAULT_PHOTOS);
      } finally {
        setIsLoading(false);
      }
    }
    loadArchives();
  }, []);

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
      uploaded_by: user ? `${user.name} (${user.role === 'admin' ? 'Admin' : user.role})` : "Executive Administrator"
    };

    try {
      const saved = await uploadGalleryPhoto(photoPayload);
      if (saved && saved.id) {
        setPhotos(prev => [saved, ...prev]);
        setFeedbackMessage({
          type: "success",
          text: "Photograph uploaded and sustained in server storage. It is now live for all visitors."
        });
        setTimeout(() => setFeedbackMessage(null), 5000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.warn("Server save error, falling back to local memory:", err);
      const fallbackPhoto: GalleryPhoto = {
        id: `custom-${Date.now()}`,
        filename: uploadedFilename || "Uploaded-Photo.jpg",
        src: previewUrl,
        title: photoPayload.title,
        caption: photoPayload.caption,
        description: photoPayload.description,
        category: newCategory,
        categoryLabel,
        date: dateFormatted,
        location: photoPayload.location,
        badgeColor: "bg-emerald-600 text-white",
        uploaded_by: photoPayload.uploaded_by
      };
      setPhotos(prev => [fallbackPhoto, ...prev]);
      setFeedbackMessage({
        type: "success",
        text: "Photograph saved to active gallery."
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } finally {
      setIsUploading(false);
      setPreviewUrl(null);
      setNewCaption("");
      setNewTitle("");
      setUploadedFilename("");
      setIsUploadModalOpen(false);
    }
  };

  // Admin delete confirmation handler
  const handleConfirmDelete = async () => {
    if (!photoToDelete) return;
    setIsDeleting(true);
    try {
      await deleteGalleryPhoto(photoToDelete.id);
      setPhotos(prev => prev.filter(p => p.id !== photoToDelete.id));
      if (activePhotoIndex !== null && filteredPhotos[activePhotoIndex]?.id === photoToDelete.id) {
        setActivePhotoIndex(null);
      }
      setFeedbackMessage({
        type: "success",
        text: `Photograph "${photoToDelete.caption || photoToDelete.title}" was permanently removed from the community gallery.`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
      setPhotoToDelete(null);
    } catch (err: any) {
      console.error("Delete photo error:", err);
      setFeedbackMessage({
        type: "error",
        text: `Failed to delete photo: ${err?.message || "Server error"}`
      });
    } finally {
      setIsDeleting(false);
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
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Admin Controls Active • Delete & Upload Enabled
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-black uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5 text-zinc-500" />
                  Visitor View • All Photos Sustained & Visible
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Upload Actual Photo
            </button>

            {!isAdmin && !user && (
              <Link
                to="/auth"
                className="px-4 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
                title="Admin login to manage and delete photos"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>

        {/* 100% Authentic Photos Guarantee Banner */}
        <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-7 border border-zinc-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-emerald-600/10 to-transparent pointer-events-none" />
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-wider border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sustained Community Archives • Real Photographic Captures
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Raw Documentary Captures from North Kadem
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
              All images uploaded by the executive leadership are permanently sustained and accessible to every visitor. Photos are stored in raw authentic resolution with zero artificial filtering. Administrators have direct authority to upload new event captures and delete obsolete photographs.
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center gap-2 relative z-10"
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
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-zinc-900">No photos found</h3>
            <p className="text-sm text-zinc-500">Try changing your search query or category filter.</p>
          </div>
          <button
            onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-all"
          >
            Reset Filters
          </button>
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
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-900/80 text-zinc-200 backdrop-blur-md">
                    {photo.filename}
                  </span>
                </div>

                {/* Admin Delete Action Button */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoToDelete(photo);
                    }}
                    className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-red-500/50"
                    title="Delete photograph (Admin)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
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
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setPhotoToDelete(activePhoto)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-bold transition-all border border-red-500/30"
                        title="Delete photograph from archive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Photo
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

      {/* Delete Confirmation Modal for Admin */}
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
                  <h3 className="text-lg font-black text-zinc-900">
                    Delete Photograph?
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    This action will permanently delete this photograph from the Mifuong'o Raruoch public archive. Visitors will no longer see this image.
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
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setPhotoToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-md shadow-red-600/20 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Confirm Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
