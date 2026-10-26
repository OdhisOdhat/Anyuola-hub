import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  MapPin, 
  Users, 
  School, 
  CheckCircle2, 
  Clock, 
  Search, 
  FileText, 
  ChevronRight, 
  ArrowLeft, 
  AlertCircle, 
  Download, 
  Printer, 
  Sparkles, 
  Filter, 
  Eye, 
  Check, 
  DollarSign, 
  HeartHandshake,
  ShieldCheck,
  Building2,
  Calendar,
  Phone,
  Mail,
  User,
  Info,
  BadgeAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { 
  fetchBursaries, 
  submitBursaryApplication, 
  trackBursaryApplication, 
  updateBursaryApplication, 
  BursaryApplication 
} from "../lib/api";

const CLAN_LINEAGES = [
  "Joka Ogiro Magota (Jokabwai, Joka Owuonda Kuba, Joka Omach Maraki, Joka Ngeta Ondego, Joka Otieno Suta)",
  "Joka Tagaya Obware",
  "Joka Moth (Moth Ondigo)",
  "Joka Nyakara (Odina, Anyuor, Mimbi, Nyojero Migogo)",
  "Kamang'ira (Lineage of Anyuor Mang'ira • Complex Unifier)",
  "Joka Obwanga",
  "Joka Ong'ele Osodhi",
  "Joka Saronge",
  "Joka Ogalo",
  "Joka Nyabende",
  "Joka Mifuong'o (Sons of Mifuong'o Raruoch)",
  "Other North Kadem Ancestral Branch"
];

const RESIDENCE_REGIONS = [
  "Upper Kamifuong'o",
  "Lower Kamifuong'o",
  "Diaspora",
  "Other North Kadem"
];

const SUBCHAIR_REFERENCES = [
  "David Ochieng Ogutu (Sub-chair Upper Kamifuong'o)",
  "Martin Duro (Sub-chair Lower Kamifuong'o)",
  "Zebedy Ngeta (Diaspora Chairman)",
  "Chief Philip Opolo Orwa (Technical Advisor)",
  "Fred Abich (Chairman)",
  "Local Village / Clan Elder"
];

export default function EducationFunding() {
  const { user, hasPermission } = useAuth();
  const isAdminOrCommittee = user?.role === "admin" || user?.role === "subgroup_manager" || user?.role === "treasurer";

  const [activeTab, setActiveTab] = useState<"apply" | "track" | "committee">("apply");
  const [formStep, setFormStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<BursaryApplication | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Tracking State
  const [trackQuery, setTrackQuery] = useState("");
  const [trackingResults, setTrackingResults] = useState<BursaryApplication[]>([]);
  const [hasTracked, setHasTracked] = useState(false);
  const [isTrackLoading, setIsTrackLoading] = useState(false);

  // Committee Review State
  const [applications, setApplications] = useState<BursaryApplication[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [selectedApp, setSelectedApp] = useState<BursaryApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lineageFilter, setLineageFilter] = useState<string>("all");
  const [residenceFilter, setResidenceFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<BursaryApplication["status"]>("under_review");
  const [reviewNotes, setReviewNotes] = useState("");
  const [disbursedAmountInput, setDisbursedAmountInput] = useState<number>(0);

  // Form State
  const [formData, setFormData] = useState({
    // 1. Personal
    student_name: user?.name || "",
    gender: "Male" as "Male" | "Female" | "Other",
    dob: "2006-03-15",
    phone: user?.phone || "",
    email: user?.email || "",
    id_or_birth_cert_no: "",

    // 2. Residence (Crucial)
    residence_region: "Upper Kamifuong'o" as BursaryApplication["residence_region"],
    county: "Migori",
    sub_county: "Nyatike",
    ward: "North Kadem",
    village: "Kadem Kanyuor",
    physical_address: "",
    residence_category: "Resident in North Kadem" as BursaryApplication["residence_category"],

    // 3. Clan Lineage (Crucial)
    clan_lineage_house: "Joka Ogiro Magota",
    sub_family: "Jokabwai",
    father_name: "",
    mother_name: "",
    maternal_lineage: "",
    clan_elder_or_subchair: "David Ochieng Ogutu (Sub-chair Upper Kamifuong'o)",

    // 4. Academic Institution
    education_level: "Secondary School" as BursaryApplication["education_level"],
    institution_name: "",
    admission_number: "",
    year_or_form: "Form 3",
    course_of_study: "",
    academic_performance: "",

    // 5. Need & Family
    annual_fees_required: 45000,
    amount_requested: 25000,
    family_status: "Partial Orphan" as BursaryApplication["family_status"],
    guardian_name: "",
    guardian_phone: "",
    guardian_occupation: "",
    siblings_count_in_school: 2,
    statement_of_need: "",

    // 6. Verification
    local_area_chief: "Chief Philip Opolo Orwa",
    recommendation_contact: "",
    agree_declaration: false
  });

  // Load committee applications
  const loadApplications = async () => {
    setIsLoadingApps(true);
    try {
      const data = await fetchBursaries();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setIsLoadingApps(false);
    }
  };

  useEffect(() => {
    if (activeTab === "committee") {
      loadApplications();
    }
  }, [activeTab]);

  // Quick Demo Prefill for testing
  const handleQuickDemo = (profile: "upper" | "lower" | "diaspora") => {
    if (profile === "upper") {
      setFormData({
        ...formData,
        student_name: "Kevin Otieno Ogiro",
        gender: "Male",
        dob: "2008-05-14",
        phone: "0711234567",
        email: "kevin.ogiro@example.com",
        id_or_birth_cert_no: "BC-29482103",
        residence_region: "Upper Kamifuong'o",
        county: "Migori",
        sub_county: "Nyatike",
        ward: "North Kadem",
        village: "Kadem Kanyuor",
        physical_address: "Near Kanyuor Market, Upper Kamifuong'o",
        residence_category: "Resident in North Kadem",
        clan_lineage_house: "Joka Ogiro Magota (Jokabwai, Joka Owuonda Kuba, Joka Omach Maraki, Joka Ngeta Ondego, Joka Otieno Suta)",
        sub_family: "Jokabwai",
        father_name: "Wilson Ogiro Magota",
        mother_name: "Margaret Auma Ogiro",
        maternal_lineage: "nya Kakseru",
        clan_elder_or_subchair: "David Ochieng Ogutu (Sub-chair Upper Kamifuong'o)",
        education_level: "Secondary School",
        institution_name: "Kadem Secondary School",
        admission_number: "ADM-4821",
        year_or_form: "Form 3",
        course_of_study: "KCSE Pure Sciences",
        academic_performance: "Term 2 Mean Grade: B+ (68 Points)",
        annual_fees_required: 48000,
        amount_requested: 25000,
        family_status: "Partial Orphan",
        guardian_name: "Margaret Auma Ogiro",
        guardian_phone: "0722987654",
        guardian_occupation: "Cassava & Groundnut Farmer",
        siblings_count_in_school: 3,
        statement_of_need: "Following my father's passing in 2021, my mother has struggled to maintain three of us in secondary school. This bursary will clear my school fee arrears and allow me to focus on my upcoming KCSE national examinations.",
        local_area_chief: "Chief Philip Opolo Orwa",
        recommendation_contact: "Elder Odhiambo (0722334455)",
        agree_declaration: true
      });
    } else if (profile === "lower") {
      setFormData({
        ...formData,
        student_name: "Mercy Akoth Duro",
        gender: "Female",
        dob: "2004-11-20",
        phone: "0743123456",
        email: "mercy.akoth@students.kisii.ac.ke",
        id_or_birth_cert_no: "39201495",
        residence_region: "Lower Kamifuong'o",
        county: "Migori",
        sub_county: "Nyatike",
        ward: "North Kadem",
        village: "Modi",
        physical_address: "Modi Sub-location, Lower Kamifuong'o",
        residence_category: "Resident in North Kadem",
        clan_lineage_house: "Joka Moth (Moth Ondigo)",
        sub_family: "Joka Moth Ondigo",
        father_name: "Peter Duro Moth",
        mother_name: "Grace Atieno",
        maternal_lineage: "nya Karungu",
        clan_elder_or_subchair: "Martin Duro (Sub-chair Lower Kamifuong'o)",
        education_level: "Undergraduate University",
        institution_name: "Kisii University",
        admission_number: "KU/BSCN/2024/0912",
        year_or_form: "Year 2, Semester 1",
        course_of_study: "Bachelor of Science in Nursing (BScN)",
        academic_performance: "GPA 3.65 (Distinction in Clinical Practice)",
        annual_fees_required: 86000,
        amount_requested: 40000,
        family_status: "Both Parents Living (Vulnerable/Low-Income)",
        guardian_name: "Peter Duro",
        guardian_phone: "0711998877",
        guardian_occupation: "Artisanal Fisherman / Lake Shore",
        siblings_count_in_school: 4,
        statement_of_need: "I am pursuing a nursing degree to serve community dispensaries in North Kadem. My parents face unpredictable economic hardship due to low seasonal catches on the lake, making second-year clinical exam tuition difficult to raise.",
        local_area_chief: "Chief Philip Opolo Orwa",
        recommendation_contact: "Martin Duro (Sub-chair Lower Kamifuong'o)",
        agree_declaration: true
      });
    } else {
      setFormData({
        ...formData,
        student_name: "Brian Anyuor Mang'ira",
        gender: "Male",
        dob: "2005-02-18",
        phone: "0798765432",
        email: "brian.anyuor@gmail.com",
        id_or_birth_cert_no: "40182741",
        residence_region: "Diaspora",
        county: "Migori",
        sub_county: "Suna East / Migori Town (Diaspora Branch)",
        ward: "Migori Central",
        village: "Ancestral roots: Aneko, North Kadem",
        physical_address: "Kamakande Estate, Migori (Ancestral roots North Kadem)",
        residence_category: "Diaspora (Migori/Nairobi/Other)",
        clan_lineage_house: "Kamang'ira (Lineage of Anyuor Mang'ira • Complex Unifier)",
        sub_family: "Kamang'ira Anyuor",
        father_name: "Samuel Anyuor Mang'ira",
        mother_name: "Rose Anyuor",
        maternal_lineage: "nya Kanyamwa",
        clan_elder_or_subchair: "Zebedy Ngeta (Diaspora Chairman)",
        education_level: "Vocational / TVET / Poly",
        institution_name: "Nyatike Technical and Vocational College",
        admission_number: "NTVC/AUT/2025/114",
        year_or_form: "Year 1, Module II",
        course_of_study: "Diploma in Automotive Engineering & Agricultural Machinery",
        academic_performance: "KNEC Module 1 Distinction",
        annual_fees_required: 38000,
        amount_requested: 28000,
        family_status: "Total Orphan",
        guardian_name: "Mama Elizabeth Anyuor (Grandmother)",
        guardian_phone: "0733887766",
        guardian_occupation: "Elderly Caretaker / Petty Trade",
        siblings_count_in_school: 2,
        statement_of_need: "Both of my parents passed away in 2018. My elderly grandmother has raised us through church and family help. TVET engineering skills will allow me to establish an agricultural equipment repair service in Kadem.",
        local_area_chief: "Chief Philip Opolo Orwa",
        recommendation_contact: "Zebedy Ngeta (Diaspora Chairman)",
        agree_declaration: true
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_name.trim()) {
      setFeedback({ type: "error", message: "Please provide the student's full name." });
      return;
    }
    if (!formData.phone.trim()) {
      setFeedback({ type: "error", message: "Please enter a valid telephone contact number." });
      return;
    }
    if (!formData.village.trim() || !formData.physical_address.trim()) {
      setFeedback({ type: "error", message: "Please detail your residence (village and physical address)." });
      return;
    }
    if (!formData.father_name.trim()) {
      setFeedback({ type: "error", message: "Please provide father's name or family clan lineage head." });
      return;
    }
    if (!formData.institution_name.trim() || !formData.admission_number.trim()) {
      setFeedback({ type: "error", message: "Please specify the school/institution name and admission number." });
      return;
    }
    if (!formData.statement_of_need.trim()) {
      setFeedback({ type: "error", message: "Please provide a brief statement of financial need." });
      return;
    }
    if (!formData.agree_declaration) {
      setFeedback({ type: "error", message: "Please confirm the applicant declaration before submitting." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await submitBursaryApplication(formData);
      if (res.success && res.application) {
        setSubmittedApp(res.application);
        setFeedback({
          type: "success",
          message: `Application submitted successfully! Official Reference: ${res.reference_number}`
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error("Submission did not return application record");
      }
    } catch (err: any) {
      console.error("Submission failed", err);
      setFeedback({
        type: "error",
        message: err?.message || "Failed to submit application. Please check your network."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tracking query handler
  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    setIsTrackLoading(true);
    setHasTracked(true);
    try {
      const results = await trackBursaryApplication(trackQuery);
      setTrackingResults(results);
    } catch (e) {
      console.error("Tracking query failed", e);
      setTrackingResults([]);
    } finally {
      setIsTrackLoading(false);
    }
  };

  // Open Committee Review Modal
  const openReviewModal = (app: BursaryApplication) => {
    setSelectedApp(app);
    setReviewStatus(app.status);
    setReviewNotes(app.admin_notes || "");
    setDisbursedAmountInput(app.disbursed_amount || app.amount_requested || 0);
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async () => {
    if (!selectedApp) return;

    try {
      const res = await updateBursaryApplication(selectedApp.id, {
        status: reviewStatus,
        admin_notes: reviewNotes,
        disbursed_amount: reviewStatus === "disbursed" || reviewStatus === "approved" ? Number(disbursedAmountInput) : 0
      });

      if (res.success) {
        setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: reviewStatus, admin_notes: reviewNotes, disbursed_amount: Number(disbursedAmountInput) } : a));
        setIsReviewModalOpen(false);
        setFeedback({ type: "success", message: `Application ${selectedApp.reference_number} updated to ${reviewStatus.replace("_", " ").toUpperCase()}` });
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      console.error("Review update failed", err);
    }
  };

  // Filtered applications for committee
  const filteredApplications = applications.filter(app => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (residenceFilter !== "all" && app.residence_region !== residenceFilter) return false;
    if (lineageFilter !== "all" && !app.clan_lineage_house.includes(lineageFilter)) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const match = 
        app.student_name.toLowerCase().includes(q) ||
        app.reference_number.toLowerCase().includes(q) ||
        app.institution_name.toLowerCase().includes(q) ||
        app.village.toLowerCase().includes(q) ||
        app.phone.includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getStatusBadge = (status: BursaryApplication["status"]) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
          </span>
        );
      case "disbursed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
            <DollarSign className="w-3.5 h-3.5 text-blue-600" /> Funds Disbursed
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Under Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300">
            <BadgeAlert className="w-3.5 h-3.5 text-red-600" /> Ineligible
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-300">
            <Clock className="w-3.5 h-3.5 text-zinc-500" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 text-white p-8 sm:p-12 border border-emerald-500/20 shadow-2xl">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> Education Committee
            </span>
            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold border border-zinc-700">
              North Kadem, Nyatike
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-300 text-xs font-bold border border-emerald-700/50">
              2026 Academic Year
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Education Funding & Academic Bursary Application
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base font-medium max-w-3xl leading-relaxed">
            The <strong>Mifuong'o Raruoch Organization Education Fund</strong> provides academic bursaries to vulnerable, bright, and needy students across North Kadem secondary schools, vocational colleges, and universities. Please complete this official form with accurate <strong>residence</strong> and <strong>clan lineage</strong> details for committee verification.
          </p>

          {/* Quick Tab Switcher */}
          <div className="flex flex-wrap gap-2 pt-4">
            <button
              onClick={() => { setActiveTab("apply"); setSubmittedApp(null); }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "apply"
                  ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700"
              }`}
            >
              <FileText className="w-4 h-4" />
              Apply for Funding
            </button>

            <button
              onClick={() => setActiveTab("track")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "track"
                  ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700"
              }`}
            >
              <Search className="w-4 h-4" />
              Track Application Status
            </button>

            <button
              onClick={() => setActiveTab("committee")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "committee"
                  ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Committee Review Portal
              {applications.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-black border border-emerald-700">
                  {applications.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-bold shadow-md ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-red-50 border border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)}
            className="text-xs uppercase font-black tracking-wider opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: APPLICATION FORM */}
      {/* ======================================================== */}
      {activeTab === "apply" && !submittedApp && (
        <div className="space-y-8">
          {/* Quick Demo Pre-fill Bar */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-900">
                  Quick Autofill Demo Profiles
                </p>
                <p className="text-xs text-emerald-700 font-medium">
                  Test the form instantly with authentic North Kadem sample applicants
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("upper")}
                className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Upper Kamifuong'o (Secondary)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("lower")}
                className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Lower Kamifuong'o (University)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("diaspora")}
                className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Kamang'ira Unifier (TVET)
              </button>
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-zinc-200/80 shadow-xl overflow-hidden">
            {/* Step Indicators */}
            <div className="bg-zinc-50 border-b border-zinc-200 p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { step: 1, label: "Scholar Info", icon: User },
                  { step: 2, label: "Residence & Clan", icon: MapPin },
                  { step: 3, label: "School & Fees", icon: School },
                  { step: 4, label: "Review & Sign", icon: CheckCircle2 }
                ].map(item => (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setFormStep(item.step)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all cursor-pointer ${
                      formStep === item.step
                        ? "bg-emerald-600 text-white shadow-md font-black"
                        : formStep > item.step
                        ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                        : "bg-white text-zinc-500 font-semibold border border-zinc-200"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      formStep === item.step ? "bg-white text-emerald-700" : "bg-zinc-100 text-zinc-700"
                    }`}>
                      {item.step}
                    </div>
                    <span className="text-xs sm:text-sm truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-10 space-y-8">
              {/* ---------------- STEP 1: SCHOLAR INFO ---------------- */}
              {formStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="border-b border-zinc-100 pb-3">
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Step 1 of 4</span>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-900">Scholar & Applicant Identification</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Please provide legal student identification details as they appear on official documents.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                        Student's Full Legal Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.student_name}
                        onChange={e => setFormData({ ...formData, student_name: e.target.value })}
                        placeholder="e.g. Kevin Otieno Ogiro"
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-sm text-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.gender}
                        onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dob}
                        onChange={e => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                        Primary Phone Contact <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. 0711234567"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900"
                        />
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">SMS updates & tracking notifications will be sent here</p>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                        Email Address (Optional)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. scholar@gmail.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                        National ID or Birth Certificate Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.id_or_birth_cert_no}
                        onChange={e => setFormData({ ...formData, id_or_birth_cert_no: e.target.value })}
                        placeholder="e.g. BC-29482103 or ID 39201495"
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setFormStep(2)}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      Next: Residence & Clan Lineage
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ---------------- STEP 2: RESIDENCE & CLAN LINEAGE (USER EMPHASIZED) ---------------- */}
              {formStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="border-b border-zinc-100 pb-3">
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Step 2 of 4</span>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-900">Residence & Clan Lineage Roots</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Crucial information required by the leadership synod and Education Committee to verify North Kadem community eligibility.
                    </p>
                  </div>

                  {/* Residence Card Section */}
                  <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
                    <div className="flex items-center gap-2.5 text-emerald-800">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-black text-base">Geographical Residence Information</h4>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Sub-chairmanship / Residence Zone <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.residence_region}
                          onChange={e => setFormData({ ...formData, residence_region: e.target.value as any })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        >
                          {RESIDENCE_REGIONS.map(reg => (
                            <option key={reg} value={reg}>{reg}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Residence Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.residence_category}
                          onChange={e => setFormData({ ...formData, residence_category: e.target.value as any })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        >
                          <option value="Resident in North Kadem">Resident in North Kadem</option>
                          <option value="Diaspora (Migori/Nairobi/Other)">Diaspora (Migori / Nairobi / Outside Kadem)</option>
                          <option value="Relocated Member">Relocated Member</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          County
                        </label>
                        <input
                          type="text"
                          value={formData.county}
                          onChange={e => setFormData({ ...formData, county: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 font-medium text-sm text-zinc-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Sub-County
                        </label>
                        <input
                          type="text"
                          value={formData.sub_county}
                          onChange={e => setFormData({ ...formData, sub_county: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 font-medium text-sm text-zinc-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Ward
                        </label>
                        <input
                          type="text"
                          value={formData.ward}
                          onChange={e => setFormData({ ...formData, ward: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 font-medium text-sm text-zinc-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Village / Sub-Location <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.village}
                          onChange={e => setFormData({ ...formData, village: e.target.value })}
                          placeholder="e.g. Kadem Kanyuor, Modi, Aneko, Got Kachola"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Physical Address / Landmark / Homestead <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.physical_address}
                          onChange={e => setFormData({ ...formData, physical_address: e.target.value })}
                          placeholder="e.g. Near Kanyuor Primary School, Upper Kamifuong'o"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clan Lineage Card Section */}
                  <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200/90 space-y-4">
                    <div className="flex items-center gap-2.5 text-emerald-950">
                      <Users className="w-5 h-5 text-emerald-700" />
                      <div>
                        <h4 className="font-black text-base">Ancestral Clan Lineage & Anyuola Roots</h4>
                        <p className="text-xs text-emerald-700 font-medium">Connecting student's roots to the recognized founding houses of Mifuong'o Raruoch</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-800 mb-1.5">
                          Ancestral Clan Lineage House <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.clan_lineage_house}
                          onChange={e => setFormData({ ...formData, clan_lineage_house: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 focus:ring-2 focus:ring-emerald-500 font-bold text-sm text-zinc-900 bg-white"
                        >
                          {CLAN_LINEAGES.map(lin => (
                            <option key={lin} value={lin}>{lin}</option>
                          ))}
                        </select>
                        {formData.clan_lineage_house.includes("Kamang'ira") && (
                          <div className="mt-2 p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-900 font-medium flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>
                              <strong>Kamang'ira (Anyuor Mang'ira):</strong> Recognized as the sacred Complex Unifier transcending descendancy of both Mifuong'o Raruoch and Moth Ondigo.
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-800 mb-1.5">
                          Sub-Family / Anyuola Branch <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.sub_family}
                          onChange={e => setFormData({ ...formData, sub_family: e.target.value })}
                          placeholder="e.g. Jokabwai, Odina, Anyuor Mang'ira, Mimbi"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-800 mb-1.5">
                          Father's Full Name / Lineage Head <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.father_name}
                          onChange={e => setFormData({ ...formData, father_name: e.target.value })}
                          placeholder="e.g. Wilson Ogiro Magota"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-800 mb-1.5">
                          Mother's Name
                        </label>
                        <input
                          type="text"
                          value={formData.mother_name}
                          onChange={e => setFormData({ ...formData, mother_name: e.target.value })}
                          placeholder="e.g. Margaret Auma"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-800 mb-1.5">
                          Maternal Clan Roots (Nyar Mane)
                        </label>
                        <input
                          type="text"
                          value={formData.maternal_lineage}
                          onChange={e => setFormData({ ...formData, maternal_lineage: e.target.value })}
                          placeholder="e.g. nya Kakseru, nya Karungu, nya Kanyamwa"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-800 mb-1.5">
                          Local Clan Sub-chair / Elder Reference <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.clan_elder_or_subchair}
                          onChange={e => setFormData({ ...formData, clan_elder_or_subchair: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        >
                          {SUBCHAIR_REFERENCES.map(ref => (
                            <option key={ref} value={ref}>{ref}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setFormStep(1)}
                      className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 font-bold text-sm flex items-center gap-1.5 hover:bg-zinc-100 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Scholar Info
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStep(3)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      Next: School & Financial Need
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ---------------- STEP 3: ACADEMIC & FINANCIAL NEED ---------------- */}
              {formStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="border-b border-zinc-100 pb-3">
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Step 3 of 4</span>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-900">Academic Institution & Financial Need Assessment</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Please share school fee details, admission record, and family economic vulnerability status.</p>
                  </div>

                  {/* Academic Details */}
                  <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
                    <div className="flex items-center gap-2.5 text-zinc-900">
                      <School className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-black text-base">Academic Level & Institution</h4>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Education Level <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.education_level}
                          onChange={e => setFormData({ ...formData, education_level: e.target.value as any })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        >
                          <option value="Secondary School">Secondary School (Form 1 - Form 4)</option>
                          <option value="Vocational / TVET / Poly">Vocational / TVET / Polytechnic</option>
                          <option value="College / Diploma">College / Diploma Institution</option>
                          <option value="Undergraduate University">Undergraduate University Degree</option>
                          <option value="Postgraduate">Postgraduate</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Name of Institution / School <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.institution_name}
                          onChange={e => setFormData({ ...formData, institution_name: e.target.value })}
                          placeholder="e.g. Kadem Secondary School or Kisii University"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Admission / Registration Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.admission_number}
                          onChange={e => setFormData({ ...formData, admission_number: e.target.value })}
                          placeholder="e.g. ADM-4821 or KU/BSCN/2024/0912"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Form / Year / Semester <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.year_or_form}
                          onChange={e => setFormData({ ...formData, year_or_form: e.target.value })}
                          placeholder="e.g. Form 3 or Year 2, Semester 1"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Course / Area of Study
                        </label>
                        <input
                          type="text"
                          value={formData.course_of_study}
                          onChange={e => setFormData({ ...formData, course_of_study: e.target.value })}
                          placeholder="e.g. BSc. Nursing or Automotive Engineering"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Academic Performance / Grade <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.academic_performance}
                          onChange={e => setFormData({ ...formData, academic_performance: e.target.value })}
                          placeholder="e.g. Mean Grade B+ or GPA 3.65"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Need & Vulnerability */}
                  <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
                    <div className="flex items-center gap-2.5 text-zinc-900">
                      <HeartHandshake className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-black text-base">Fees Assessment & Family Situation</h4>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Annual Fees Required (KES) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={1000}
                          value={formData.annual_fees_required}
                          onChange={e => setFormData({ ...formData, annual_fees_required: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-bold text-sm text-zinc-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Bursary Amount Requested (KES) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={1000}
                          value={formData.amount_requested}
                          onChange={e => setFormData({ ...formData, amount_requested: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 focus:ring-2 focus:ring-emerald-500 font-black text-sm text-emerald-800 bg-emerald-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Family Vulnerability Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.family_status}
                          onChange={e => setFormData({ ...formData, family_status: e.target.value as any })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        >
                          <option value="Total Orphan">Total Orphan (Both parents deceased)</option>
                          <option value="Partial Orphan">Partial Orphan (Single deceased parent)</option>
                          <option value="Single Parent">Single Parent Household</option>
                          <option value="Both Parents Living (Vulnerable/Low-Income)">Both Parents Living (Vulnerable / Low-Income)</option>
                          <option value="Person with Disability (PWD)">Person with Disability (PWD) / Special Needs</option>
                          <option value="Child-Headed Household">Child-Headed Household</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Siblings Currently in School
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={formData.siblings_count_in_school}
                          onChange={e => setFormData({ ...formData, siblings_count_in_school: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Parent / Guardian Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.guardian_name}
                          onChange={e => setFormData({ ...formData, guardian_name: e.target.value })}
                          placeholder="e.g. Margaret Auma Ogiro"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Parent / Guardian Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.guardian_phone}
                          onChange={e => setFormData({ ...formData, guardian_phone: e.target.value })}
                          placeholder="e.g. 0722987654"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Parent / Guardian Occupation & Source of Income
                        </label>
                        <input
                          type="text"
                          value={formData.guardian_occupation}
                          onChange={e => setFormData({ ...formData, guardian_occupation: e.target.value })}
                          placeholder="e.g. Smallholder cassava farming, petty fish trade, casual labor"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Personal Statement of Need & Impact <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={formData.statement_of_need}
                          onChange={e => setFormData({ ...formData, statement_of_need: e.target.value })}
                          placeholder="Explain why you require this education bursary, family hardship, and how this scholarship will enable your academic progression..."
                          className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-zinc-900 bg-white leading-relaxed"
                        />
                        <p className="text-[11px] text-zinc-400 mt-1">This statement is reviewed directly by the Education Committee synod</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setFormStep(2)}
                      className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 font-bold text-sm flex items-center gap-1.5 hover:bg-zinc-100 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Residence & Clan
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStep(4)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      Next: Review & Submit
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ---------------- STEP 4: REVIEW, DECLARATION & SUBMISSION ---------------- */}
              {formStep === 4 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="border-b border-zinc-100 pb-3">
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Step 4 of 4</span>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-900">Application Summary & Verification Declaration</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Please review your key details before formal submission to the Education Committee.</p>
                  </div>

                  {/* Summary Card */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                        <User className="w-4 h-4" /> Scholar & Residence Summary
                      </div>
                      <div className="space-y-1.5 text-xs text-zinc-700 font-medium">
                        <p><strong className="text-zinc-900">Name:</strong> {formData.student_name || "—"}</p>
                        <p><strong className="text-zinc-900">Phone:</strong> {formData.phone || "—"}</p>
                        <p><strong className="text-zinc-900">ID / Cert No:</strong> {formData.id_or_birth_cert_no || "—"}</p>
                        <p><strong className="text-zinc-900">Residence Zone:</strong> {formData.residence_region} ({formData.residence_category})</p>
                        <p><strong className="text-zinc-900">Village:</strong> {formData.village}, {formData.ward}, {formData.sub_county}</p>
                        <p><strong className="text-zinc-900">Homestead:</strong> {formData.physical_address}</p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                        <Users className="w-4 h-4 text-emerald-700" /> Clan Lineage & Education Summary
                      </div>
                      <div className="space-y-1.5 text-xs text-zinc-700 font-medium">
                        <p><strong className="text-zinc-900">Ancestral Lineage:</strong> {formData.clan_lineage_house}</p>
                        <p><strong className="text-zinc-900">Sub-Family Branch:</strong> {formData.sub_family}</p>
                        <p><strong className="text-zinc-900">Father's Name:</strong> {formData.father_name}</p>
                        <p><strong className="text-zinc-900">Institution:</strong> {formData.institution_name} ({formData.year_or_form})</p>
                        <p><strong className="text-zinc-900">Admission No:</strong> {formData.admission_number}</p>
                        <p><strong className="text-zinc-900">Funding Requested:</strong> <span className="font-black text-emerald-800">KES {formData.amount_requested.toLocaleString()}</span> (Fees: KES {formData.annual_fees_required.toLocaleString()})</p>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Details */}
                  <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
                    <div className="flex items-center gap-2.5 text-zinc-900">
                      <Building2 className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-black text-base">Community Recommendation References</h4>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Area Chief / Sub-chief Reference
                        </label>
                        <input
                          type="text"
                          value={formData.local_area_chief}
                          onChange={e => setFormData({ ...formData, local_area_chief: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 mb-1.5">
                          Local Clan Elder Contact / Phone
                        </label>
                        <input
                          type="text"
                          value={formData.recommendation_contact}
                          onChange={e => setFormData({ ...formData, recommendation_contact: e.target.value })}
                          placeholder="e.g. Elder Odhiambo (0722334455)"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 font-medium text-sm text-zinc-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Declaration Checkbox */}
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agree_declaration}
                        onChange={e => setFormData({ ...formData, agree_declaration: e.target.checked })}
                        className="mt-1 w-4 h-4 text-emerald-600 border-zinc-300 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs text-amber-950 font-medium leading-relaxed">
                        I hereby declare that all information furnished in this education funding application — including <strong>residence in North Kadem / Diaspora</strong>, <strong>clan lineage roots</strong>, and academic fee assessment — is truthful and accurate to the best of my knowledge. I understand that fraudulent submissions will lead to immediate revocation and reporting to clan elders.
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setFormStep(3)}
                      className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 font-bold text-sm flex items-center gap-1.5 hover:bg-zinc-100 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to School & Fees
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center gap-2.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Submit Bursary Application
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRMATION / ACKNOWLEDGMENT SLIP (AFTER SUBMISSION) */}
      {/* ======================================================== */}
      {activeTab === "apply" && submittedApp && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto bg-white rounded-3xl border border-zinc-200/90 shadow-2xl overflow-hidden print:shadow-none print:border-none"
        >
          <div className="bg-gradient-to-r from-emerald-900 to-zinc-950 p-8 text-white text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
              Official Acknowledgment Slip
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">Application Successfully Received</h2>
            <p className="text-xs text-zinc-300">
              Mifuong'o Raruoch Organization • Education Committee
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Reference Badge */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <p className="text-xs uppercase font-black tracking-widest text-emerald-800">Tracking Reference Number</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono tracking-wider">
                {submittedApp.reference_number}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Save or write down this tracking number to follow your committee review progress.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <p className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">Applicant & Residence</p>
                <p><strong className="text-zinc-900">Scholar Name:</strong> {submittedApp.student_name}</p>
                <p><strong className="text-zinc-900">Phone Contact:</strong> {submittedApp.phone}</p>
                <p><strong className="text-zinc-900">Residence Zone:</strong> {submittedApp.residence_region}</p>
                <p><strong className="text-zinc-900">Village:</strong> {submittedApp.village}</p>
                <p><strong className="text-zinc-900">Physical Landmark:</strong> {submittedApp.physical_address}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <p className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">Lineage & Institution</p>
                <p><strong className="text-zinc-900">Lineage House:</strong> {submittedApp.clan_lineage_house}</p>
                <p><strong className="text-zinc-900">Sub-Family Head:</strong> {submittedApp.father_name} ({submittedApp.sub_family})</p>
                <p><strong className="text-zinc-900">Institution:</strong> {submittedApp.institution_name}</p>
                <p><strong className="text-zinc-900">Admission No:</strong> {submittedApp.admission_number}</p>
                <p><strong className="text-zinc-900">Amount Requested:</strong> KES {submittedApp.amount_requested.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-100 border border-zinc-200">
              <div className="text-xs">
                <span className="font-bold text-zinc-500">Current Status: </span>
                {getStatusBadge(submittedApp.status)}
              </div>
              <span className="text-[11px] text-zinc-500 font-medium">
                Submitted on {new Date(submittedApp.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-200 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" /> Print / Save Slip
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmittedApp(null);
                  setFormStep(1);
                  setFormData({
                    ...formData,
                    student_name: "",
                    phone: "",
                    admission_number: "",
                    statement_of_need: "",
                    agree_declaration: false
                  });
                }}
                className="py-3 px-4 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TRACK APPLICATION STATUS */}
      {/* ======================================================== */}
      {activeTab === "track" && (
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Real-Time Verification</span>
              <h3 className="text-2xl font-black text-zinc-900 mt-1">Track Education Bursary Application</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Enter your official Reference Number (e.g., <strong>MRO-EDU-2026-0101</strong>) or the applicant's telephone number or National ID to check committee vetting status.
              </p>
            </div>

            <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={trackQuery}
                  onChange={e => setTrackQuery(e.target.value)}
                  placeholder="Enter MRO reference or phone number..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 font-bold text-sm text-zinc-900"
                />
              </div>
              <button
                type="submit"
                disabled={isTrackLoading}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50"
              >
                {isTrackLoading ? "Searching..." : "Track Status"}
              </button>
            </form>

            {/* Quick Helper Samples */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-zinc-500">
              <span className="font-bold text-zinc-700">Quick Test References:</span>
              {["MRO-EDU-2026-0101", "MRO-EDU-2026-0102", "MRO-EDU-2026-0103"].map(ref => (
                <button
                  key={ref}
                  type="button"
                  onClick={() => { setTrackQuery(ref); }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-mono font-bold transition-colors cursor-pointer"
                >
                  {ref}
                </button>
              ))}
            </div>
          </div>

          {/* Tracking Results */}
          {hasTracked && (
            <div className="space-y-4">
              {trackingResults.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="font-bold text-zinc-900">No application found matching "{trackQuery}"</p>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto">
                    Please verify the reference code or phone number. If you just submitted, check your acknowledgment slip or contact the Education Committee secretary.
                  </p>
                </div>
              ) : (
                trackingResults.map(app => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-xl space-y-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono font-black text-emerald-700 uppercase tracking-widest">
                          {app.reference_number}
                        </span>
                        <h4 className="text-xl font-black text-zinc-900 mt-0.5">{app.student_name}</h4>
                        <p className="text-xs text-zinc-500">{app.institution_name} • {app.year_or_form}</p>
                      </div>
                      <div>{getStatusBadge(app.status)}</div>
                    </div>

                    {/* Progress Track Steps */}
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-wider text-zinc-600">Review Progression Milestones</p>
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {[
                          { title: "Submitted", desc: "Form recorded", done: true },
                          { 
                            title: "Vetting", 
                            desc: "Lineage & residence review", 
                            done: app.status === "under_review" || app.status === "approved" || app.status === "disbursed" 
                          },
                          { 
                            title: "Approved", 
                            desc: "Synod bursary grant", 
                            done: app.status === "approved" || app.status === "disbursed" 
                          },
                          { 
                            title: "Disbursed", 
                            desc: "Cheque issued to school", 
                            done: app.status === "disbursed" 
                          }
                        ].map((m, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              m.done 
                                ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-black shadow-sm" 
                                : "bg-zinc-50 border-zinc-200 text-zinc-400 font-medium"
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs ${
                              m.done ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-500"
                            }`}>
                              {m.done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                            </div>
                            <p className="text-[11px] font-bold leading-tight">{m.title}</p>
                            <p className="text-[9px] text-zinc-500 hidden sm:block mt-0.5">{m.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid sm:grid-cols-2 gap-3 text-xs bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                      <div>
                        <span className="text-zinc-500 font-bold">Residence: </span>
                        <span className="text-zinc-900 font-medium">{app.residence_region} ({app.village}, {app.ward})</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 font-bold">Clan Lineage: </span>
                        <span className="text-zinc-900 font-medium">{app.clan_lineage_house}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 font-bold">Father / Lineage Head: </span>
                        <span className="text-zinc-900 font-medium">{app.father_name}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 font-bold">Funding Requested: </span>
                        <span className="text-emerald-700 font-black">KES {app.amount_requested.toLocaleString()}</span>
                      </div>
                    </div>

                    {app.admin_notes && (
                      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                        <span className="font-black text-emerald-900 uppercase tracking-wider text-[10px]">Education Committee Review Remarks:</span>
                        <p className="text-emerald-900 font-medium leading-relaxed">{app.admin_notes}</p>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: COMMITTEE REVIEW PORTAL */}
      {/* ======================================================== */}
      {activeTab === "committee" && (
        <div className="space-y-6">
          {/* Header & Metrics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Administrative Synod</span>
              <h3 className="text-2xl font-black text-zinc-900">Education Committee Applications Register</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Review, vet, and manage education bursary applications submitted by North Kadem scholars and families.
              </p>
            </div>
            <button
              onClick={loadApplications}
              className="self-start sm:self-center px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Refresh Applications
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Total Applicants</span>
              <p className="text-2xl font-black text-zinc-900">{applications.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">Pending Review</span>
              <p className="text-2xl font-black text-amber-900">
                {applications.filter(a => a.status === "pending" || a.status === "under_review").length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Approved & Disbursed</span>
              <p className="text-2xl font-black text-emerald-900">
                {applications.filter(a => a.status === "approved" || a.status === "disbursed").length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-800">Total Funding Requested</span>
              <p className="text-xl sm:text-2xl font-black text-blue-900">
                KES {applications.reduce((acc, a) => acc + (a.amount_requested || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-600">
              <Filter className="w-3.5 h-3.5" /> Filter Register
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search name, ref, school..."
                className="px-3.5 py-2 rounded-xl border border-zinc-300 text-xs font-medium text-zinc-900"
              />

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-zinc-300 text-xs font-medium text-zinc-900 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="disbursed">Disbursed</option>
                <option value="rejected">Ineligible</option>
              </select>

              <select
                value={residenceFilter}
                onChange={e => setResidenceFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-zinc-300 text-xs font-medium text-zinc-900 bg-white"
              >
                <option value="all">All Residence Zones</option>
                {RESIDENCE_REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <select
                value={lineageFilter}
                onChange={e => setLineageFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-zinc-300 text-xs font-medium text-zinc-900 bg-white"
              >
                <option value="all">All Clan Lineages</option>
                <option value="Ogiro">Joka Ogiro Magota</option>
                <option value="Moth">Joka Moth</option>
                <option value="Nyakara">Joka Nyakara</option>
                <option value="Kamang'ira">Kamang'ira (Unifier)</option>
                <option value="Tagaya">Joka Tagaya</option>
              </select>
            </div>
          </div>

          {/* Applications Table / Cards */}
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xl overflow-hidden">
            {isLoadingApps ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-zinc-500 font-bold">Loading bursary applications register...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <p className="font-black text-zinc-800 text-base">No applications matching current filters</p>
                <p className="text-xs text-zinc-500">Try adjusting your search criteria or reset filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200">
                {filteredApplications.map(app => (
                  <div 
                    key={app.id} 
                    className="p-5 sm:p-6 hover:bg-zinc-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          {app.reference_number}
                        </span>
                        {getStatusBadge(app.status)}
                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                          {app.education_level}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-zinc-900 leading-snug">{app.student_name}</h4>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 font-medium">
                        <span><strong>Institution:</strong> {app.institution_name} ({app.year_or_form})</span>
                        <span>•</span>
                        <span><strong>Residence:</strong> {app.residence_region} ({app.village})</span>
                        <span>•</span>
                        <span><strong>Lineage:</strong> {app.clan_lineage_house}</span>
                      </div>

                      <p className="text-xs text-zinc-500 line-clamp-1 italic">
                        "{app.statement_of_need}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Requested</span>
                        <span className="text-base font-black text-zinc-900">
                          KES {app.amount_requested.toLocaleString()}
                        </span>
                        {app.disbursed_amount && app.disbursed_amount > 0 ? (
                          <span className="text-[11px] font-bold text-emerald-700 block">
                            Disbursed: KES {app.disbursed_amount.toLocaleString()}
                          </span>
                        ) : null}
                      </div>

                      <button
                        onClick={() => openReviewModal(app)}
                        className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-emerald-600 text-white text-xs font-black transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review / Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* COMMITTEE ACTION / REVIEW MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isReviewModalOpen && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-black text-emerald-700 uppercase tracking-widest">
                    {selectedApp.reference_number}
                  </span>
                  <h3 className="text-2xl font-black text-zinc-900">{selectedApp.student_name}</h3>
                  <p className="text-xs text-zinc-500">{selectedApp.institution_name} • {selectedApp.year_or_form}</p>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center font-bold text-sm hover:bg-zinc-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Applicant Dossier */}
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <h5 className="font-black text-zinc-800 uppercase tracking-wider text-[10px]">Residence & Clan Dossier</h5>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <p><strong className="text-zinc-900">Residence Zone:</strong> {selectedApp.residence_region}</p>
                    <p><strong className="text-zinc-900">Category:</strong> {selectedApp.residence_category}</p>
                    <p><strong className="text-zinc-900">Village:</strong> {selectedApp.village}, {selectedApp.ward}</p>
                    <p><strong className="text-zinc-900">Homestead Landmark:</strong> {selectedApp.physical_address}</p>
                    <p><strong className="text-zinc-900">Clan Lineage:</strong> {selectedApp.clan_lineage_house}</p>
                    <p><strong className="text-zinc-900">Sub-Family Branch:</strong> {selectedApp.sub_family}</p>
                    <p><strong className="text-zinc-900">Father / Head:</strong> {selectedApp.father_name}</p>
                    <p><strong className="text-zinc-900">Sub-chair Reference:</strong> {selectedApp.clan_elder_or_subchair}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <h5 className="font-black text-emerald-950 uppercase tracking-wider text-[10px]">Academic & Financial Assessment</h5>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <p><strong className="text-zinc-900">Annual Fees Required:</strong> KES {selectedApp.annual_fees_required.toLocaleString()}</p>
                    <p><strong className="text-zinc-900">Bursary Requested:</strong> <span className="font-black text-emerald-800">KES {selectedApp.amount_requested.toLocaleString()}</span></p>
                    <p><strong className="text-zinc-900">Family Status:</strong> {selectedApp.family_status}</p>
                    <p><strong className="text-zinc-900">Academic Score:</strong> {selectedApp.academic_performance}</p>
                    <p><strong className="text-zinc-900">Guardian Name:</strong> {selectedApp.guardian_name} ({selectedApp.guardian_phone})</p>
                    <p><strong className="text-zinc-900">Occupation:</strong> {selectedApp.guardian_occupation}</p>
                  </div>
                  <div className="pt-2 border-t border-emerald-200">
                    <p className="font-bold text-zinc-700">Statement of Need:</p>
                    <p className="text-zinc-600 mt-0.5 italic leading-relaxed">{selectedApp.statement_of_need}</p>
                  </div>
                </div>

                {/* Committee Action Form */}
                <div className="space-y-4 pt-2">
                  <h5 className="font-black text-zinc-900 text-sm">Update Committee Action & Synod Decision</h5>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-700 mb-1">
                        Application Status Decision
                      </label>
                      <select
                        value={reviewStatus}
                        onChange={e => setReviewStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 font-bold text-xs bg-white text-zinc-900"
                      >
                        <option value="pending">Pending Review</option>
                        <option value="under_review">Under Active Committee Review</option>
                        <option value="approved">Approved by Synod</option>
                        <option value="disbursed">Funds Disbursed to School</option>
                        <option value="rejected">Ineligible / Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-700 mb-1">
                        Disbursed / Awarded Amount (KES)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={disbursedAmountInput}
                        onChange={e => setDisbursedAmountInput(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 font-black text-xs text-emerald-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-700 mb-1">
                      Official Committee Remarks / Synod Minutes Notes
                    </label>
                    <textarea
                      rows={3}
                      value={reviewNotes}
                      onChange={e => setReviewNotes(e.target.value)}
                      placeholder="Add vetting verification remarks or cheque reference details..."
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 font-medium text-xs text-zinc-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 font-bold text-xs hover:bg-zinc-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReview}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer transition-all"
                >
                  Save Committee Decision
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
