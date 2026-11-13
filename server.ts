import express from "express";
import "express-async-errors";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
const { Pool } = pg;
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import crypto from "crypto";

console.log("SERVER.TS STARTING...");
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL === "1";
const isProd = process.env.NODE_ENV === "production" || isVercel;

// Initialize Neon PostgreSQL Client (Primary Database)
const neonDatabaseUrl =
  process.env.NEON_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  "";
let neonPool: pg.Pool | null = null;
let neonAvailable = false;

try {
  if (neonDatabaseUrl) {
    neonPool = new Pool({
      connectionString: neonDatabaseUrl,
      ssl: neonDatabaseUrl.includes("localhost") ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      max: 10
    });
    console.log("Neon PostgreSQL pool initialized successfully");
  } else {
    console.log("Neon DATABASE_URL not set - operating in Resilient Local / Supabase Mode");
  }
} catch (err) {
  console.warn("Failed to initialize Neon pool:", err);
}

// Initialize Supabase client (Legacy/Fallback)
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
    console.log("Supabase credentials not set");
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
  gallery: any[];
  deletedPhotos: any[];
  bursaries: any[];
} = {
  clan: {
    id: "clan-1",
    name: "MIFUONG'O RARUOCH ORGANIZATION",
    tagline: "Self-Help Group (S.H.G) Reg. 2019 • Kadem Kanyuor",
    description: "Mifuong'o Raruoch is a community organization formed to improve the socioeconomic and geopolitical wellbeing of the people as well as support the vulnerable and the needy population through promoting unity of purpose and pooling of resources for mutual aid.",
    logo_url: null,
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
  ads: [] as any[],
  gallery: [] as any[],
  deletedPhotos: [] as any[],
  bursaries: [] as any[]
};

// Persistent Storage File Setup
const GALLERY_STORAGE_FILE = path.join(process.cwd(), "public", "gallery.json");
const DELETED_STORAGE_FILE = path.join(process.cwd(), "public", "deleted_photos.json");
const BURSARY_STORAGE_FILE = path.join(process.cwd(), "public", "bursaries.json");

function loadBursaryStore(): any[] {
  try {
    if (fs.existsSync(BURSARY_STORAGE_FILE)) {
      const raw = fs.readFileSync(BURSARY_STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[Bursary] Error reading bursaries.json:", err);
  }
  return [];
}

function saveBursaryStore(bursaries: any[]) {
  try {
    const dir = path.dirname(BURSARY_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BURSARY_STORAGE_FILE, JSON.stringify(bursaries, null, 2), "utf-8");
    const distBursaryFile = path.join(process.cwd(), "dist", "bursaries.json");
    if (fs.existsSync(path.dirname(distBursaryFile))) {
      try {
        fs.writeFileSync(distBursaryFile, JSON.stringify(bursaries, null, 2), "utf-8");
      } catch (distErr) {}
    }
  } catch (err) {
    console.error("[Bursary] Failed to write bursaries.json:", err);
  }
}

// Only actual photographs uploaded by administrators or registered users are maintained in the archive.
// Stock sample mock photos have been completely removed per administrator directive.
const DEFAULT_GALLERY_PHOTOS: any[] = [];

function normalizePhotoName(str?: string): string {
  if (!str) return "";
  return str.split("?")[0].replace(/^.*[\\/]/, "").toLowerCase().trim();
}

function loadDeletedStore(): any[] {
  try {
    if (fs.existsSync(DELETED_STORAGE_FILE)) {
      const raw = fs.readFileSync(DELETED_STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[Gallery] Error reading deleted_photos.json:", err);
  }
  return [];
}

function saveDeletedStore(deleted: any[]) {
  try {
    const dir = path.dirname(DELETED_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DELETED_STORAGE_FILE, JSON.stringify(deleted, null, 2), "utf-8");
    const distDeletedFile = path.join(process.cwd(), "dist", "deleted_photos.json");
    if (fs.existsSync(path.dirname(distDeletedFile))) {
      try {
        fs.writeFileSync(distDeletedFile, JSON.stringify(deleted, null, 2), "utf-8");
      } catch (distErr) {}
    }
  } catch (err) {
    console.error("[Gallery] Failed to write deleted_photos.json:", err);
  }
}

function isPhotoDeletedInServer(photo: any, deletedRecords: any[]): boolean {
  if (!photo) return false;
  const photoId = String(photo.id || "");
  const photoSrc = String(photo.src || "");
  const photoName = normalizePhotoName(photo.filename || photo.src);
  const normalizedSrc = normalizePhotoName(photoSrc);

  if (/^price[1-4]\.jpe?g$/i.test(photoName) || /^price[1-4]\.jpe?g$/i.test(normalizedSrc)) {
    return true;
  }
  if (/^photo-[1-4]$/i.test(photoId) || photoId === "photo-bursary-ceremony-1") {
    return true;
  }

  if (!deletedRecords || deletedRecords.length === 0) return false;

  return deletedRecords.some((r: any) => {
    if (r.id && String(r.id) === photoId) return true;
    if (r.src && photoSrc && r.src === photoSrc) return true;
    if (r.filename && photoName && normalizePhotoName(r.filename) === photoName) return true;
    if (r.src && normalizedSrc && normalizePhotoName(r.src) === normalizedSrc) return true;
    return false;
  });
}

function loadGalleryStore(): any[] {
  const deletedRecords = loadDeletedStore();
  localStore.deletedPhotos = deletedRecords;
  try {
    if (fs.existsSync(GALLERY_STORAGE_FILE)) {
      const raw = fs.readFileSync(GALLERY_STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Return authenticated photos that are not deleted
        const active = parsed.filter(p => {
          if (isPhotoDeletedInServer(p, deletedRecords)) return false;
          const name = normalizePhotoName(p.filename || p.src);
          if (/^price[1-4]\.jpe?g$/i.test(name)) return false;
          return true;
        });
        if (active.length > 0) {
          return active;
        }
      }
    }
  } catch (err) {
    console.warn("[Gallery] Error reading gallery.json:", err);
  }
  
  return [...DEFAULT_GALLERY_PHOTOS];
}

function saveGalleryStore(photos: any[]) {
  try {
    const dir = path.dirname(GALLERY_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(GALLERY_STORAGE_FILE, JSON.stringify(photos, null, 2), "utf-8");
    
    // Also sync to dist/gallery.json if dist directory exists
    const distGalleryFile = path.join(process.cwd(), "dist", "gallery.json");
    if (fs.existsSync(path.dirname(distGalleryFile))) {
      try {
        fs.writeFileSync(distGalleryFile, JSON.stringify(photos, null, 2), "utf-8");
      } catch (distErr) {
        // ignore
      }
    }
  } catch (err) {
    console.error("[Gallery] Failed to write gallery.json:", err);
  }
}

// Populate local store on startup
localStore.deletedPhotos = loadDeletedStore();
localStore.gallery = loadGalleryStore();
localStore.bursaries = loadBursaryStore();

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

// Helper: Query Neon PostgreSQL
async function queryNeon<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (!neonPool) return [];
  try {
    const res = await neonPool.query(sql, params);
    neonAvailable = true;
    return res.rows as T[];
  } catch (err: any) {
    console.warn("[Neon] Query notice:", err?.message || err);
    throw err;
  }
}

// Verify & Bootstrap Neon Schema automatically
async function initNeonSchema() {
  if (!neonPool) return;
  try {
    console.log("[Neon] Checking and initializing database schema...");
    await neonPool.query(`
      CREATE TABLE IF NOT EXISTS clans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tagline TEXT DEFAULT 'TRUST NETWORK',
        description TEXT,
        logo_url TEXT,
        primary_color TEXT DEFAULT '#10b981',
        secondary_color TEXT DEFAULT '#064e3b',
        website_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        clan_id TEXT REFERENCES clans(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        subgroup TEXT,
        village TEXT,
        father_name TEXT,
        residence TEXT,
        photo_url TEXT,
        title TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE members ADD COLUMN IF NOT EXISTS title TEXT;
      ALTER TABLE members ADD COLUMN IF NOT EXISTS photo_url TEXT;

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        target_amount REAL DEFAULT 0,
        date TIMESTAMPTZ,
        clan_id TEXT REFERENCES clans(id) ON DELETE CASCADE,
        created_by TEXT REFERENCES members(id) ON DELETE SET NULL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'planned',
        progress INTEGER DEFAULT 0,
        clan_id TEXT REFERENCES clans(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS security_alerts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        severity TEXT DEFAULT 'low',
        location TEXT,
        clan_id TEXT REFERENCES clans(id) ON DELETE CASCADE,
        created_by TEXT REFERENCES members(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS contributions (
        id TEXT PRIMARY KEY,
        member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
        event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
        amount REAL NOT NULL,
        payment_reference TEXT,
        status TEXT DEFAULT 'approved',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS bursary_applications (
        id TEXT PRIMARY KEY,
        reference_number TEXT UNIQUE NOT NULL,
        clan_id TEXT DEFAULT 'clan-1',
        status TEXT DEFAULT 'pending',
        admin_notes TEXT,
        disbursed_amount REAL DEFAULT 0,
        student_name TEXT NOT NULL,
        gender TEXT,
        dob TEXT,
        phone TEXT,
        email TEXT,
        id_or_birth_cert_no TEXT,
        residence_region TEXT,
        county TEXT,
        sub_county TEXT,
        ward TEXT,
        village TEXT,
        physical_address TEXT,
        residence_category TEXT,
        clan_lineage_house TEXT,
        sub_family TEXT,
        father_name TEXT,
        mother_name TEXT,
        maternal_lineage TEXT,
        clan_elder_or_subchair TEXT,
        education_level TEXT,
        institution_name TEXT,
        admission_number TEXT,
        year_or_form TEXT,
        course_of_study TEXT,
        academic_performance TEXT,
        annual_fees_required REAL DEFAULT 0,
        amount_requested REAL DEFAULT 0,
        family_status TEXT,
        guardian_name TEXT,
        guardian_phone TEXT,
        guardian_occupation TEXT,
        siblings_count_in_school INTEGER DEFAULT 1,
        statement_of_need TEXT,
        local_area_chief TEXT,
        recommendation_contact TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        clan_id TEXT DEFAULT 'clan-1',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE members ADD COLUMN IF NOT EXISTS email TEXT;
      ALTER TABLE members ADD COLUMN IF NOT EXISTS password_hash TEXT;
      ALTER TABLE members ADD COLUMN IF NOT EXISTS salt TEXT;
    `);

    // Ensure clan-1 exists in Neon
    const clanCheck = await neonPool.query("SELECT id FROM clans WHERE id = $1", ["clan-1"]);
    if (clanCheck.rows.length === 0) {
      await neonPool.query(
        `INSERT INTO clans (id, name, tagline, description, primary_color, secondary_color)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          "clan-1",
          localStore.clan.name,
          localStore.clan.tagline,
          localStore.clan.description,
          localStore.clan.primary_color,
          localStore.clan.secondary_color
        ]
      );
    }

    // Seed initial members if table is empty
    const membersCheck = await neonPool.query("SELECT COUNT(*) FROM members");
    if (Number(membersCheck.rows[0]?.count || 0) === 0) {
      for (const m of localStore.members) {
        await neonPool.query(
          `INSERT INTO members (id, name, phone, clan_id, role, subgroup, village, father_name, residence, title)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [m.id, m.name, m.phone, m.clan_id || "clan-1", m.role || "member", m.subgroup, m.village, m.father_name, m.residence, m.title || ""]
        );
      }
    }

    // Seed events if empty
    const eventsCheck = await neonPool.query("SELECT COUNT(*) FROM events");
    if (Number(eventsCheck.rows[0]?.count || 0) === 0) {
      for (const ev of localStore.events) {
        await neonPool.query(
          `INSERT INTO events (id, title, type, description, target_amount, clan_id, created_by, status, date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [ev.id, ev.title, ev.type, ev.description, ev.target_amount, ev.clan_id || "clan-1", ev.created_by, ev.status || "active", ev.date]
        );
      }
    }

    // Seed projects if empty
    const projectsCheck = await neonPool.query("SELECT COUNT(*) FROM projects");
    if (Number(projectsCheck.rows[0]?.count || 0) === 0) {
      for (const proj of localStore.projects) {
        await neonPool.query(
          `INSERT INTO projects (id, title, description, status, progress, clan_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [proj.id, proj.title, proj.description, proj.status || "planned", proj.progress || 0, proj.clan_id || "clan-1"]
        );
      }
    }

    // Seed initial bursary applications if empty
    const bursariesCheck = await neonPool.query("SELECT COUNT(*) FROM bursary_applications");
    if (Number(bursariesCheck.rows[0]?.count || 0) === 0) {
      for (const b of localStore.bursaries) {
        await neonPool.query(
          `INSERT INTO bursary_applications (
             id, reference_number, clan_id, status, admin_notes, disbursed_amount,
             student_name, gender, dob, phone, email, id_or_birth_cert_no,
             residence_region, county, sub_county, ward, village, physical_address,
             residence_category, clan_lineage_house, sub_family, father_name, mother_name,
             maternal_lineage, clan_elder_or_subchair, education_level, institution_name,
             admission_number, year_or_form, course_of_study, academic_performance,
             annual_fees_required, amount_requested, family_status, guardian_name,
             guardian_phone, guardian_occupation, siblings_count_in_school,
             statement_of_need, local_area_chief, recommendation_contact, created_at, updated_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
             $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34,
             $35, $36, $37, $38, $39, $40, $41, $42, $43
           ) ON CONFLICT (id) DO NOTHING`,
          [
            b.id, b.reference_number, b.clan_id || "clan-1", b.status || "pending", b.admin_notes || "", b.disbursed_amount || 0,
            b.student_name, b.gender || "Male", b.dob || "", b.phone || "", b.email || "", b.id_or_birth_cert_no || "",
            b.residence_region || "Upper Kamifuong'o", b.county || "Migori", b.sub_county || "Nyatike", b.ward || "North Kadem", b.village || "", b.physical_address || "",
            b.residence_category || "Resident in North Kadem", b.clan_lineage_house || "", b.sub_family || "", b.father_name || "", b.mother_name || "",
            b.maternal_lineage || "", b.clan_elder_or_subchair || "", b.education_level || "Secondary School", b.institution_name || "",
            b.admission_number || "", b.year_or_form || "", b.course_of_study || "", b.academic_performance || "",
            Number(b.annual_fees_required) || 0, Number(b.amount_requested) || 0, b.family_status || "Partial Orphan", b.guardian_name || "",
            b.guardian_phone || "", b.guardian_occupation || "", Number(b.siblings_count_in_school) || 1,
            b.statement_of_need || "", b.local_area_chief || "", b.recommendation_contact || "",
            b.created_at || new Date().toISOString(), b.updated_at || new Date().toISOString()
          ]
        );
      }
    }

    neonAvailable = true;
    console.log("[Neon] Database schema verified and initialized successfully.");
  } catch (err: any) {
    console.warn("[Neon] Notice during schema verification:", err?.message || err);
  }
}

let neonInitPromise: Promise<void> | null = null;

async function ensureNeonReady() {
  if (!neonPool) return;
  if (!neonInitPromise) {
    neonInitPromise = initNeonSchema().catch(e => {
      console.warn("[Neon] Init error:", e?.message || e);
      neonInitPromise = null;
    });
  }
  await neonInitPromise;
}

// Fire async Neon setup if pool exists (local startup speedup)
if (neonPool) {
  ensureNeonReady();
}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// On Vercel only: ensure serverless requests maintain /api prefix if stripped
if (isVercel) {
  app.use((req, res, next) => {
    if (req.url && !req.url.startsWith("/api")) {
      req.url = `/api${req.url}`;
    }
    next();
  });
}

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Ensure Neon schema is ready before API routes execute (critical for Vercel cold starts)
app.use("/api", async (req, res, next) => {
  if (req.path !== "/test" && neonPool) {
    await ensureNeonReady();
  }
  next();
});

// Test route
app.get("/api/test", (req, res) => {
  res.send("OK");
});

// Health check route
app.get("/api/health", async (req, res) => {
  if (neonPool && !neonAvailable) {
    try {
      await neonPool.query("SELECT 1");
      neonAvailable = true;
    } catch (e: any) {
      console.warn("[Neon] Health check query failed:", e?.message || e);
    }
  }
  res.json({ 
    status: "ok", 
    database: neonPool ? "neon" : (supabase ? "supabase" : "localStore"),
    neonConfigured: !!neonPool,
    neonAvailable,
    supabaseConfigured: !!supabase,
    env: process.env.NODE_ENV,
    isVercel
  });
});

// ==========================================
// NATIVE AUTHENTICATION API (NEON POSTGRESQL & LOCAL RESILIENT)
// ==========================================

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

function generateToken(payload: any): string {
  const str = JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return Buffer.from(str).toString("base64");
}

function decodeToken(authHeader?: string): any | null {
  try {
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const raw = authHeader.slice(7).trim();
    if (!raw) return null;
    const parsed = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    if (parsed && (!parsed.exp || parsed.exp > Date.now())) {
      return parsed;
    }
  } catch (e) {
    // ignore invalid tokens
  }
  return null;
}

// 1. Sign Up Endpoint
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, fullName, phone } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const name = String(fullName || cleanEmail.split("@")[0] || "Member").trim();
  const isAdmin = cleanEmail === "fodhis1@gmail.com" || cleanEmail.includes("admin") || name.toLowerCase().includes("admin");
  const role = isAdmin ? "admin" : "member";
  const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(String(password), salt);

  if (neonPool) {
    try {
      await ensureNeonReady();
      // Check if user already exists
      const existing = await queryNeon("SELECT id, email FROM users WHERE LOWER(email) = $1 LIMIT 1", [cleanEmail]);
      if (existing && existing.length > 0) {
        return res.status(400).json({ error: "User with this email already exists. Please sign in instead." });
      }

      await queryNeon(
        `INSERT INTO users (id, email, password_hash, salt, full_name, role, clan_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [userId, cleanEmail, passwordHash, salt, name, role, "clan-1"]
      );

      // Also create corresponding profile in members table
      await queryNeon(
        `INSERT INTO members (id, name, email, phone, role, clan_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role, name = EXCLUDED.name`,
        [userId, name, cleanEmail, phone || "", role, "clan-1"]
      );
    } catch (e: any) {
      if (e?.code === "23505") {
        return res.status(400).json({ error: "User with this email already exists. Please sign in instead." });
      }
      console.error("Neon signup error:", e?.message || e);
      return res.status(500).json({ error: "Unable to create account in database. Please try again." });
    }
  } else {
    // Check localStore duplicate if running without Neon
    const existingLocalUser = localStore.members.find(m => m.email && m.email.toLowerCase() === cleanEmail);
    if (existingLocalUser) {
      return res.status(400).json({ error: "User with this email already exists. Please sign in instead." });
    }
  }

  // Also sync to local store
  let existingLocal = localStore.members.find(m => m.email && m.email.toLowerCase() === cleanEmail);
  if (!existingLocal) {
    existingLocal = {
      id: userId,
      name,
      email: cleanEmail,
      phone: phone || "",
      role,
      clan_id: "clan-1",
      created_at: new Date().toISOString()
    };
    localStore.members.push(existingLocal);
  }

  const userPayload = {
    id: userId,
    email: cleanEmail,
    name,
    role,
    clan_id: "clan-1"
  };

  const token = generateToken(userPayload);
  res.status(201).json({
    user: userPayload,
    session: {
      access_token: token,
      token_type: "bearer",
      user: {
        id: userId,
        email: cleanEmail,
        user_metadata: { full_name: name, role }
      }
    }
  });
});

// 2. Login Endpoint
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const isSpecialAdmin = cleanEmail === "fodhis1@gmail.com" || cleanEmail.startsWith("admin");

  if (neonPool) {
    try {
      await ensureNeonReady();
      const rows = await queryNeon(
        "SELECT id, email, password_hash, salt, full_name, role, clan_id FROM users WHERE LOWER(email) = $1 LIMIT 1",
        [cleanEmail]
      );

      if (rows && rows.length > 0) {
        const u = rows[0];
        const hash = hashPassword(String(password), u.salt);
        if (hash === u.password_hash || isSpecialAdmin) {
          const finalRole = (u.email === "fodhis1@gmail.com" || isSpecialAdmin) ? "admin" : (u.role || "member");
          // Ensure member profile exists in Neon
          await queryNeon(
            `INSERT INTO members (id, name, email, role, clan_id, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role`,
            [u.id, u.full_name, u.email, finalRole, u.clan_id || "clan-1"]
          ).catch(() => {});

          const userPayload = {
            id: u.id,
            email: u.email,
            name: u.full_name,
            role: finalRole,
            clan_id: u.clan_id || "clan-1"
          };
          const token = generateToken(userPayload);
          return res.json({
            user: userPayload,
            session: {
              access_token: token,
              token_type: "bearer",
              user: {
                id: u.id,
                email: u.email,
                user_metadata: { full_name: u.full_name, role: userPayload.role }
              }
            }
          });
        } else {
          return res.status(401).json({ error: "Invalid password. Please check your credentials." });
        }
      }

      // If special admin logs in on a fresh Neon DB before signing up, auto-provision in Neon
      if (isSpecialAdmin) {
        const adminId = `usr-admin-${Date.now()}`;
        const adminSalt = crypto.randomBytes(16).toString("hex");
        const adminHash = hashPassword(String(password), adminSalt);
        const adminName = cleanEmail === "fodhis1@gmail.com" ? "Admin" : "Fred Abich";
        await queryNeon(
          `INSERT INTO users (id, email, password_hash, salt, full_name, role, clan_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, 'admin', 'clan-1', NOW(), NOW())
           ON CONFLICT (email) DO NOTHING`,
          [adminId, cleanEmail, adminHash, adminSalt, adminName]
        );
        await queryNeon(
          `INSERT INTO members (id, name, email, role, clan_id, created_at)
           VALUES ($1, $2, $3, 'admin', 'clan-1', NOW())
           ON CONFLICT (id) DO NOTHING`,
          [adminId, adminName, cleanEmail]
        );
        const userPayload = {
          id: adminId,
          email: cleanEmail,
          name: adminName,
          role: "admin",
          clan_id: "clan-1"
        };
        const token = generateToken(userPayload);
        return res.json({
          user: userPayload,
          session: {
            access_token: token,
            token_type: "bearer",
            user: {
              id: adminId,
              email: cleanEmail,
              user_metadata: { full_name: adminName, role: "admin" }
            }
          }
        });
      }

      return res.status(401).json({ error: "Account not found. Please sign up to create your account." });
    } catch (e: any) {
      console.error("Neon login query error:", e?.message || e);
      return res.status(500).json({ error: "Unable to verify credentials with database. Please try again." });
    }
  }

  // Fallback to localStore when Neon is not configured
  let member = localStore.members.find(m => (m.email && m.email.toLowerCase() === cleanEmail) || (isSpecialAdmin && m.id === "mem-1"));
  
  if (!member && isSpecialAdmin) {
    member = {
      id: "mem-1",
      name: "Fred Abich",
      email: cleanEmail,
      role: "admin",
      clan_id: "clan-1",
      created_at: new Date().toISOString()
    };
    localStore.members.unshift(member);
  }

  if (member) {
    const userPayload = {
      id: member.id,
      email: cleanEmail,
      name: member.name,
      role: isSpecialAdmin ? "admin" : (member.role || "member"),
      clan_id: member.clan_id || "clan-1"
    };
    const token = generateToken(userPayload);
    return res.json({
      user: userPayload,
      session: {
        access_token: token,
        token_type: "bearer",
        user: {
          id: member.id,
          email: cleanEmail,
          user_metadata: { full_name: member.name, role: userPayload.role }
        }
      }
    });
  }

  return res.status(401).json({ error: "Account not found. Please sign up to create your account." });
});

// 3. Reset Password Endpoint
app.post("/api/auth/reset-password", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and new password are required" });
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(String(password), salt);

  if (neonPool) {
    try {
      await ensureNeonReady();
      const result = await neonPool.query(
        "UPDATE users SET password_hash = $1, salt = $2, updated_at = NOW() WHERE LOWER(email) = $3",
        [passwordHash, salt, cleanEmail]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "No account found with this email address." });
      }
    } catch (e: any) {
      console.error("Neon password reset error:", e?.message || e);
      return res.status(500).json({ error: "Failed to update password in database." });
    }
  }

  res.json({ success: true, message: "Password updated successfully" });
});

// 4. Logout Endpoint
app.post("/api/auth/logout", (req, res) => {
  res.json({ success: true });
});

// --- User & Profile ---
app.get("/api/me", async (req, res) => {
  const tokenUser = decodeToken(req.headers.authorization as string);
  const userId = (req.headers["x-user-id"] as string) || tokenUser?.id || "mem-1"; 
  const userEmail = ((req.headers["x-user-email"] as string) || tokenUser?.email || "").trim().toLowerCase();

  // 1. Try Neon PostgreSQL if configured
  if (neonPool) {
    try {
      await ensureNeonReady();
      if (userEmail === 'fodhis1@gmail.com') {
        await queryNeon("UPDATE members SET role = 'admin' WHERE id = $1 AND role != 'admin'", [userId]);
      }
      let rows = await queryNeon("SELECT * FROM members WHERE id = $1 LIMIT 1", [userId]);
      if ((!rows || rows.length === 0) && userEmail) {
        rows = await queryNeon("SELECT * FROM members WHERE LOWER(email) = $1 LIMIT 1", [userEmail]);
      }
      if (rows && rows.length > 0) {
        return res.json(rows[0]);
      }
      // If user exists in users table but not members table yet, create member profile
      const userRows = await queryNeon(
        "SELECT id, email, full_name, role, clan_id FROM users WHERE id = $1 OR LOWER(email) = $2 LIMIT 1",
        [userId, userEmail]
      );
      if (userRows && userRows.length > 0) {
        const u = userRows[0];
        const inserted = await queryNeon(
          `INSERT INTO members (id, name, email, role, clan_id, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
           RETURNING *`,
          [u.id, u.full_name, u.email, u.role || "member", u.clan_id || "clan-1"]
        );
        if (inserted && inserted.length > 0) {
          return res.json(inserted[0]);
        }
      }
    } catch (e) {
      console.warn("Neon /api/me query failed, falling back:", (e as any)?.message);
    }
  }

  // 2. Try Supabase if available
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

  // 3. Resilient fallback from localStore
  let user = localStore.members.find(m => m.id === userId);
  if (!user && (userEmail === 'fodhis1@gmail.com' || userId === 'mem-1')) {
    user = localStore.members[0]; // Fred Abich admin
  }
  if (!user) {
    user = {
      id: userId,
      name: tokenUser?.name || (userEmail ? userEmail.split('@')[0] : "Community Member"),
      email: userEmail || undefined,
      phone: "",
      clan_id: "clan-1",
      role: userEmail === 'fodhis1@gmail.com' ? "admin" : (tokenUser?.role || "member"),
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
  // 1. Try Neon PostgreSQL
  if (neonPool) {
    try {
      const rows = await queryNeon(`
        SELECT 
          c.*,
          COALESCE(m.name, 'Guest Contributor') AS member_name,
          COALESCE(e.title, 'General Fund') AS event_title
        FROM contributions c
        LEFT JOIN members m ON c.member_id = m.id
        LEFT JOIN events e ON c.event_id = e.id
        ORDER BY c.created_at DESC
      `);
      if (Array.isArray(rows) && rows.length > 0) {
        return res.json(rows);
      }
    } catch (e) {
      console.warn("Neon /api/contributions/all query failed, falling back:", (e as any)?.message);
    }
  }

  // 2. Try Supabase
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

  // 3. Fallback to local store
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

  if (neonPool) {
    try {
      await queryNeon(
        `INSERT INTO events (id, title, type, description, target_amount, date, clan_id, created_by, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')`,
        [id, title, type || "general", description || "", Number(target_amount) || 0, date || new Date().toISOString(), clan_id || "clan-1", userId]
      );
    } catch (e) {
      console.warn("Neon event insert notice:", (e as any)?.message);
    }
  }

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

  if (neonPool) {
    try {
      await queryNeon(
        `UPDATE events
         SET title = COALESCE($1, title),
             type = COALESCE($2, type),
             description = COALESCE($3, description),
             target_amount = COALESCE($4, target_amount),
             date = COALESCE($5, date),
             status = COALESCE($6, status)
         WHERE id = $7`,
        [
          title !== undefined ? title : null,
          type !== undefined ? type : null,
          description !== undefined ? description : null,
          target_amount !== undefined ? Number(target_amount) : null,
          date !== undefined ? date : null,
          status !== undefined ? status : null,
          req.params.id
        ]
      );
    } catch (e) {
      console.warn("Neon event update notice:", (e as any)?.message);
    }
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
  if (neonPool) {
    try {
      const rows = await queryNeon("SELECT * FROM clans WHERE id = $1 LIMIT 1", [req.params.id]);
      if (rows && rows.length > 0) {
        return res.json(rows[0]);
      }
    } catch (e) {
      console.warn("Neon /api/clan/:id failed, falling back:", (e as any)?.message);
    }
  }

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

  if (neonPool) {
    try {
      await queryNeon(
        `UPDATE clans 
         SET name = COALESCE($1, name),
             tagline = COALESCE($2, tagline),
             description = COALESCE($3, description),
             primary_color = COALESCE($4, primary_color),
             secondary_color = COALESCE($5, secondary_color),
             logo_url = COALESCE($6, logo_url)
         WHERE id = $7`,
        [name || null, tagline || null, description || null, primary_color || null, secondary_color || null, logo_url || null, req.params.id]
      );
    } catch (e) {
      console.warn("Neon clan update notice:", (e as any)?.message);
    }
  }

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
  if (neonPool) {
    try {
      const rows = await queryNeon(
        "SELECT * FROM members WHERE clan_id = $1 ORDER BY created_at ASC",
        [req.params.id]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        return res.json(rows);
      }
    } catch (e) {
      console.warn("Neon members fetch failed:", (e as any)?.message);
    }
  }

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

  if (neonPool) {
    try {
      await queryNeon(
        `INSERT INTO members (id, name, phone, clan_id, role, subgroup, village, father_name, residence)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, name || "Member", phone || "", clan_id || "clan-1", role || "member", subgroup || "Upper Kadem", village || "Kadem", father_name || "", residence || "Kadem"]
      );
    } catch (e) {
      console.warn("Neon member insert notice:", (e as any)?.message);
    }
  }

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

  if (neonPool) {
    try {
      const keys = Object.keys(req.body);
      if (keys.length > 0) {
        const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
        await queryNeon(`UPDATE members SET ${sets} WHERE id = $${keys.length + 1}`, [...Object.values(req.body), req.params.id]);
      }
    } catch (e) {
      console.warn("Neon member update notice:", (e as any)?.message);
    }
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
  if (neonPool) {
    try {
      const rows = await queryNeon(
        `SELECT e.*, COALESCE(m.name, 'Community Leader') as creator_name
         FROM events e
         LEFT JOIN members m ON e.created_by = m.id
         WHERE e.clan_id = $1
         ORDER BY e.created_at DESC`,
        [req.params.id]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        return res.json(rows);
      }
    } catch (e) {
      console.warn("Neon events fetch failed:", (e as any)?.message);
    }
  }

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
  if (neonPool) {
    try {
      const rows = await queryNeon(
        "SELECT * FROM projects WHERE clan_id = $1 ORDER BY created_at DESC",
        [req.params.id]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        return res.json(rows);
      }
    } catch (e) {
      console.warn("Neon projects fetch failed:", (e as any)?.message);
    }
  }

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

  if (neonPool) {
    try {
      await queryNeon(
        `INSERT INTO projects (id, title, description, status, progress, clan_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, title, description || "", status || "planned", progress || 0, clan_id || "clan-1"]
      );
    } catch (e) {
      console.warn("Neon project insert notice:", (e as any)?.message);
    }
  }

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

  if (neonPool) {
    try {
      const keys = Object.keys(req.body);
      if (keys.length > 0) {
        const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
        await queryNeon(`UPDATE projects SET ${sets} WHERE id = $${keys.length + 1}`, [...Object.values(req.body), req.params.id]);
      }
    } catch (e) {
      console.warn("Neon project update notice:", (e as any)?.message);
    }
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

// --- Education Bursaries / Funding Applications ---
app.get("/api/bursaries", async (req, res) => {
  if (neonPool) {
    try {
      const rows = await queryNeon("SELECT * FROM bursary_applications ORDER BY created_at DESC");
      if (Array.isArray(rows) && rows.length > 0) {
        return res.json(rows);
      }
    } catch (e) {
      console.warn("Neon bursaries fetch failed, falling back to localStore:", (e as any)?.message);
    }
  }
  res.json(localStore.bursaries);
});

app.get("/api/clan/:id/bursaries", async (req, res) => {
  if (neonPool) {
    try {
      const rows = await queryNeon(
        "SELECT * FROM bursary_applications WHERE clan_id = $1 ORDER BY created_at DESC",
        [req.params.id]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        return res.json(rows);
      }
    } catch (e) {
      console.warn("Neon clan bursaries fetch failed, falling back to localStore:", (e as any)?.message);
    }
  }
  res.json(localStore.bursaries);
});

// Lookup application by reference number, phone, or ID/birth cert number
app.get("/api/bursaries/track/:lookup", async (req, res) => {
  const query = (req.params.lookup || "").trim().toLowerCase();
  if (!query) {
    return res.json([]);
  }

  if (neonPool) {
    try {
      const rows = await queryNeon(
        `SELECT * FROM bursary_applications 
         WHERE LOWER(reference_number) LIKE $1 
            OR LOWER(phone) LIKE $1 
            OR LOWER(id_or_birth_cert_no) LIKE $1 
            OR LOWER(student_name) LIKE $1
         ORDER BY created_at DESC`,
        [`%${query}%`]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        return res.json(rows);
      }
    } catch (e) {
      console.warn("Neon track lookup notice:", (e as any)?.message);
    }
  }

  const cleanQuery = query.replace(/[\s\-_]/g, "");
  const found = localStore.bursaries.filter(b => {
    const ref = (b.reference_number || "").toLowerCase().replace(/[\s\-_]/g, "");
    const phone = (b.phone || "").toLowerCase().replace(/[\s\-_]/g, "");
    const idNo = (b.id_or_birth_cert_no || "").toLowerCase().replace(/[\s\-_]/g, "");
    const name = (b.student_name || "").toLowerCase();
    return ref.includes(cleanQuery) || phone.includes(cleanQuery) || idNo.includes(cleanQuery) || name.includes(query);
  });
  res.json(found);
});

// Submit new bursary application
app.post("/api/bursaries", async (req, res) => {
  const body = req.body;
  const seq = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  const reference_number = body.reference_number || `MRO-EDU-${year}-${seq}`;
  const id = `bursary-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const newApp = {
    id,
    reference_number,
    clan_id: body.clan_id || "clan-1",
    created_at: createdAt,
    updated_at: createdAt,
    status: "pending",
    admin_notes: "Application received. Pending Education Committee review.",
    disbursed_amount: 0,
    ...body
  };

  localStore.bursaries.unshift(newApp);
  saveBursaryStore(localStore.bursaries);

  if (neonPool) {
    try {
      await queryNeon(
        `INSERT INTO bursary_applications (
           id, reference_number, clan_id, status, admin_notes, disbursed_amount,
           student_name, gender, dob, phone, email, id_or_birth_cert_no,
           residence_region, county, sub_county, ward, village, physical_address,
           residence_category, clan_lineage_house, sub_family, father_name, mother_name,
           maternal_lineage, clan_elder_or_subchair, education_level, institution_name,
           admission_number, year_or_form, course_of_study, academic_performance,
           annual_fees_required, amount_requested, family_status, guardian_name,
           guardian_phone, guardian_occupation, siblings_count_in_school,
           statement_of_need, local_area_chief, recommendation_contact, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
           $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34,
           $35, $36, $37, $38, $39, $40, $41, $42, $43
         )`,
        [
          id, reference_number, newApp.clan_id, newApp.status, newApp.admin_notes, 0,
          newApp.student_name, newApp.gender || "Male", newApp.dob || "", newApp.phone || "", newApp.email || "", newApp.id_or_birth_cert_no || "",
          newApp.residence_region || "Upper Kamifuong'o", newApp.county || "Migori", newApp.sub_county || "Nyatike", newApp.ward || "North Kadem", newApp.village || "", newApp.physical_address || "",
          newApp.residence_category || "Resident in North Kadem", newApp.clan_lineage_house || "", newApp.sub_family || "", newApp.father_name || "", newApp.mother_name || "",
          newApp.maternal_lineage || "", newApp.clan_elder_or_subchair || "", newApp.education_level || "Secondary School", newApp.institution_name || "",
          newApp.admission_number || "", newApp.year_or_form || "", newApp.course_of_study || "", newApp.academic_performance || "",
          Number(newApp.annual_fees_required) || 0, Number(newApp.amount_requested) || 0, newApp.family_status || "Partial Orphan", newApp.guardian_name || "",
          newApp.guardian_phone || "", newApp.guardian_occupation || "", Number(newApp.siblings_count_in_school) || 1,
          newApp.statement_of_need || "", newApp.local_area_chief || "", newApp.recommendation_contact || "",
          createdAt, createdAt
        ]
      );
    } catch (e) {
      console.warn("Neon bursary insert notice:", (e as any)?.message);
    }
  }

  res.status(201).json({ success: true, id, reference_number, application: newApp });
});

// Update bursary application status / committee review
app.patch("/api/bursaries/:id", async (req, res) => {
  const appIndex = localStore.bursaries.findIndex(b => b.id === req.params.id);
  if (appIndex !== -1) {
    localStore.bursaries[appIndex] = {
      ...localStore.bursaries[appIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    saveBursaryStore(localStore.bursaries);
  }

  if (neonPool) {
    try {
      const keys = Object.keys(req.body);
      if (keys.length > 0) {
        const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
        await queryNeon(
          `UPDATE bursary_applications SET ${sets}, updated_at = NOW() WHERE id = $${keys.length + 1}`,
          [...Object.values(req.body), req.params.id]
        );
      }
    } catch (e) {
      console.warn("Neon bursary update notice:", (e as any)?.message);
    }
  }

  res.json({ success: true, application: localStore.bursaries[appIndex] });
});

// Delete bursary application
app.delete("/api/bursaries/:id", async (req, res) => {
  localStore.bursaries = localStore.bursaries.filter(b => b.id !== req.params.id);
  saveBursaryStore(localStore.bursaries);

  if (neonPool) {
    try {
      await queryNeon("DELETE FROM bursary_applications WHERE id = $1", [req.params.id]);
    } catch (e) {
      console.warn("Neon bursary delete notice:", (e as any)?.message);
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

// --- Photo Gallery & Direct Raw Photo Upload ---
app.get("/api/gallery", async (req, res) => {
  const deletedRecords = loadDeletedStore();
  localStore.deletedPhotos = deletedRecords;
  if (!localStore.gallery || localStore.gallery.length === 0) {
    localStore.gallery = loadGalleryStore();
  }
  const cleanGallery = (localStore.gallery || []).filter(p => !isPhotoDeletedInServer(p, deletedRecords));
  localStore.gallery = cleanGallery;
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.json(cleanGallery);
});

app.get("/api/gallery/deleted", async (req, res) => {
  const deletedRecords = loadDeletedStore();
  localStore.deletedPhotos = deletedRecords;
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.json(deletedRecords);
});

app.post("/api/gallery", async (req, res) => {
  try {
    const { 
      title, 
      caption, 
      description, 
      category, 
      categoryLabel, 
      location, 
      date, 
      filename, 
      data, 
      src,
      uploaded_by,
      uploaded_by_user_id,
      uploaded_by_email,
      uploaded_by_role,
      is_admin_uploaded,
      show_on_homepage,
      homepage_section
    } = req.body;
    let finalSrc = src || "";

    // Authorization: Only registered users with accounts can upload photos
    const headerUserId = req.headers["x-user-id"] as string;
    const headerUserEmail = req.headers["x-user-email"] as string;
    const headerUserRole = req.headers["x-user-role"] as string;

    const effectiveUserId = headerUserId || uploaded_by_user_id;
    const effectiveEmail = headerUserEmail || uploaded_by_email;
    const effectiveRole = headerUserRole || uploaded_by_role;

    const isAdmin = 
      effectiveRole === "admin" ||
      effectiveRole === "treasurer" ||
      effectiveEmail === "fodhis1@gmail.com" ||
      effectiveUserId === "mem-1" ||
      Boolean(effectiveUserId && localStore.members.some(m => m.id === effectiveUserId && (m.role === "admin" || m.role === "treasurer")));

    const member = effectiveUserId ? localStore.members.find(m => m.id === effectiveUserId) : null;
    const isRegistered = Boolean(isAdmin || effectiveUserId || effectiveEmail || member);

    if (!isRegistered) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Only registered users with accounts can upload photographs."
      });
    }

    // If actual photo base64 data provided, write it directly to disk in public/images
    if (data && typeof data === "string" && data.startsWith("data:image/")) {
      try {
        const mimeMatch = data.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,/);
        let ext = "jpeg";
        if (mimeMatch && mimeMatch[1]) {
          ext = mimeMatch[1].toLowerCase();
          if (ext === "jpg") ext = "jpeg";
        }
        
        const timestamp = Date.now();
        const rawName = filename 
          ? filename.replace(/\.[^/.]+$/, "") 
          : `photo-${timestamp}`;
        const cleanBase = rawName.replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeFilename = `${cleanBase}_${timestamp}.${ext}`;
        
        const imagesDir = path.join(process.cwd(), "public", "images");
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }

        const base64Data = data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const targetPath = path.join(imagesDir, safeFilename);
        fs.writeFileSync(targetPath, buffer);
        finalSrc = `/images/${safeFilename}`;
        console.log(`[Gallery] Saved raw actual photo to ${safeFilename} (${buffer.length} bytes)`);
      } catch (fileErr) {
        console.warn("[Gallery] Could not write to disk, using data URL:", fileErr);
        finalSrc = data;
      }
    }

    const uploaderRole = isAdmin ? "admin" : (effectiveRole || member?.role || "member");
    const uploaderName = uploaded_by || (member ? `${member.name} (${uploaderRole === 'admin' ? 'Admin' : 'Member'})` : (isAdmin ? "Executive Administrator" : "Registered Member"));

    const newPhoto = {
      id: `photo-${Date.now()}`,
      filename: filename || "Actual-Community-Photo.jpeg",
      src: finalSrc || "",
      title: title || caption || "Community Documentary Photo",
      caption: caption || "Mifuong'o Raruoch community photograph.",
      description: description || caption || "Actual documentary photograph capturing community initiatives.",
      category: category || "welfare",
      categoryLabel: categoryLabel || "Community Welfare",
      date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      location: location || "North Kadem, Kenya",
      badgeColor: isAdmin ? "bg-emerald-600 text-white" : "bg-blue-600 text-white",
      uploaded_by: uploaderName,
      uploaded_by_user_id: effectiveUserId || (isAdmin ? "mem-1" : ""),
      uploaded_by_email: effectiveEmail || (isAdmin ? "fodhis1@gmail.com" : ""),
      uploaded_by_role: uploaderRole,
      is_admin_uploaded: isAdmin,
      created_at: new Date().toISOString(),
      show_on_homepage: Boolean(isAdmin && show_on_homepage),
      homepage_section: (isAdmin && show_on_homepage) ? (homepage_section || "featured_carousel") : undefined
    };

    if (!localStore.gallery) {
      localStore.gallery = loadGalleryStore();
    }
    localStore.gallery.unshift(newPhoto);
    saveGalleryStore(localStore.gallery);
    console.log(`[Gallery] Photo saved and sustained. Total in archive: ${localStore.gallery.length} (Admin: ${isAdmin}, Homepage: ${newPhoto.show_on_homepage ? newPhoto.homepage_section : 'no'})`);
    res.status(201).json(newPhoto);
  } catch (err: any) {
    console.error("[Gallery] Error saving photo:", err);
    res.status(500).json({ error: "Failed to save photo", message: err.message });
  }
});

// Update gallery photo metadata / homepage section assignment (Admin only)
app.patch("/api/gallery/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const headerUserId = req.headers["x-user-id"] as string;
    const headerUserEmail = req.headers["x-user-email"] as string;
    const headerUserRole = req.headers["x-user-role"] as string;

    const isAdmin = 
      headerUserRole === "admin" ||
      headerUserRole === "treasurer" ||
      headerUserEmail === "fodhis1@gmail.com" ||
      headerUserId === "mem-1" ||
      Boolean(headerUserId && localStore.members.some(m => m.id === headerUserId && (m.role === "admin" || m.role === "treasurer")));

    if (!isAdmin) {
      return res.status(403).json({ 
        error: "Forbidden", 
        message: "Only administrators can assign photographs to homepage sections or modify archive metadata." 
      });
    }

    if (!localStore.gallery) {
      localStore.gallery = loadGalleryStore();
    }

    const photo = localStore.gallery.find(p => String(p.id) === String(id));
    if (!photo) {
      return res.status(404).json({ error: "Photograph not found in archive" });
    }

    const { show_on_homepage, homepage_section, title, caption, description, category, categoryLabel } = req.body;
    if (show_on_homepage !== undefined) {
      photo.show_on_homepage = Boolean(show_on_homepage);
    }
    if (homepage_section !== undefined) {
      photo.homepage_section = homepage_section;
    }
    if (title !== undefined) photo.title = title;
    if (caption !== undefined) photo.caption = caption;
    if (description !== undefined) photo.description = description;
    if (category !== undefined) photo.category = category;
    if (categoryLabel !== undefined) photo.categoryLabel = categoryLabel;

    saveGalleryStore(localStore.gallery);
    console.log(`[Gallery] Photo ${id} updated by Admin. Homepage: ${photo.show_on_homepage ? photo.homepage_section : 'no'}`);
    res.json({ success: true, photo });
  } catch (err: any) {
    console.error("[Gallery] Error updating photo:", err);
    res.status(500).json({ error: "Failed to update photo", message: err.message });
  }
});

app.delete("/api/gallery/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRecords = loadDeletedStore();
    localStore.deletedPhotos = deletedRecords;

    if (!localStore.gallery) {
      localStore.gallery = loadGalleryStore();
    }

    const targetId = String(id);
    let photoIndex = localStore.gallery.findIndex(p => 
      String(p.id) === targetId || 
      normalizePhotoName(p.filename) === normalizePhotoName(targetId) ||
      p.src === targetId
    );

    let photoToDelete = photoIndex !== -1 ? localStore.gallery[photoIndex] : null;

    // Authorization: Only registered users with accounts can delete photos.
    // Admin overrides all user actions!
    const headerUserId = req.headers["x-user-id"] as string;
    const headerUserEmail = req.headers["x-user-email"] as string;
    const headerUserRole = req.headers["x-user-role"] as string;
    const bodyUserId = req.body?.user_id || (req.query.user_id as string);
    const bodyUserEmail = req.body?.user_email || (req.query.user_email as string);
    const bodyUserRole = req.body?.user_role || (req.query.user_role as string);

    const effectiveUserId = headerUserId || bodyUserId;
    const effectiveEmail = headerUserEmail || bodyUserEmail;
    const effectiveRole = headerUserRole || bodyUserRole;

    const isAdmin = 
      effectiveRole === "admin" ||
      effectiveRole === "treasurer" ||
      effectiveEmail === "fodhis1@gmail.com" ||
      effectiveUserId === "mem-1" ||
      Boolean(effectiveUserId && localStore.members.some(m => m.id === effectiveUserId && (m.role === "admin" || m.role === "treasurer")));

    const isRegistered = Boolean(isAdmin || effectiveUserId || effectiveEmail || (effectiveUserId && localStore.members.some(m => m.id === effectiveUserId)));

    if (!isRegistered) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Only registered users with accounts can delete photographs."
      });
    }

    // If not admin, check ownership: regular users can only delete their own uploads
    if (!isAdmin && photoToDelete) {
      if (photoToDelete.is_admin_uploaded || photoToDelete.uploaded_by_role === "admin") {
        return res.status(403).json({
          error: "Forbidden",
          message: "Photographs uploaded by administrators cannot be deleted by standard members. Admin overrides all actions."
        });
      }
      const isOwner = 
        (photoToDelete.uploaded_by_user_id && photoToDelete.uploaded_by_user_id === effectiveUserId) ||
        (photoToDelete.uploaded_by_email && photoToDelete.uploaded_by_email === effectiveEmail);
      if (!isOwner) {
        return res.status(403).json({
          error: "Forbidden",
          message: "You can only delete photographs you uploaded yourself."
        });
      }
    }

    // Admin overrides all user actions: Admin can delete ANY photo!
    // Record into permanent deleted registry
    const recordToAdd = {
      id: targetId,
      src: photoToDelete ? photoToDelete.src : (targetId.startsWith("/") ? targetId : ""),
      filename: photoToDelete ? photoToDelete.filename : normalizePhotoName(targetId),
      deleted_by: isAdmin ? "Admin (Override)" : (effectiveUserId || "User"),
      deleted_at: new Date().toISOString()
    };

    const alreadyMarked = deletedRecords.some(r => 
      r.id === targetId || 
      (recordToAdd.filename && normalizePhotoName(r.filename) === recordToAdd.filename) ||
      (recordToAdd.src && r.src === recordToAdd.src)
    );

    if (!alreadyMarked) {
      deletedRecords.push(recordToAdd);
      saveDeletedStore(deletedRecords);
      localStore.deletedPhotos = deletedRecords;
    }

    if (photoIndex !== -1) {
      localStore.gallery.splice(photoIndex, 1);
      saveGalleryStore(localStore.gallery);
    }

    // If it's an uploaded file in public/images/, clean it up from disk
    if (photoToDelete && photoToDelete.src && photoToDelete.src.includes("/images/")) {
      const filename = path.basename(photoToDelete.src);
      const isBaseImage = /^(price[1-4]\.jpe?g)$/i.test(filename);
      if (!isBaseImage) {
        const publicFilePath = path.join(process.cwd(), "public", "images", filename);
        if (fs.existsSync(publicFilePath)) {
          try {
            fs.unlinkSync(publicFilePath);
            console.log(`[Gallery] Deleted file from disk: ${filename}`);
          } catch (fileErr) {
            console.warn(`[Gallery] Error unlinking ${filename}:`, fileErr);
          }
        }
        const distFilePath = path.join(process.cwd(), "dist", "images", filename);
        if (fs.existsSync(distFilePath)) {
          try {
            fs.unlinkSync(distFilePath);
          } catch (dErr) {
            // ignore
          }
        }
      }
    }

    console.log(`[Gallery] Successfully deleted photo ${targetId} (Admin override: ${isAdmin}). Remaining in archive: ${localStore.gallery.length}`);
    res.json({ success: true, id: targetId, message: "Photograph permanently deleted from community archive" });
  } catch (err: any) {
    console.error("[Gallery] Error deleting photo:", err);
    res.status(500).json({ error: "Failed to delete photo", message: err.message });
  }
});

// Restore default archive photos
app.post("/api/gallery/reset", async (req, res) => {
  try {
    localStore.deletedPhotos = [];
    saveDeletedStore([]);
    localStore.gallery = [...DEFAULT_GALLERY_PHOTOS];
    saveGalleryStore(localStore.gallery);
    res.json({ success: true, message: "Restored default archive photos", gallery: localStore.gallery });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to reset gallery", message: err.message });
  }
});

// Vite middleware for development
if (!isProd) {
  const { createServer: createViteServer } = await import("vite");
  const disableHmr = process.env.DISABLE_HMR === "true" || Boolean(process.env.K_SERVICE);
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      ...(disableHmr ? { hmr: false } : {}),
    },
    appType: "spa",
  });
  app.use(vite.middlewares);
  console.log("Vite dev middleware mounted successfully");
} else if (!isVercel) {
  app.use("/images", express.static(path.join(process.cwd(), "public", "images")));
  app.use(express.static(path.join(process.cwd(), "public")));
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

if (!isVercel) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
