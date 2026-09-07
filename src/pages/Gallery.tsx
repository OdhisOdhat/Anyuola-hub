import React, { useState, useEffect, useMemo } from "react";
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
  Plus
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

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
    badgeColor: "bg-emerald-500 text-white"
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
    badgeColor: "bg-blue-600 text-white"
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
    badgeColor: "bg-purple-600 text-white"
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
    badgeColor: "bg-amber-600 text-white"
  }
];

export default function Gallery() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => {
    try {
      const saved = localStorage.getItem("mifuongo_gallery_custom_photos");
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...DEFAULT_PHOTOS, ...parsed];
      }
    } catch (e) {
      console.error("Failed to load local gallery photos", e);
    }
    return DEFAULT_PHOTOS;
  });

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

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) return;

    const newPhoto: GalleryPhoto = {
      id: `custom-${Date.now()}`,
      filename: uploadedFilename || "Uploaded-Photo.jpg",
      src: previewUrl,
      title: newTitle.trim() || "Community Activity",
      caption: newCaption.trim() || "Mifuong'o Raruoch community documentary photo.",
      description: newCaption.trim() || "Uploaded photograph documenting community initiatives.",
      category: newCategory,
      categoryLabel: categories.find(c => c.id === newCategory)?.label || "Community",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      location: newLocation.trim() || "North Kadem, Kenya",
      badgeColor: "bg-emerald-600 text-white"
    };

    const updated = [newPhoto, ...photos];
    setPhotos(updated);

    try {
      const customOnes = updated.filter(p => p.id.startsWith("custom-"));
      localStorage.setItem("mifuongo_gallery_custom_photos", JSON.stringify(customOnes));
    } catch (err) {
      console.warn("Storage quota exceeded or storage unavailable", err);
    }

    // Reset
    setPreviewUrl(null);
    setNewCaption("");
    setNewTitle("");
    setUploadedFilename("");
    setIsUploadModalOpen(false);
  };

  const activePhoto = activePhotoIndex !== null ? filteredPhotos[activePhotoIndex] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Section */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider">
              <ImageIcon className="w-3.5 h-3.5" />
              Documentary Archives
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight">
              Community Photo Gallery
            </h1>
            <p className="text-zinc-600 text-base font-medium leading-relaxed">
              Official photographic archives of <strong>Mifuong'o Raruoch Organization</strong> documenting bursary awards, leadership development synods, committee reviews, and mutual welfare assemblies across North Kadem.
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Photo
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
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${photo.badgeColor}`}>
                    {photo.categoryLabel}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-900/80 text-zinc-200 backdrop-blur-md">
                    {photo.filename}
                  </span>
                </div>
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

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[200px]">{photo.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{photo.date}</span>
                  </div>
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
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Organization: Mifuong'o Raruoch (S.H.G)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <span>Photo {activePhotoIndex + 1} of {filteredPhotos.length}</span>
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
                  <h3 className="text-xl font-black text-zinc-900">Upload Gallery Photo</h3>
                  <p className="text-xs text-zinc-500">Add local photos directly to the Mifuong'o Raruoch archive.</p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveUpload} className="space-y-4">
                {/* File Dropzone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Select Photo</label>
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
                        <img src={previewUrl} alt="Preview" className="w-full h-36 object-contain rounded-lg mx-auto" />
                        <p className="text-xs font-mono text-zinc-600 truncate">{uploadedFilename}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-zinc-800">Click or drag & drop photo here</p>
                        <p className="text-[11px] text-zinc-400">Supports JPEG, PNG, WebP from your device</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Caption Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Exact Caption</label>
                  <input
                    type="text"
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="e.g., The leadership issuing bursary cheques to needy students."
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
                    onClick={() => setIsUploadModalOpen(false)}
                    className="w-1/2 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!previewUrl}
                    className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/20"
                  >
                    Save to Gallery
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
