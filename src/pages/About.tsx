import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Shield, 
  Users, 
  GraduationCap, 
  Home, 
  Award, 
  Globe, 
  Coffee, 
  Gift, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  X, 
  BookOpen, 
  Landmark, 
  Search,
  Sparkles,
  ChevronRight,
  Camera
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function About() {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [lineageFilter, setLineageFilter] = useState("");

  const foundingLeaders = [
    { name: "Fred Abich", role: "Chairman", title: "Founding Chair" },
    { name: "Philip Opiyo Odero", role: "Secretary", title: "Founding Secretary" },
    { name: "Paul Aran Onditi", role: "Treasurer", title: "Founding Treasurer" },
    { name: "Peter Ooko Ogutu", role: "Organizing Secretary", title: "Organizing Secretary" },
    { name: "Chief Philip Opolo Orwa", role: "Technical Advisor", title: "Technical Advisor" },
    { name: "David Ogutu", role: "Sub-Chair (Upper)", title: "Leadership Synod" },
    { name: "Martin Duro", role: "Sub-Chair (Lower)", title: "Leadership Synod" },
  ];

  const lineages = [
    {
      num: 1,
      name: "Joka Ogiro Magota",
      mother: "wuod Nyojero nya Uyoma Kabuodha",
      subfamilies: ["Jokabwai", "Joka Owuonda Kuba", "Joka Omach Maraki", "Joka Ngeta Ondego", "Joka Otieno Suta"],
      details: "One of the most extensive houses, whose branches have developed into flourishing sub-families."
    },
    {
      num: 2,
      name: "Joka Tagaya Obware",
      mother: "wuod Nyiyo nyar Kakseru",
      subfamilies: ["Descendants of Tagaya Obware"],
      details: "Branch of Tagaya Obware, whose lineage connects closely to ancestral Jokadem settlements."
    },
    {
      num: 3,
      name: "Joka Moth",
      mother: "wuod Nyaoke nyar Kisii",
      subfamilies: ["Descendants of Moth"],
      details: "House established through Nyaoke nyar Kisii, representing enduring historical kinship."
    },
    {
      num: 4,
      name: "Joka Nyakara",
      mother: "nyar Kakseru",
      subfamilies: ["Odina", "Anyuor", "Mimbi", "Nyojero (Migogo)"],
      details: "Prominent house including Odina, Anyuor, Mimbi, and Nyojero who holds the revered position of Migogo (daughter)."
    },
    {
      num: 5,
      name: "Joka Obwanga",
      mother: "wuod Mijita",
      subfamilies: ["Descendants of Obwanga"],
      details: "Ancestral house of Obwanga wuod Mijita, foundational to Jokadem history."
    },
    {
      num: 6,
      name: "Joka Ong'ele Osodhi",
      mother: "wuod Migita nyar Kakseru",
      subfamilies: ["Descendants of Ong'ele Osodhi"],
      details: "Lineage of Ong'ele Osodhi, known for community leadership and unity."
    },
    {
      num: 7,
      name: "Joka Saronge",
      mother: "nyar Utegi",
      subfamilies: ["Olal", "Odege", "Nyonyuka Afande wuod Tagaya Obware"],
      details: "Revered house of Saronge nyar Utegi, branching through Olal, Odege, and Nyonyuka Afande."
    },
    {
      num: 8,
      name: "Joka Otugi Ajwang",
      mother: "wuod Oguma nyar Kakseru",
      subfamilies: ["Descendants of Otugi Ajwang"],
      details: "Ancestral lineage of Otugi Ajwang wuod Oguma nyar Kakseru."
    },
    {
      num: 9,
      name: "Joka Ogambi",
      mother: "nya Uyoma Kabuodha",
      subfamilies: ["Ngeta Masabu (Odege inherited the wife)"],
      details: "House of Ogambi nya Uyoma Kabuodha, branching with Ngeta Masabu and Odege."
    },
    {
      num: 10,
      name: "Joka Nyonyuka & Ancestral Houses",
      mother: "Ancestral Sons of Mifuong'o Raruoch",
      subfamilies: ["Sub-families of North Kadem & Diaspora"],
      details: "The surviving sons of the legendary founder whose families have branched across Kadem Kanyuor."
    }
  ];

  const filteredLineages = lineages.filter(l => 
    l.name.toLowerCase().includes(lineageFilter.toLowerCase()) ||
    l.mother.toLowerCase().includes(lineageFilter.toLowerCase()) ||
    l.subfamilies.some(s => s.toLowerCase().includes(lineageFilter.toLowerCase()))
  );

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-zinc-950 py-20 px-6 sm:px-12 text-center border border-zinc-800 shadow-2xl">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#10b981_0,transparent_65%)]" />
        </div>
        
        <motion.div 
          className="relative z-10 max-w-4xl mx-auto space-y-6"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/25">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Registered Self-Help Group (S.H.G) • Est. 2019
            </span>
            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider border border-zinc-700">
              Kadem Kanyuor Clan
            </span>
          </motion.div>

          <motion.h1 
            variants={fadeIn}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[0.95]"
          >
            MIFUONG'O RARUOCH <br />
            <span className="text-emerald-400">ORGANIZATION</span>
          </motion.h1>

          <motion.p 
            variants={fadeIn}
            className="text-zinc-300 text-base sm:text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed"
          >
            A community organization formed to improve the socioeconomic and geopolitical wellbeing of the people as well as support the vulnerable and needy through promoting unity of purpose and pooling of resources for mutual aid.
          </motion.p>
          
          <motion.div variants={fadeIn} className="flex flex-wrap justify-center gap-4 pt-4">
            <Link 
              to="/contribute?guest=true"
              className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/30 flex items-center gap-2"
            >
              Support Our Programs <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#lineage"
              className="px-8 py-4 bg-zinc-900 text-zinc-200 rounded-2xl font-black text-sm hover:bg-zinc-800 transition-all border border-zinc-700"
            >
              Explore Lineages
            </a>
          </motion.div>

          {/* Quick Metrics Bar */}
          <motion.div 
            variants={fadeIn}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-3xl mx-auto border-t border-zinc-800/80 text-left"
          >
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/60">
              <span className="text-2xl sm:text-3xl font-black text-white">3,000+</span>
              <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-wider">Adult Members</p>
              <p className="text-[11px] text-zinc-500">North Kadem & Diaspora</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/60">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">200+</span>
              <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-wider">Annual Bursaries</p>
              <p className="text-[11px] text-zinc-500">Education Committee</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/60">
              <span className="text-2xl sm:text-3xl font-black text-blue-400">14</span>
              <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-wider">Ancestral Lineages</p>
              <p className="text-[11px] text-zinc-500">13 Sons & 1 Daughter</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/60">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">2019</span>
              <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-wider">State Registered</p>
              <p className="text-[11px] text-zinc-500">Dept. of Social Services</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* History & Heritage Section */}
      <section className="grid lg:grid-cols-12 gap-12 items-center px-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-widest">
            <Landmark className="w-3.5 h-3.5" />
            Our Heritage & Roots
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight leading-tight">
            Descendancy of the Legendary <br className="hidden sm:inline" />
            <span className="text-emerald-700">Mifuong'o Raruoch</span>
          </h2>
          <div className="space-y-4 text-zinc-600 font-medium leading-relaxed">
            <p>
              The organization was founded by the visionary descendancy of the legendary 
              <strong className="text-zinc-900 font-bold"> Mifuong'o Raruoch (Ogola Fuong' Wuod Nyonyuka okew Sidho, okew gi Lwanda Magere)</strong> of the 
              <strong className="text-zinc-900 font-bold"> Kadem Kanyuor clan</strong>, who, in the prehistoric era, led and organized the settlement of Jokadem in their present geographical locations.
            </p>
            <p>
              In 2019, the elders and community leaders formally constituted and registered the community with the 
              <strong className="text-zinc-900 font-bold"> State Department of Social Services</strong> as a registered Self-Help Group (S.H.G).
            </p>
            <p>
              Today, the organization unites over <strong className="text-zinc-900 font-bold">3,000 adult members</strong> spread across various parts of North Kadem and the diaspora, structured into dedicated committees that turn traditional brotherhood into concrete mutual aid.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950">Leadership Synod Patronized by KER</h4>
              <p className="text-sm text-emerald-800/80 mt-1 leading-relaxed">
                The organizational synod is traditionally patronized by the revered cultural custodian <strong>KER</strong>, with <strong>Ker Christopher Odero Aton</strong> serving as the historic first Ker patron of the leadership synod.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="lg:col-span-5 bg-zinc-900 text-white p-8 rounded-3xl border border-zinc-800 shadow-xl space-y-6"
        >
          <div className="border-b border-zinc-800 pb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Institutional Synod</span>
            <h3 className="text-2xl font-black mt-1">Founding Leadership</h3>
            <p className="text-xs text-zinc-400 mt-1">The trailblazing leaders who formalized Mifuong'o Raruoch Organization</p>
          </div>

          <div className="space-y-3">
            {foundingLeaders.map((leader, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/20">
                    {leader.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">{leader.name}</p>
                    <p className="text-[11px] text-zinc-400 mt-1">{leader.title}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-zinc-700/60 text-emerald-400 border border-zinc-600 uppercase tracking-tight">
                  {leader.role}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>First Ker Patron:</span>
            <strong className="text-emerald-400 font-bold">Ker Christopher Odero Aton</strong>
          </div>
        </motion.div>
      </section>

      {/* Life-Touching Programs (Committees) */}
      <section className="space-y-10 px-4">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Life-Touching Community Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
            Committees Driving Real Transformation
          </h2>
          <p className="text-zinc-500 text-base font-medium">
            To manage our large population of over 3,000 members, the organization is structured into specialized committees tackling education, welfare, and social integration.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Education Empowerment",
              badge: "Education Committee",
              icon: GraduationCap,
              color: "emerald",
              description: "Awarding scholarship bursaries to approximately 200 needy and gifted students annually, ensuring that lack of school fees never stands in the way of a child's academic destiny.",
              metrics: "200+ Students Supported Annually"
            },
            {
              title: "Welfare & Medical Support",
              badge: "Welfare Committee",
              icon: Heart,
              color: "rose",
              description: "Providing compassionate financial and moral solidarity by meeting urgent medical bills and dignified burial expenses for departed members and grieving families.",
              metrics: "Comprehensive Bereavement & Medical Cover"
            },
            {
              title: "Social Integration & Shelter",
              badge: "Integration Committee",
              icon: Home,
              color: "blue",
              description: "Building homes for the elderly and vulnerable widows, guaranteeing safe, dry, and dignified shelter for our most cherished community matriarchs and patriarchs.",
              metrics: "Dignified Housing for the Vulnerable"
            }
          ].map((prog, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-lg hover:shadow-xl transition-all space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                    <prog.icon className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-zinc-100 text-zinc-600">
                    {prog.badge}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{prog.title}</h3>
                <p className="text-zinc-600 text-sm font-medium leading-relaxed">{prog.description}</p>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-black text-emerald-700">{prog.metrics}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Resource Mobilization Callout */}
        <div className="bg-zinc-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Resource Mobilization</span>
            <h4 className="text-2xl font-black tracking-tight">How These Programs Are Funded</h4>
            <p className="text-sm text-zinc-300 font-medium leading-relaxed">
              These life-touching initiatives are realized through active member contributions, organized community fundraising, generous well-wisher donations, grants, and dedicated gifts from friends, relatives, and civil leaders.
            </p>
          </div>
          <Link
            to="/contribute?guest=true"
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/20 whitespace-nowrap"
          >
            Contribute Today
          </Link>
        </div>
      </section>

      {/* Leadership & Community in Action Showcase */}
      <section className="space-y-8 px-4">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Documentary Evidence & Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
            Leadership in Action
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base font-medium">
            Active engagement on the ground: disbursing bursary cheques to bright needy students and consulting with civil and community leaders on socioeconomic development.
          </p>
          <div className="pt-2">
            <Link 
              to="/gallery" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              Explore Full Photo Gallery Archives &rarr;
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Bursary Cheques */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
              <img 
                src="/images/bursary-issuance.jpg" 
                alt="The leadership issuing bursary cheques to needy students"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-md text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-white/10">
                  Education Committee
                </span>
              </div>
            </div>
            <div className="p-6 sm:p-8 space-y-3">
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight leading-snug">
                The leadership issuing bursary cheques to needy students.
              </h3>
              <p className="text-zinc-600 text-sm font-medium leading-relaxed">
                Mifuong'o Raruoch executive leadership and Education Committee convening in North Kadem to formally issue academic bursaries to vulnerable students and parents, ensuring unhindered school attendance.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Civil Leaders Consultation */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
              <img 
                src="/images/leadership-consultation.jpg" 
                alt="The leadership consulting with civil leaders on development matters"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-md text-blue-400 text-[10px] font-black uppercase tracking-wider border border-white/10">
                  Civil & Strategic Synod
                </span>
              </div>
            </div>
            <div className="p-6 sm:p-8 space-y-3">
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight leading-snug">
                The leadership consulting with civil leaders on development matters.
              </h3>
              <p className="text-zinc-600 text-sm font-medium leading-relaxed">
                Elders and executive officials in high-level consultative sessions with civil leaders and regional stakeholders, aligning on infrastructure, community welfare, and strategic empowerment initiatives.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Due Diligence & Application Vetting Banner */}
        <div className="bg-emerald-50/50 rounded-3xl p-6 sm:p-8 border border-emerald-100 flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-52 h-36 rounded-2xl overflow-hidden shrink-0 border border-emerald-200 shadow-sm">
            <img 
              src="/images/committee-vetting.jpg" 
              alt="Bursary Committee Vetting Applications"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md">
              Integrity & Verification
            </span>
            <h4 className="text-lg font-bold text-zinc-900">Rigorous Application Vetting & Welfare Registers</h4>
            <p className="text-sm text-zinc-600 font-medium leading-relaxed">
              Every bursary award and welfare disbursement is subjected to transparent review by committee secretaries, technical advisors, and clan representatives to ensure aid reaches the most deserving families.
            </p>
          </div>
        </div>
      </section>

      {/* The 14 Descendancy Lineages Section */}
      <section id="lineage" className="space-y-8 px-4 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Genealogy & Identity
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
              The 14 Descendancy Lineages
            </h2>
            <p className="text-zinc-600 text-sm font-medium">
              The descendancy of Mifuong'o Raruoch is built on and identified by the names of his <strong>13 surviving sons and 1 daughter (Migogo)</strong>. Over generations, these larger families have branched into thriving sub-families across North Kadem and the diaspora.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search lineage or sub-family..."
              value={lineageFilter}
              onChange={(e) => setLineageFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLineages.map((lineage) => (
            <motion.div 
              key={lineage.num}
              layout
              className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                    {lineage.num}
                  </div>
                  <div>
                    <h4 className="font-black text-zinc-900 text-base leading-snug">{lineage.name}</h4>
                    <p className="text-[11px] font-semibold text-emerald-700">{lineage.mother}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                {lineage.details}
              </p>

              <div className="pt-3 border-t border-zinc-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-2">
                  Recognized Sub-Families & Houses:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {lineage.subfamilies.map((sub, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-[11px] font-bold border border-zinc-200"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center text-xs text-zinc-500 font-medium">
          Note: Through generations, larger families such as Joka Ogiro Magota have branched into sub-families like Jokabwai, Joka Owuonda Kuba, Joka Omach Maraki, Joka Ngeta Ondego, and Joka Otieno Suta. All members are welcomed and indexed under their respective ancestral branches.
        </div>
      </section>

      {/* Guest & Well-Wishers Giving Section */}
      <section className="relative py-12 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center bg-white rounded-[3rem] p-8 md:p-16 border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden">
          <div className="space-y-8 relative z-10">
            <div className="space-y-4">
              <span className="text-rose-500 font-black text-[10px] uppercase tracking-[0.3em]">Well-Wishers & Friends</span>
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight leading-none">
                Support Our Vision. <br /> <span className="text-rose-500">Donate as a Guest.</span>
              </h2>
              <p className="text-zinc-600 font-medium leading-relaxed">
                We warmly welcome friends, relatives, civil leaders, and well-wishers who believe in community empowerment. Your direct gifts fund our annual scholarships and vulnerable welfare programs with complete accountability.
              </p>
            </div>

            <ul className="space-y-3">
              {[
                "Direct funding for 200+ bursary scholarships",
                "Welfare relief for medical emergencies & burials",
                "Building safe homes for elderly and widows",
                "Public accounting and treasurer verification"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>

            {/* Official Paybill Details Card */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block">
                Official Donation Paybill (Lipa na M-Pesa)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Business No.</span>
                  <span className="font-mono font-black text-zinc-900 text-sm">522522</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">A/C Number</span>
                  <span className="font-mono font-black text-zinc-900 text-sm">1322197253</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 font-semibold pt-1">
                Account Name: <strong className="text-zinc-900">Mifuong'o Ruruoch SHG</strong>
              </p>
            </div>

            <Link 
              to="/contribute?guest=true"
              className="w-full sm:w-auto px-10 py-5 bg-rose-500 text-white rounded-2xl font-black text-lg hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/30 flex items-center justify-center gap-3"
            >
              <Gift className="w-6 h-6" />
              Make a Guest Donation
            </Link>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-rose-100 rounded-[2.5rem] rotate-3 group-hover:rotate-1 transition-transform" />
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
              <img 
                src="/images/african-children-donate.jpg" 
                alt="African Children Supported by Education Bursary" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-300">Scholarship & Education Fund</span>
                <p className="text-white font-bold text-sm mt-1">Directly empowering underprivileged African children in North Kadem with secondary & tertiary education bursaries.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support App Logistics Section */}
      <section className="bg-zinc-50 rounded-[2.5rem] p-10 sm:p-14 border border-zinc-200">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Digital Infrastructure</span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">Support Our Platform Logistics</h2>
            <p className="text-zinc-600 font-medium max-w-2xl mx-auto leading-relaxed">
              To keep the Mifuong'o Raruoch digital portal active, secure, and accessible to members across North Kadem and the diaspora, we maintain cloud infrastructure and community database tools.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { label: "Server Maintenance", icon: Globe, desc: "High availability hosting" },
              { label: "Security Updates", icon: Shield, desc: "Data protection for members" },
              { label: "Community Digitization", icon: Users, desc: "Directory & member registry" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col items-center gap-2">
                <item.icon className="w-8 h-8 text-emerald-600" />
                <span className="font-bold text-zinc-900 text-sm">{item.label}</span>
                <span className="text-xs text-zinc-400">{item.desc}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button 
              onClick={() => setShowSupportModal(true)}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-zinc-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-2xl shadow-zinc-900/20"
            >
              <Coffee className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform" />
              Support Platform Logistics
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-zinc-500 font-medium">Common questions about Mifuong'o Raruoch Organization.</p>
        </div>

        <div className="space-y-4">
          {[
            { 
              q: "Who is eligible to join Mifuong'o Raruoch Organization?", 
              a: "Membership is open to all adult descendants of the 13 survived sons and 1 daughter of Mifuong'o Raruoch across North Kadem, Kenya, and in the diaspora." 
            },
            { 
              q: "How are education bursaries awarded?", 
              a: "The Education Committee oversees bursary applications annually, vetting needy and qualified students to award approximately 200 scholarships each year." 
            },
            { 
              q: "Can non-members and well-wishers make contributions?", 
              a: "Yes! We encourage well-wishers, friends, civil leaders, and relatives to support our education bursaries and welfare initiatives through our Guest Donation portal." 
            },
            { 
              q: "How is the organization governed?", 
              a: "The organization is led by the Founding Executive Committee (Chair, Sec, Treasurer, Org. Sec, Tech. Advisor, Sub-chairs) under the cultural patronage of the Leadership Synod headed by KER." 
            }
          ].map((faq, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <h4 className="font-bold text-zinc-900">{faq.q}</h4>
              </div>
              <p className="text-sm text-zinc-600 font-medium pl-7 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Support Logistics Modal */}
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
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Support Platform Logistics</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                    Help us maintain the server hosting, SMS gateways, and secure member directory for Mifuong'o Raruoch Organization.
                  </p>
                </div>

                <div className="p-6 bg-zinc-900 rounded-3xl text-white space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Paybill (Lipa na M-Pesa)</span>
                    <span className="font-mono font-black text-emerald-400 text-lg">522522</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Account (A/C)</span>
                    <span className="font-mono font-black text-emerald-400 text-lg">1322197253</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Account Name</span>
                    <span className="font-bold text-white text-sm">Mifuong'o Ruruoch SHG</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 text-center uppercase font-black tracking-wider">
                    Official Donation Account • North Kadem
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                  <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                    This fund is dedicated to technical hosting, security maintenance, and digital tools for the community.
                  </p>
                </div>

                <button 
                  onClick={() => setShowSupportModal(false)}
                  className="w-full px-6 py-4 bg-zinc-900 text-white rounded-xl font-black text-sm text-center hover:bg-black transition-all"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
