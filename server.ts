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

console.log("Supabase URL present:", !!supabaseUrl);
console.log("Supabase Anon Key present:", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL: Supabase environment variables are missing!");
}

let supabase: any = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized successfully");
  } else {
    console.log("Supabase client NOT initialized - missing credentials");
  }
} catch (err) {
  console.error("CRITICAL: Failed to initialize Supabase client:", err);
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

// Simple test route
app.get("/api/test", (req, res) => {
  console.log("TEST ROUTE HIT");
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

// Middleware to check Supabase configuration
app.use((req, res, next) => {
  if (req.path.startsWith("/api") && !supabase) {
    return res.status(500).json({
      error: "Configuration Error",
      message: "Supabase environment variables are missing. Please configure SUPABASE_URL and SUPABASE_ANON_KEY in your deployment settings."
    });
  }
  next();
});

// API Routes
app.get("/api/me", async (req, res) => {
  const userId = req.headers["x-user-id"] || "mem-1"; 
  const userEmail = req.headers["x-user-email"];

  if (!supabase) {
    return res.status(500).json({ error: "Supabase not initialized" });
  }

  try {
    // Check if this is the primary admin
    if (userEmail === 'fodhis1@gmail.com') {
      const { data: existingUser } = await supabase!
        .from("members")
        .select("role")
        .eq("id", userId)
        .single();

      if (existingUser && existingUser.role !== 'admin') {
        // Auto-elevate this specific user to admin if not already
        await supabase!
          .from("members")
          .update({ role: 'admin' })
          .eq("id", userId);
      }
    }

    const { data: user, error } = await supabase!
      .from("members")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error) return res.status(404).json({ error: "User not found", details: error.message });
    res.json(user);
  } catch (err: any) {
    console.error("Error in /api/me:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

  app.get("/api/contributions/all", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { data: user } = await supabase!
      .from("members")
      .select("role, clan_id")
      .eq("id", userId)
      .single();
    
    if (!user) return res.status(403).json({ error: "Unauthorized" });

    const isAdmin = user.role === 'admin' || user.role === 'treasurer';

    let query = supabase!
      .from("contributions")
      .select(`
        *,
        members!inner(name, clan_id),
        event:events(title)
      `);

    if (!isAdmin) {
      // For members, show all contributions in their clan for transparency
      query = query.eq("members.clan_id", user.clan_id);
    }

    const { data: contributions, error } = await query.order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    
    // Flatten the response
    const flattened = contributions.map((c: any) => ({
      ...c,
      member_name: c.members?.name,
      event_title: c.event?.title
    }));

    res.json(flattened);
  });

  app.post("/api/events", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { data: user } = await supabase!
      .from("members")
      .select("role")
      .eq("id", userId)
      .single();

    if (!user || (user.role !== 'admin' && user.role !== 'treasurer' && user.role !== 'subgroup_manager')) {
      return res.status(403).json({ error: "Unauthorized to create welfare cases" });
    }

    const { title, type, description, target_amount, date, clan_id } = req.body;
    const id = `ev-${Date.now()}`;
    const { error } = await supabase!
      .from("events")
      .insert([{ id, title, type, description, target_amount, date, clan_id, created_by: userId }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ id, success: true });
  });

  app.patch("/api/events/:id", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { data: user } = await supabase!
      .from("members")
      .select("role")
      .eq("id", userId)
      .single();

    if (!user || (user.role !== 'admin' && user.role !== 'treasurer' && user.role !== 'subgroup_manager')) {
      return res.status(403).json({ error: "Unauthorized to edit welfare cases" });
    }

    const { title, type, description, target_amount, date, status } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (type !== undefined) updates.type = type;
    if (description !== undefined) updates.description = description;
    if (target_amount !== undefined) updates.target_amount = target_amount;
    if (date !== undefined) updates.date = date;
    if (status !== undefined) updates.status = status;

    const { error } = await supabase!
      .from("events")
      .update(updates)
      .eq("id", req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.get("/api/clan/:id", async (req, res) => {
    try {
      const { data: clan, error } = await supabase!
        .from("clans")
        .select("*")
        .eq("id", req.params.id)
        .single();
      
      if (error) return res.status(404).json({ error: "Clan not found", details: error.message });
      res.json(clan);
    } catch (err: any) {
      console.error("Error in /api/clan/:id:", err);
      res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
  });

  app.get("/api/clan/:id/members", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    
    const { data: currentUser } = await supabase!
      .from("members")
      .select("role, subgroup")
      .eq("id", userId)
      .single();

    const { data: members, error } = await supabase!
      .from("members")
      .select("*")
      .eq("clan_id", req.params.id);
    
    if (error) return res.status(500).json({ error: error.message });

    // Conceal phone numbers if not admin or subgroup_manager
    const isAdminOrManager = currentUser && (currentUser.role === 'admin' || currentUser.role === 'subgroup_manager');
    
    const sanitizedMembers = members.map(m => {
      const isSameSubgroup = currentUser && m.subgroup === currentUser.subgroup && m.subgroup !== null;
      // Show phone if: admin/manager OR own profile OR same subgroup
      if (!isAdminOrManager && m.id !== userId && !isSameSubgroup) {
        const { phone, ...rest } = m;
        return { ...rest, phone: "Hidden" };
      }
      return m;
    });

    res.json(sanitizedMembers);
  });

  app.post("/api/members", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    
    // Check if caller is admin
    const { data: caller } = await supabase!
      .from("members")
      .select("role")
      .eq("id", userId)
      .single();

    const { name, phone, clan_id, role, subgroup, village, father_name, residence } = req.body;
    
    // Only admin can set a role other than 'member'
    const finalRole = (caller?.role === 'admin') ? (role || 'member') : 'member';
    
    const id = `mem-${Date.now()}`;
    const { error } = await supabase!
      .from("members")
      .insert([{ 
        id, name, phone, clan_id, role: finalRole, subgroup, village, father_name, residence 
      }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ id, success: true });
  });

  app.patch("/api/members/:id", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const targetId = req.params.id;

    const { data: user } = await supabase!
      .from("members")
      .select("role")
      .eq("id", userId)
      .single();

    // Allow if admin OR if updating own profile
    if (!user || (user.role !== 'admin' && userId !== targetId)) {
      return res.status(403).json({ error: "Unauthorized to manage this member" });
    }

    const { name, phone, role, clan_id, subgroup, village, father_name, residence, photo_url } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    
    // Only admin can change role or clan_id
    if (user.role === 'admin') {
      if (role !== undefined) updates.role = role;
      if (clan_id !== undefined) updates.clan_id = clan_id;
    }

    if (subgroup !== undefined) updates.subgroup = subgroup;
    if (village !== undefined) updates.village = village;
    if (father_name !== undefined) updates.father_name = father_name;
    if (residence !== undefined) updates.residence = residence;
    if (photo_url !== undefined) updates.photo_url = photo_url;

    const { error } = await supabase!
      .from("members")
      .update(updates)
      .eq("id", targetId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.get("/api/clan/:id/events", async (req, res) => {
    const { data: events, error } = await supabase!
      .from("events")
      .select(`
        *,
        creator:members!events_created_by_fkey(name)
      `)
      .eq("clan_id", req.params.id)
      .order("created_at", { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    
    const flattened = events.map((e: any) => ({
      ...e,
      creator_name: e.creator?.name
    }));

    res.json(flattened);
  });

  app.get("/api/clan/:id/projects", async (req, res) => {
    const { data: projects, error } = await supabase!
      .from("projects")
      .select("*")
      .eq("clan_id", req.params.id);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(projects);
  });

  app.post("/api/projects", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { data: user } = await supabase!
      .from("members")
      .select("role")
      .eq("id", userId)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized to create projects" });
    }

    const { title, description, status, progress, clan_id } = req.body;
    const id = `proj-${Date.now()}`;
    const { error } = await supabase!
      .from("projects")
      .insert([{ 
        id, title, description, status: status || 'planned', progress: progress || 0, clan_id 
      }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ id, success: true });
  });

  app.patch("/api/projects/:id", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { data: user } = await supabase!
      .from("members")
      .select("role")
      .eq("id", userId)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized to manage projects" });
    }

    const { title, description, progress, status } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (progress !== undefined) updates.progress = progress;
    if (status !== undefined) updates.status = status;

    const { error } = await supabase!
      .from("projects")
      .update(updates)
      .eq("id", req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.get("/api/clan/:id/alerts", async (req, res) => {
    const { data: alerts, error } = await supabase!
      .from("security_alerts")
      .select(`
        *,
        creator:members!security_alerts_created_by_fkey(name)
      `)
      .eq("clan_id", req.params.id)
      .order("created_at", { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });

    const flattened = alerts.map((a: any) => ({
      ...a,
      creator_name: a.creator?.name
    }));

    res.json(flattened);
  });

  app.post("/api/alerts", async (req, res) => {
    const { title, description, severity, location, clan_id, created_by } = req.body;
    const id = `alert-${Date.now()}`;
    const { error } = await supabase!
      .from("security_alerts")
      .insert([{ 
        id, title, description, severity, location, clan_id, created_by 
      }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ id, success: true });
  });

  app.patch("/api/alerts/:id", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { data: user } = await supabase!
      .from("members")
      .select("role")
      .eq("id", userId)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized to manage alerts" });
    }

    const { title, description, severity, location } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (severity !== undefined) updates.severity = severity;
    if (location !== undefined) updates.location = location;

    const { error } = await supabase!
      .from("security_alerts")
      .update(updates)
      .eq("id", req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.post("/api/contributions", async (req, res) => {
    const { member_id, event_id, amount, payment_reference } = req.body;
    const id = `cont-${Date.now()}`;
    
    // Handle guest contributions
    const finalMemberId = member_id === 'guest-user' ? null : member_id;

    const { error } = await supabase!
      .from("contributions")
      .insert([{ 
        id, member_id: finalMemberId, event_id, amount, payment_reference 
      }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ id, success: true });
  });

  app.patch("/api/contributions/:id", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    
    const { data: contribution } = await supabase!
      .from("contributions")
      .select("member_id, status")
      .eq("id", req.params.id)
      .single();

    const { data: user } = await supabase!
      .from("members")
      .select("role")
      .eq("id", userId)
      .single();

    if (!user || !contribution) return res.status(404).json({ error: "Not found" });

    const isAdmin = user.role === 'admin' || user.role === 'treasurer';
    const isOwner = contribution.member_id === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Unauthorized to edit this contribution" });
    }

    // Members can only edit if status is pending
    if (!isAdmin && contribution.status !== 'pending') {
      return res.status(403).json({ error: "Cannot edit a processed contribution" });
    }

    const { amount, payment_reference, status } = req.body;
    const updates: any = {};
    if (amount !== undefined) updates.amount = amount;
    if (payment_reference !== undefined) updates.payment_reference = payment_reference;
    
    // Only admin/treasurer can change status
    if (isAdmin && status !== undefined) updates.status = status;

    const { error } = await supabase!
      .from("contributions")
      .update(updates)
      .eq("id", req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // --- Financial Report ---
  app.get("/api/clan/:id/financial-report", async (req, res) => {
    try {
      const clanId = req.params.id;

      const { data: events, error: eventsError } = await supabase!
        .from("events")
        .select("id, title, type, target_amount")
        .eq("clan_id", clanId);

      if (eventsError) return res.status(500).json({ error: eventsError.message });

      const { data: contributions, error: contribError } = await supabase!
        .from("contributions")
        .select(`
          amount, 
          status, 
          event_id,
          members!inner(clan_id)
        `)
        .in("status", ["approved", "verified", "Approved", "Verified"])
        .eq("members.clan_id", clanId);

      if (contribError) return res.status(500).json({ error: contribError.message });

      const report = events.map(event => {
        const eventContribs = contributions.filter(c => c.event_id === event.id);
        const totalRaised = eventContribs.reduce((sum, c) => sum + c.amount, 0);
        return {
          ...event,
          total_raised: totalRaised,
          percentage: event.target_amount > 0 ? (totalRaised / event.target_amount) * 100 : 0
        };
      });

      // Add General Fund
      const generalContribs = contributions.filter(c => !c.event_id);
      const totalGeneral = generalContribs.reduce((sum, c) => sum + c.amount, 0);
      
      if (totalGeneral > 0 || report.length === 0) {
        report.push({
          id: 'general',
          title: 'General Welfare Fund',
          type: 'general',
          target_amount: 0,
          total_raised: totalGeneral,
          percentage: 100
        });
      }

      res.json(report);
    } catch (err: any) {
      console.error("Error in /api/clan/:id/financial-report:", err);
      res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
  });
  app.get("/api/clan/:id/pages", async (req, res) => {
    const { data: pages, error } = await supabase!
      .from("pages")
      .select("*")
      .eq("clan_id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(pages);
  });

  app.post("/api/pages", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { data: user } = await supabase!.from("members").select("role").eq("id", userId).single();
    if (!user || user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    const { title, slug, content, is_published, clan_id } = req.body;
    const id = `page-${Date.now()}`;
    const { error } = await supabase!.from("pages").insert([{ id, title, slug, content, is_published, clan_id }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id, success: true });
  });

  app.patch("/api/pages/:id", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { data: user } = await supabase!.from("members").select("role").eq("id", userId).single();
    if (!user || user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    const { title, slug, content, is_published } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (content !== undefined) updates.content = content;
    if (is_published !== undefined) updates.is_published = is_published;

    const { error } = await supabase!.from("pages").update(updates).eq("id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // --- CMS: Blogs ---
  app.get("/api/clan/:id/blogs", async (req, res) => {
    const { data: blogs, error } = await supabase!
      .from("blogs")
      .select("*, author:members!author_id(name)")
      .eq("clan_id", req.params.id)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(blogs);
  });

  app.post("/api/blogs", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { data: user } = await supabase!.from("members").select("role").eq("id", userId).single();
    if (!user || user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    const { title, content, image_url, category, is_published, clan_id } = req.body;
    const id = `blog-${Date.now()}`;
    const { error } = await supabase!.from("blogs").insert([{ id, title, content, author_id: userId, image_url, category, is_published, clan_id }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id, success: true });
  });

  app.patch("/api/blogs/:id", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { data: user } = await supabase!.from("members").select("role").eq("id", userId).single();
    if (!user || user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    const { title, content, image_url, category, is_published } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (image_url !== undefined) updates.image_url = image_url;
    if (category !== undefined) updates.category = category;
    if (is_published !== undefined) updates.is_published = is_published;

    const { error } = await supabase!.from("blogs").update(updates).eq("id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // --- CMS: Ads ---
  app.get("/api/clan/:id/ads", async (req, res) => {
    const { data: ads, error } = await supabase!
      .from("ads")
      .select("*")
      .eq("clan_id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(ads);
  });

  app.post("/api/ads", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { data: user } = await supabase!.from("members").select("role").eq("id", userId).single();
    if (!user || user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    const { title, image_url, link_url, is_active, clan_id } = req.body;
    const id = `ad-${Date.now()}`;
    const { error } = await supabase!.from("ads").insert([{ id, title, image_url, link_url, is_active, clan_id }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id, success: true });
  });

  app.patch("/api/ads/:id", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { data: user } = await supabase!.from("members").select("role").eq("id", userId).single();
    if (!user || user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    const { title, image_url, link_url, is_active } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (image_url !== undefined) updates.image_url = image_url;
    if (link_url !== undefined) updates.link_url = link_url;
    if (is_active !== undefined) updates.is_active = is_active;

    const { error } = await supabase!.from("ads").update(updates).eq("id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // --- Messaging ---
  app.get("/api/messages", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { data: messages, error } = await supabase!
      .from("messages")
      .select("*, sender:members!sender_id(name)")
      .or(`receiver_id.eq.${userId},is_broadcast.eq.true`)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { data: user } = await supabase!.from("members").select("role, clan_id").eq("id", userId).single();
    if (!user) return res.status(403).json({ error: "Unauthorized" });

    const { receiver_id, is_broadcast, subject, body } = req.body;
    
    // Only admin can broadcast
    if (is_broadcast && user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can broadcast messages" });
    }

    const id = `msg-${Date.now()}`;
    const { error } = await supabase!.from("messages").insert([{ 
      id, 
      sender_id: userId, 
      receiver_id: is_broadcast ? null : receiver_id, 
      is_broadcast, 
      subject, 
      body, 
      clan_id: user.clan_id 
    }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id, success: true });
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    const userId = req.headers["x-user-id"] || "mem-1";
    const { error } = await supabase!
      .from("messages")
      .update({ is_read: true })
      .eq("id", req.params.id)
      .eq("receiver_id", userId);
    if (error) return res.status(500).json({ error: error.message });
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
    // In production (Docker/Local), serve from dist
    // On Vercel, static files are handled by Vercel's edge network
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Server Error:", err);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // Always listen on the specified port
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

export default app;
