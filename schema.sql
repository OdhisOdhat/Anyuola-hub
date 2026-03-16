-- 1. Create Clans Table if it doesn't exist, or update it if it does
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

-- If the table existed but missed the branding columns, this adds them safely:
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clans' AND column_name='tagline') THEN
    ALTER TABLE clans ADD COLUMN tagline TEXT DEFAULT 'TRUST NETWORK';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clans' AND column_name='logo_url') THEN
    ALTER TABLE clans ADD COLUMN logo_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clans' AND column_name='primary_color') THEN
    ALTER TABLE clans ADD COLUMN primary_color TEXT DEFAULT '#10b981';
  END IF;
END $$;

-- 2. Create Members Table
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add photo_url column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='photo_url') THEN
    ALTER TABLE members ADD COLUMN photo_url TEXT;
  END IF;
END $$;

-- 3. Create Events (Welfare Cases) Table
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

-- 4. Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planned',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  clan_id TEXT REFERENCES clans(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Security Alerts Table
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

-- 6. Create Contributions Table
CREATE TABLE IF NOT EXISTS contributions (
  id TEXT PRIMARY KEY,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  payment_reference TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Subgroups Table
CREATE TABLE IF NOT EXISTS subgroups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  clan_id TEXT REFERENCES clans(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create Pages Table
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  is_published BOOLEAN DEFAULT true,
  clan_id TEXT REFERENCES clans(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clan_id, slug)
);

-- 10. Create Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT REFERENCES members(id) ON DELETE SET NULL,
  image_url TEXT,
  category TEXT DEFAULT 'General',
  is_published BOOLEAN DEFAULT true,
  clan_id TEXT REFERENCES clans(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add category column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blogs' AND column_name='category') THEN
    ALTER TABLE blogs ADD COLUMN category TEXT DEFAULT 'General';
  END IF;
END $$;

-- 11. Create Ads Table
CREATE TABLE IF NOT EXISTS ads (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  clan_id TEXT REFERENCES clans(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  receiver_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  is_broadcast BOOLEAN DEFAULT false,
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  clan_id TEXT REFERENCES clans(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

---
--- SEED DATA (Uses ON CONFLICT to avoid duplicate key errors)
---

-- 8. Seed Initial Data
INSERT INTO clans (id, name, tagline, description, primary_color) 
VALUES (
  'clan-1', 
  'My Anyuola App', 
  'TRUST NETWORK', 
  'A vibrant community dedicated to mutual support and development.',
  '#10b981'
) ON CONFLICT (id) DO UPDATE SET 
  tagline = EXCLUDED.tagline, 
  primary_color = EXCLUDED.primary_color;

INSERT INTO members (id, name, phone, clan_id, role) 
VALUES ('mem-1', 'John Doe', '0712345678', 'clan-1', 'member')
ON CONFLICT (id) DO NOTHING;

INSERT INTO members (id, name, phone, clan_id, role) 
VALUES ('mem-wuora', 'Wuora Odhis', '0700000000', 'clan-1', 'member')
ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (id, title, description, status, progress, clan_id) 
VALUES ('proj-1', 'Community Water Well', 'Drilling a solar-powered borehole for the village.', 'ongoing', 45, 'clan-1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, title, type, description, date, clan_id, created_by) 
VALUES ('ev-1', 'Education Fund for Sarah', 'education', 'Raising funds for Sarah university tuition.', '2026-04-01', 'clan-1', 'mem-1')
ON CONFLICT (id) DO NOTHING;
