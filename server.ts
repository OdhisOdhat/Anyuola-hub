import express from "express";
import "express-async-errors";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

console.log("SERVER.TS STARTING...");
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL === "1";
const isProd = process.env.NODE_ENV === "production" || isVercel;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: any = null;
let supabaseAvailable = false;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    console.log("Supabase client initialized");
  } else {
    console.log("Supabase credentials not set - operating in Local Resilient Mode");
  }
} catch (err) {
  console.warn("Failed to initialize Supabase client:", err);
}

// Resilient In-Memory Database Store
const localStore: {
  clan: any;
  members: any[];
  events: any[];
  projects: any[];
  alerts: any[];
  contributions: any[];
  messages: any[];
  pages: any[];
  blogs: any[];
  ads: any[];
} = {
  clan: {
    id: "clan-1",
    name: "MIFUONG'O RARUOCH ORGANIZATION",
    tagline: "Self-Help Group (S.H.G) Reg. 2019 • Kadem Kanyuor",
    description: "Mifuong'o Raruoch is a community organization formed to improve the socioeconomic and geopolitical wellbeing of the people as well as support the vulnerable and the needy population through promoting unity of purpose and pooling of resources for mutual aid.",
    logo_url: "/images/Price1.jpeg",
    primary_color: "#10b981",
    secondary_color: "#064e3b",
    website_url: ""
  },
  members: [
    {
      id: "mem-1",
      name: "Fred Abich",
      phone: "0722000001",
      clan_id: "clan-1",
      role: "admin",
      subgroup: "Upper Kadem",
      village: "Kadem Kanyuor",
      father_name: "Abich",
      residence: "North Kadem / Nairobi",
      title: "Chairman",
      created_at: "2019-06-01T00:00:00Z"
    },
    {
      id: "mem-2",
      name: "Philip Opiyo Odero",
      phone: "0722000002",
      clan_id: "clan-1",
      role: "member",
      subgroup: "Central Kadem",
      village: "Kadem",
      father_name: "Odero",
      residence: "North Kadem",
      title: "Secretary",
      created_at: "2019-06-01T00:00:00Z"
    },
    {
      id: "mem-3",
      name: "Paul Aran Onditi",
      phone: "0722000003",
      clan_id: "clan-1",
      role: "treasurer",
      subgroup: "Lower Kadem",
      village: "Kadem",
      father_name: "Onditi",
      residence: "North Kadem",
      title: "Treasurer",
      created_at: "2019-06-01T00:00:00Z"
    },
    {
      id: "mem-4",
      name: "Peter Ooko Ogutu",
      phone: "0722000004",
      clan_id: "clan-1",
      role: "subgroup_manager",
      subgroup: "Upper Kadem",
      village: "Kadem",
      father_name: "Ogutu",
      residence: "North Kadem",
      title: "Organizing Secretary",
      created_at: "2019-06-01T00:00:00Z"
    },
    {
      id: "mem-5",
      name: "Chief Philip Opolo Orwa",
      phone: "0722000005",
      clan_id: "clan-1",
      role: "admin",
      subgroup: "Kadem",
      village: "Kadem",
      father_name: "Orwa",
      residence: "North Kadem",
      title: "Technical Advisor",
      created_at: "2019-06-01T00:00:00Z"
    },
    {
      id: "mem-6",
      name: "David Ogutu",
      phone: "0722000006",
      clan_id: "clan-1",
      role: "subgroup_manager",
      subgroup: "Upper Kadem",
      village: "Upper Kadem",
      father_name: "Ogutu",
      residence: "Upper Kadem",
      title: "Sub-chair Upper",
      created_at: "2019-06-01T00:00:00Z"
    },
    {
      id: "mem-7",
      name: "Martin Duro",
      phone: "0722000007",
      clan_id: "clan-1",
      role: "subgroup_manager",
      subgroup: "Lower Kadem",
      village: "Lower Kadem",
      father_name: "Duro",
      residence: "Lower Kadem",
      title: "Sub-chair Lower",
      created_at: "2019-06-01T00:00:00Z"
    }
  ],
  events: [
    {
      id: "ev-1",
      title: "2026 Academic Bursary & School Fees Fund",
      type: "education",
      description: "Direct bursaries for bright, needy students across North Kadem secondary and tertiary institutions to keep children in class.",
      target_amount: 500000,
      clan_id: "clan-1",
      created_by: "mem-1",
      creator_name: "Fred Abich",
      status: "active",
      date: "2026-10-15T09:00:00Z",
      created_at: "2026-08-01T00:00:00Z"
    },
    {
      id: "ev-2",
      title: "Emergency Medical & Benevolent Aid",
      type: "medical",
      description: "Immediate benevolent assistance for vulnerable elders, widow households, and critical hospitalization emergencies.",
      target_amount: 300000,
      clan_id: "clan-1",
      created_by: "mem-3",
      creator_name: "Paul Aran Onditi",
      status: "active",
      date: "2026-11-01T10:00:00Z",
      created_at: "2026-08-10T00:00:00Z"
    },
    {
      id: "ev-3",
      title: "Annual Clan Assembly & Mutual Aid Fund",
      type: "general",
      description: "General welfare kitty and annual synod logistics supporting community infrastructure and socioeconomic solidarity.",
      target_amount: 250000,
      clan_id: "clan-1",
      created_by: "mem-2",
      creator_name: "Philip Opiyo Odero",
      status: "active",
      date: "2026-12-20T08:30:00Z",
      created_at: "2026-08-15T00:00:00Z"
    }
  ],
  projects: [
    {
      id: "proj-1",
      title: "Community Water Kiosk & Borehole Rehabilitation",
      description: "Providing clean drinking water and piping for domestic and school use across North Kadem villages.",
      status: "in_progress",
      progress: 65,
      clan_id: "clan-1",
      created_at: "2026-06-01T00:00:00Z"
    },
    {
      id: "proj-2",
      title: "Education Bursary Endowment Initiative",
      description: "A permanent revolving endowment guaranteeing secondary school fees for orphaned and vulnerable learners.",
      status: "in_progress",
      progress: 80,
      clan_id: "clan-1",
      created_at: "2026-07-01T00:00:00Z"
    },
    {
      id: "proj-3",
      title: "Mifuong'o Cultural Heritage & Digital Archive",
      description: "Documenting oral genealogies, ancient landmark settlements of Jokadem, and digital membership registries.",
      status: "planned",
      progress: 40,
      clan_id: "clan-1",
      created_at: "2026-08-01T00:00:00Z"
    }
  ],
  alerts: [
    {
      id: "alert-1",
      title: "North Kadem Dry-Season Advisory",
      description: "Community elders peace committee reminder regarding water points and grazing boundary protocols.",
      severity: "low",
      location: "North Kadem Region",
      clan_id: "clan-1",
      created_by: "mem-1",
      creator_name: "Fred Abich",
      created_at: "2026-09-01T00:00:00Z"
    }
  ],
  contributions: [
    {
      id: "cont-1",
      member_id: "mem-1",
      event_id: "ev-1",
      amount: 25000,
      payment_reference: "QJK89124L",
      status: "approved",
      created_at: "2026-08-15T10:00:00Z",
      member_name: "Fred Abich",
      event_title: "2026 Academic Bursary & School Fees Fund"
    },
    {
      id: "cont-2",
      member_id: "mem-3",
      event_id: "ev-1",
      amount: 15000,
      payment_reference: "QJK90234M",
      status: "approved",
      created_at: "2026-08-20T11:00:00Z",
      member_name: "Paul Aran Onditi",
      event_title: "2026 Academic Bursary & School Fees Fund"
    },
    {
      id: "cont-3",
      member_id: "mem-2",
      event_id: "ev-2",
      amount: 10000,
      payment_reference: "QJK91345N",
      status: "approved",
      created_at: "2026-08-22T09:30:00Z",
      member_name: "Philip Opiyo Odero",
      event_title: "Emergency Medical & Benevolent Aid"
    },
    {
      id: "cont-4",
      member_id: null,
      event_id: "ev-1",
      amount: 20000,
      payment_reference: "QJK92456P",
      status: "approved",
      created_at: "2026-08-28T14:15:00Z",
      member_name: "Well-Wisher (Guest)",
      event_title: "2026 Academic Bursary & School Fees Fund"
    },
    {
      id: "cont-5",
      member_id: "mem-4",
      event_id: "ev-3",
      amount: 5000,
      payment_reference: "QJK93567Q",
      status: "approved",
      created_at: "2026-09-01T12:00:00Z",
      member_name: "Peter Ooko Ogutu",
      event_title: "Annual Clan Assembly & Mutual Aid Fund"
    }
  ],
  messages: [
    {
      id: "msg-1",
      sender_id: "mem-1",
      receiver_id: null,
      is_broadcast: true,
      subject: "Welcome to Mifuong'o Raruoch Organization Portal",
      body: "Welcome elders, members, and friends to our official digital platform for transparent welfare coordination.",
      clan_id: "clan-1",
      created_at: "2026-09-01T08:00:00Z",
      sender_name: "Fred Abich"
    }
  ],
  pages: [] as any[],
  blogs: [] as any[],
  ads: [] as any[]
};

// Helper: check if Supabase is alive without throwing
async function trySupabase<T>(fn: () => Promise<T>): Promise<{ data: T | null; error: any }> {
  if (!supabase) return { data: null, error: new Error("Supabase client not initialized") };
  try {
    const res: any = await Promise.race([
      fn(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase request timeout")), 3500))
    ]);
    if (res?.error) {
      return { data: null, error: res.error };
    }
    return { data: res?.data ?? res, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Test route
app.get("/api/test", (req, res) => {
  res.send("OK");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    supabaseConfigured: !!supabase,
    env: process.env.NODE_ENV,
    isVercel
  });
});

// --- User & Profile ---
app.get("/api/me", async (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || "mem-1"; 
  const userEmail = (req.headers["x-user-email"] as string) || "";

  // 1. Try Supabase if available
  if (supabase) {
    try {
      if (userEmail === 'fodhis1@gmail.com') {
        const { data: existingUser } = await supabase
          .from("members")
          .select("role")
          .eq("id", userId)
          .single();

        if (existingUser && existingUser.role !== 'admin') {
          await supabase.from("members").update({ role: 'admin' }).eq("id", userId);
        }
      }

      const { data: user, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (!error && user) {
        return res.json(user);
      }
    } catch (e) {
      console.warn("Supabase /api/me failed, falling back to localStore:", (e as any)?.message);
    }
  }

  // 2. Resilient fallback from localStore
  let user = localStore.members.find(m => m.id === userId);
  if (!user && (userEmail === 'fodhis1@gmail.com' || userId === 'mem-1')) {
    user = localStore.members[0]; // Fred Abich admin
  }
  if (!user) {
    user = {
      id: userId,
      name: userEmail ? userEmail.split('@')[0] : "Community Member",
      phone: "",
      clan_id: "clan-1",
      role: userEmail === 'fodhis1@gmail.com' ? "admin" : "member",
      subgroup: "Upper Kadem",
      village: "Kadem",
      father_name: "",
      residence: "Kadem"
    };
    localStore.members.push(user);
  }

  if (userEmail === 'fodhis1@gmail.com') {
    user.role = 'admin';
  }

  res.json(user);
});

// --- Contributions List ---
app.get("/api/contributions/all", async (req, res) => {
  if (supabase) {
    try {
      const { data: contributions, error } = await supabase
        .from("contributions")
        .select(`
          *,
          members!inner(name, clan_id),
          event:events(title)
        `)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(contributions)) {
        const flattened = contributions.map((c: any) => ({
          ...c,
          member_name: c.members?.name || "Guest Contributor",
          event_title: c.event?.title || "General Fund"
        }));
        return res.json(flattened);
      }
    } catch (e) {
      console.warn("Supabase /api/contributions/all failed, falling back to localStore");
    }
  }

  // Fallback to local store
  res.json(localStore.contributions);
});

// --- Create Welfare Case / Event ---
app.post("/api/events", async (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || "mem-1";
  const { title, type, description, target_amount, date, clan_id } = req.body;
  const id = `ev-${Date.now()}`;

  const newEvent = {
    id,
    title,
    type: type || "general",
    description: description || "",
    target_amount: Number(target_amount) || 0,
    date: date || new Date().toISOString(),
    clan_id: clan_id || "clan-1",
    created_by: userId,
    creator_name: localStore.members.find(m => m.id === userId)?.name || "Fred Abich",
    status: "active",
    created_at: new Date().toISOString()
  };

  localStore.events.unshift(newEvent);

  if (supabase) {
    try {
      await supabase.from("events").insert([{
        id, title, type, description, target_amount: Number(target_amount) || 0, date, clan_id, created_by: userId
      }]);
    } catch (e) {
      console.warn("Supabase event insert failed, recorded locally");
    }
  }

  res.json({ id, success: true });
});

// --- Update Welfare Case / Event ---
app.patch("/api/events/:id", async (req, res) => {
  const { title, type, description, target_amount, date, status } = req.body;
  const event = localStore.events.find(e => e.id === req.params.id);
  if (event) {
    if (title !== undefined) event.title = title;
    if (type !== undefined) event.type = type;
    if (description !== undefined) event.description = description;
    if (target_amount !== undefined) event.target_amount = Number(target_amount);
    if (date !== undefined) event.date = date;
    if (status !== undefined) event.status = status;
  }

  if (supabase) {
    try {
      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (type !== undefined) updates.type = type;
      if (description !== undefined) updates.description = description;
      if (target_amount !== undefined) updates.target_amount = target_amount;
      if (date !== undefined) updates.date = date;
      if (status !== undefined) updates.status = status;
      await supabase.from("events").update(updates).eq("id", req.params.id);
    } catch (e) {
      console.warn("Supabase event update failed, updated locally");
    }
  }

  res.json({ success: true });
});

// --- Clan Details ---
app.get("/api/clan/:id", async (req, res) => {
  if (supabase) {
    try {
      const { data: clan, error } = await supabase
        .from("clans")
        .select("*")
        .eq("id", req.params.id)
        .single();
      
      if (!error && clan) {
        if (clan.name === "My Anyuola App" || clan.name === "CommunityHub") {
          clan.name = localStore.clan.name;
          clan.tagline = localStore.clan.tagline;
          clan.description = localStore.clan.description;
        }
        return res.json(clan);
      }
    } catch (e) {
      console.warn("Supabase /api/clan/:id failed, falling back to localStore");
    }
  }

  res.json(localStore.clan);
});

// --- Update Clan Branding ---
app.patch("/api/clan/:id/branding", async (req, res) => {
  const { name, tagline, description, primary_color, secondary_color, logo_url } = req.body;
  if (name) localStore.clan.name = name;
  if (tagline) localStore.clan.tagline = tagline;
  if (description) localStore.clan.description = description;
  if (primary_color) localStore.clan.primary_color = primary_color;
  if (secondary_color) localStore.clan.secondary_color = secondary_color;
  if (logo_url) localStore.clan.logo_url = logo_url;

  if (supabase) {
    try {
      await supabase.from("clans").update(req.body).eq("id", req.params.id);
    } catch (e) {
      console.warn("Supabase clan update failed, saved locally");
    }
  }

  res.json({ success: true });
});

// --- Members List ---
app.get("/api/clan/:id/members", async (req, res) => {
  if (supabase) {
    try {
      const { data: members, error } = await supabase
        .from("members")
        .select("*")
        .eq("clan_id", req.params.id);
      
      if (!error && Array.isArray(members) && members.length > 0) {
        return res.json(members);
      }
    } catch (e) {
      console.warn("Supabase members fetch failed, falling back to localStore");
    }
  }

  res.json(localStore.members);
});

// --- Create Member ---
app.post("/api/members", async (req, res) => {
  const { name, phone, clan_id, role, subgroup, village, father_name, residence } = req.body;
  const id = `mem-${Date.now()}`;
  const newMember = {
    id,
    name: name || "Member",
    phone: phone || "",
    clan_id: clan_id || "clan-1",
    role: role || "member",
    subgroup: subgroup || "Upper Kadem",
    village: village || "Kadem",
    father_name: father_name || "",
    residence: residence || "Kadem",
    created_at: new Date().toISOString()
  };

  localStore.members.push(newMember);

  if (supabase) {
    try {
      await supabase.from("members").insert([newMember]);
    } catch (e) {
      console.warn("Supabase member insert failed, stored locally");
    }
  }

  res.json({ id, success: true });
});

// --- Update Member ---
app.patch("/api/members/:id", async (req, res) => {
  const member = localStore.members.find(m => m.id === req.params.id);
  if (member) {
    Object.assign(member, req.body);
  }

  if (supabase) {
    try {
      await supabase.from("members").update(req.body).eq("id", req.params.id);
    } catch (e) {
      console.warn("Supabase member update failed, stored locally");
    }
  }

  res.json({ success: true });
});

// --- Events List ---
app.get("/api/clan/:id/events", async (req, res) => {
  if (supabase) {
    try {
      const { data: events, error } = await supabase
        .from("events")
        .select(`
          *,
          creator:members!events_created_by_fkey(name)
        `)
        .eq("clan_id", req.params.id)
        .order("created_at", { ascending: false });
      
      if (!error && Array.isArray(events)) {
        const flattened = events.map((e: any) => ({
          ...e,
          creator_name: e.creator?.name || "Community Leader"
        }));
        return res.json(flattened);
      }
    } catch (e) {
      console.warn("Supabase events fetch failed, falling back to localStore");
    }
  }

  res.json(localStore.events);
});

// --- Projects List ---
app.get("/api/clan/:id/projects", async (req, res) => {
  if (supabase) {
    try {
      const { data: projects, error } = await supabase
        .from("projects")
        .select("*")
        .eq("clan_id", req.params.id);
      
      if (!error && Array.isArray(projects)) {
        return res.json(projects);
      }
    } catch (e) {
      console.warn("Supabase projects fetch failed, falling back to localStore");
    }
  }

  res.json(localStore.projects);
});

// --- Create Project ---
app.post("/api/projects", async (req, res) => {
  const { title, description, status, progress, clan_id } = req.body;
  const id = `proj-${Date.now()}`;
  const newProj = {
    id,
    title,
    description,
    status: status || "planned",
    progress: progress || 0,
    clan_id: clan_id || "clan-1",
    created_at: new Date().toISOString()
  };

  localStore.projects.push(newProj);

  if (supabase) {
    try {
      await supabase.from("projects").insert([newProj]);
    } catch (e) {
      console.warn("Supabase project insert failed, stored locally");
    }
  }

  res.json({ id, success: true });
});

// --- Update Project ---
app.patch("/api/projects/:id", async (req, res) => {
  const project = localStore.projects.find(p => p.id === req.params.id);
  if (project) {
    Object.assign(project, req.body);
  }

  if (supabase) {
    try {
      await supabase.from("projects").update(req.body).eq("id", req.params.id);
    } catch (e) {
      console.warn("Supabase project update failed, stored locally");
    }
  }

  res.json({ success: true });
});

// --- Security Alerts List ---
app.get("/api/clan/:id/alerts", async (req, res) => {
  if (supabase) {
    try {
      const { data: alerts, error } = await supabase
        .from("security_alerts")
        .select(`
          *,
          creator:members!security_alerts_created_by_fkey(name)
        `)
        .eq("clan_id", req.params.id)
        .order("created_at", { ascending: false });
      
      if (!error && Array.isArray(alerts)) {
        const flattened = alerts.map((a: any) => ({
          ...a,
          creator_name: a.creator?.name || "Community Security Desk"
        }));
        return res.json(flattened);
      }
    } catch (e) {
      console.warn("Supabase alerts fetch failed, falling back to localStore");
    }
  }

  res.json(localStore.alerts);
});

// --- Create Alert ---
app.post("/api/alerts", async (req, res) => {
  const { title, description, severity, location, clan_id, created_by } = req.body;
  const id = `alert-${Date.now()}`;
  const newAlert = {
    id,
    title,
    description,
    severity: severity || "low",
    location: location || "North Kadem",
    clan_id: clan_id || "clan-1",
    created_by: created_by || "mem-1",
    creator_name: "Fred Abich",
    created_at: new Date().toISOString()
  };

  localStore.alerts.unshift(newAlert);

  if (supabase) {
    try {
      await supabase.from("security_alerts").insert([newAlert]);
    } catch (e) {
      console.warn("Supabase alert insert failed, stored locally");
    }
  }

  res.json({ id, success: true });
});

// --- Update Alert ---
app.patch("/api/alerts/:id", async (req, res) => {
  const alert = localStore.alerts.find(a => a.id === req.params.id);
  if (alert) {
    Object.assign(alert, req.body);
  }

  if (supabase) {
    try {
      await supabase.from("security_alerts").update(req.body).eq("id", req.params.id);
    } catch (e) {
      console.warn("Supabase alert update failed, stored locally");
    }
  }

  res.json({ success: true });
});

// --- Submit Contribution (Member or Guest) ---
app.post("/api/contributions", async (req, res) => {
  const { member_id, event_id, amount, payment_reference } = req.body;
  const id = `cont-${Date.now()}`;
  const finalMemberId = (!member_id || member_id === 'guest-user') ? null : member_id;

  const event = localStore.events.find(e => e.id === event_id);
  const member = localStore.members.find(m => m.id === finalMemberId);

  const newContrib = {
    id,
    member_id: finalMemberId,
    event_id: event_id || null,
    amount: Number(amount) || 0,
    payment_reference: payment_reference || `PAY-${Date.now()}`,
    status: "approved",
    created_at: new Date().toISOString(),
    member_name: member?.name || "Well-Wisher (Guest)",
    event_title: event?.title || "General Fund"
  };

  localStore.contributions.unshift(newContrib);

  if (supabase) {
    try {
      await supabase.from("contributions").insert([{ 
        id, member_id: finalMemberId, event_id, amount: Number(amount) || 0, payment_reference, status: "approved"
      }]);
    } catch (e) {
      console.warn("Supabase contribution insert failed, stored locally");
    }
  }

  res.json({ id, success: true });
});

// --- Update Contribution Status ---
app.patch("/api/contributions/:id", async (req, res) => {
  const contrib = localStore.contributions.find(c => c.id === req.params.id);
  if (contrib) {
    Object.assign(contrib, req.body);
  }

  if (supabase) {
    try {
      await supabase.from("contributions").update(req.body).eq("id", req.params.id);
    } catch (e) {
      console.warn("Supabase contribution update failed, stored locally");
    }
  }

  res.json({ success: true });
});

// --- Financial Report ---
app.get("/api/clan/:id/financial-report", async (req, res) => {
  const clanId = req.params.id;

  if (supabase) {
    try {
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, title, type, target_amount")
        .eq("clan_id", clanId);

      const { data: contributions, error: contribError } = await supabase
        .from("contributions")
        .select(`amount, status, event_id`)
        .in("status", ["approved", "verified", "Approved", "Verified"]);

      if (!eventsError && !contribError && Array.isArray(events)) {
        const report = events.map((event: any) => {
          const eventContribs = (contributions || []).filter((c: any) => c.event_id === event.id);
          const totalRaised = eventContribs.reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0);
          return {
            ...event,
            total_raised: totalRaised,
            percentage: event.target_amount > 0 ? (totalRaised / event.target_amount) * 100 : 0
          };
        });

        const generalContribs = (contributions || []).filter((c: any) => !c.event_id);
        const totalGeneral = generalContribs.reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0);
        
        report.push({
          id: 'general',
          title: 'General Welfare & Benevolent Fund',
          type: 'general',
          target_amount: 0,
          total_raised: totalGeneral,
          percentage: 100
        });

        return res.json(report);
      }
    } catch (e) {
      console.warn("Supabase financial report failed, falling back to localStore");
    }
  }

  // Resilient calculation from localStore
  const report = localStore.events.map(event => {
    const eventContribs = localStore.contributions.filter(c => c.event_id === event.id);
    const totalRaised = eventContribs.reduce((sum, c) => sum + c.amount, 0);
    return {
      ...event,
      total_raised: totalRaised,
      percentage: event.target_amount > 0 ? (totalRaised / event.target_amount) * 100 : 0
    };
  });

  const generalContribs = localStore.contributions.filter(c => !c.event_id);
  const totalGeneral = generalContribs.reduce((sum, c) => sum + c.amount, 0);

  report.push({
    id: 'general',
    title: 'General Welfare & Benevolent Fund',
    type: 'general',
    target_amount: 0,
    total_raised: totalGeneral,
    percentage: 100
  });

  res.json(report);
});

// --- CMS: Pages ---
app.get("/api/clan/:id/pages", async (req, res) => {
  res.json(localStore.pages);
});
app.post("/api/pages", async (req, res) => {
  const id = `page-${Date.now()}`;
  const newPage = { id, ...req.body, created_at: new Date().toISOString() };
  localStore.pages.push(newPage);
  res.json({ id, success: true });
});
app.patch("/api/pages/:id", async (req, res) => {
  const p = localStore.pages.find(x => x.id === req.params.id);
  if (p) Object.assign(p, req.body);
  res.json({ success: true });
});

// --- CMS: Blogs ---
app.get("/api/clan/:id/blogs", async (req, res) => {
  res.json(localStore.blogs);
});
app.post("/api/blogs", async (req, res) => {
  const id = `blog-${Date.now()}`;
  const newBlog = { id, ...req.body, created_at: new Date().toISOString() };
  localStore.blogs.push(newBlog);
  res.json({ id, success: true });
});
app.patch("/api/blogs/:id", async (req, res) => {
  const b = localStore.blogs.find(x => x.id === req.params.id);
  if (b) Object.assign(b, req.body);
  res.json({ success: true });
});

// --- CMS: Ads ---
app.get("/api/clan/:id/ads", async (req, res) => {
  res.json(localStore.ads);
});
app.post("/api/ads", async (req, res) => {
  const id = `ad-${Date.now()}`;
  const newAd = { id, ...req.body, created_at: new Date().toISOString() };
  localStore.ads.push(newAd);
  res.json({ id, success: true });
});
app.patch("/api/ads/:id", async (req, res) => {
  const a = localStore.ads.find(x => x.id === req.params.id);
  if (a) Object.assign(a, req.body);
  res.json({ success: true });
});

// --- Messaging ---
app.get("/api/messages", async (req, res) => {
  res.json(localStore.messages);
});
app.post("/api/messages", async (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || "mem-1";
  const id = `msg-${Date.now()}`;
  const newMsg = {
    id,
    sender_id: userId,
    sender_name: localStore.members.find(m => m.id === userId)?.name || "Fred Abich",
    ...req.body,
    created_at: new Date().toISOString()
  };
  localStore.messages.unshift(newMsg);
  res.json({ id, success: true });
});
app.patch("/api/messages/:id/read", async (req, res) => {
  res.json({ success: true });
});

// Vite middleware for development
if (!isProd) {
  const { createServer: createViteServer } = await import("vite");
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then(vite => {
    app.use(vite.middlewares);
  });
} else if (!isVercel) {
  app.use(express.static(path.join(process.cwd(), "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(process.cwd(), "dist", "index.html"));
  });
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server Error Handled:", err?.message);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err?.message || "Unknown error"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

export default app;
