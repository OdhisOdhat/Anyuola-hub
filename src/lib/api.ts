import { supabase } from "./supabase";
import { 
  fetchActiveGalleryPhotos, 
  deleteActivePhoto, 
  resetArchiveToDefaults 
} from "./galleryStore";

export const API_BASE = "/api";

let cachedHeaders: { [key: string]: string } | null = null;
let lastHeaderFetch = 0;
let headerPromise: Promise<{ [key: string]: string }> | null = null;
const HEADER_CACHE_TTL = 60000; // 1 minute

async function getHeaders(): Promise<{ [key: string]: string }> {
  const now = Date.now();
  console.log("getHeaders called");
  
  // Return cached headers if still valid
  if (cachedHeaders && (now - lastHeaderFetch < HEADER_CACHE_TTL)) {
    return cachedHeaders;
  }

  // If a fetch is already in progress, wait for it
  if (headerPromise) {
    return headerPromise;
  }

  // Create a new promise for the header fetch
  headerPromise = (async () => {
    try {
      console.log("Fetching session for headers...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session fetch error in getHeaders:", error);
        if (error.message.includes("Refresh Token Not Found") || error.message.includes("Invalid Refresh Token")) {
          console.warn("Invalid refresh token in getHeaders, signing out...");
          await supabase.auth.signOut();
          const fallbackHeaders = {
            "Content-Type": "application/json",
            "x-user-id": "mem-1",
            "x-user-email": ""
          };
          cachedHeaders = fallbackHeaders;
          lastHeaderFetch = Date.now();
          return fallbackHeaders;
        }
      }

      const userId = session?.user?.id || "mem-1";
      console.log("Session found, userId:", userId);
      
      const headers = {
        "Content-Type": "application/json",
        "x-user-id": userId,
        "x-user-email": session?.user?.email || ""
      };
      
      cachedHeaders = headers;
      lastHeaderFetch = Date.now();
      return headers;
    } catch (error) {
      console.error("Error in getHeaders:", error);
      throw error;
    } finally {
      headerPromise = null;
    }
  })();

  return headerPromise;
}

export async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    console.warn(`API responded with ${res.status}:`, text);
    try {
      return JSON.parse(text);
    } catch {
      return { error: "Server Error", message: text };
    }
  }
  return res.json();
}

export const DEFAULT_CLAN = {
  id: "clan-1",
  name: "MIFUONG'O RARUOCH ORGANIZATION",
  tagline: "Self-Help Group (S.H.G) Reg. 2019 • Kadem Kanyuor",
  description: "Mifuong'o Raruoch is a community organization formed to improve the socioeconomic and geopolitical wellbeing of the people as well as support the vulnerable and the needy population through promoting unity of purpose and pooling of resources for mutual aid.",
  logo_url: null,
  primary_color: "#10b981",
  secondary_color: "#064e3b",
  website_url: ""
};

export const DEFAULT_EVENTS = [
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
    date: "2026-10-15T09:00:00Z"
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
    date: "2026-11-01T10:00:00Z"
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
    date: "2026-12-20T08:30:00Z"
  }
];

export const DEFAULT_MEMBERS = [
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
    title: "Chairman"
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
    title: "Secretary"
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
    title: "Treasurer"
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
    title: "Organizing Secretary"
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
    title: "Technical Advisor"
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
    title: "Sub-chair Upper"
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
    title: "Sub-chair Lower"
  }
];

export const DEFAULT_PROJECTS = [
  {
    id: "proj-1",
    title: "Community Water Kiosk & Borehole Rehabilitation",
    description: "Providing clean drinking water and piping for domestic and school use across North Kadem villages.",
    status: "in_progress",
    progress: 65,
    clan_id: "clan-1"
  },
  {
    id: "proj-2",
    title: "Education Bursary Endowment Initiative",
    description: "A permanent revolving endowment guaranteeing secondary school fees for orphaned and vulnerable learners.",
    status: "in_progress",
    progress: 80,
    clan_id: "clan-1"
  },
  {
    id: "proj-3",
    title: "Mifuong'o Cultural Heritage & Digital Archive",
    description: "Documenting oral genealogies, ancient landmark settlements of Jokadem, and digital membership registries.",
    status: "planned",
    progress: 40,
    clan_id: "clan-1"
  }
];

export const DEFAULT_ALERTS = [
  {
    id: "alert-1",
    title: "North Kadem Dry-Season Advisory",
    description: "Community elders peace committee reminder regarding water points and grazing boundary protocols.",
    severity: "low",
    location: "North Kadem Region",
    clan_id: "clan-1",
    creator_name: "Fred Abich",
    created_at: "2026-09-01T00:00:00Z"
  }
];

export const DEFAULT_CONTRIBUTIONS = [
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
];

/**
 * BRANDING & CLAN MANAGEMENT
 */

export async function fetchClan(id: string) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/clan/${id}`, { headers });
    const data = await handleResponse(res);
    return data?.id ? data : DEFAULT_CLAN;
  } catch {
    return DEFAULT_CLAN;
  }
}

export async function updateClanBranding(id: string, data: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/clan/${id}/branding`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * AUTH & USER
 */

export async function fetchMe() {
  try {
    const headers = await getHeaders();
    const url = `${window.location.origin}${API_BASE}/me`;
    const res = await fetch(url, { headers });
    const data = await handleResponse(res);
    return data?.id ? data : DEFAULT_MEMBERS[0];
  } catch (error) {
    console.warn("fetchMe fallback used:", error);
    return DEFAULT_MEMBERS[0];
  }
}

/**
 * MEMBERS
 */

export async function fetchMembers(clanId: string) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/clan/${clanId}/members`, { headers });
    const data = await handleResponse(res);
    return Array.isArray(data) ? data : DEFAULT_MEMBERS;
  } catch {
    return DEFAULT_MEMBERS;
  }
}

export async function createMember(member: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/members`, {
    method: "POST",
    headers,
    body: JSON.stringify(member),
  });
  return handleResponse(res);
}

export async function updateMember(id: string, data: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/members/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * EVENTS / WELFARE
 */

export async function fetchEvents(clanId: string) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/clan/${clanId}/events`, { headers });
    const data = await handleResponse(res);
    return Array.isArray(data) ? data : DEFAULT_EVENTS;
  } catch {
    return DEFAULT_EVENTS;
  }
}

export async function createEvent(event: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers,
    body: JSON.stringify(event),
  });
  return handleResponse(res);
}

export async function updateEvent(id: string, data: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * PROJECTS
 */

export async function fetchProjects(clanId: string) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/clan/${clanId}/projects`, { headers });
    const data = await handleResponse(res);
    return Array.isArray(data) ? data : DEFAULT_PROJECTS;
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export async function createProject(project: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers,
    body: JSON.stringify(project),
  });
  return handleResponse(res);
}

export async function updateProject(id: string, data: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * SECURITY ALERTS
 */

export async function fetchAlerts(clanId: string) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/clan/${clanId}/alerts`, { headers });
    const data = await handleResponse(res);
    return Array.isArray(data) ? data : DEFAULT_ALERTS;
  } catch {
    return DEFAULT_ALERTS;
  }
}

export async function createAlert(alert: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/alerts`, {
    method: "POST",
    headers,
    body: JSON.stringify(alert),
  });
  return handleResponse(res);
}

export async function updateAlert(id: string, data: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/alerts/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * CONTRIBUTIONS / FINANCE
 */

export async function fetchAllContributions() {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/contributions/all`, { headers });
    const data = await handleResponse(res);
    return Array.isArray(data) ? data : DEFAULT_CONTRIBUTIONS;
  } catch {
    return DEFAULT_CONTRIBUTIONS;
  }
}

export async function createContribution(contribution: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/contributions`, {
    method: "POST",
    headers,
    body: JSON.stringify(contribution),
  });
  return handleResponse(res);
}

export async function updateContribution(id: string, data: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/contributions/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * CMS: PAGES
 */

export async function fetchPages(clanId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/clan/${clanId}/pages`, { headers });
  return handleResponse(res);
}

export async function createPage(page: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/pages`, {
    method: "POST",
    headers,
    body: JSON.stringify(page),
  });
  return handleResponse(res);
}

export async function updatePage(id: string, data: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/pages/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * CMS: BLOGS
 */

export async function fetchBlogs(clanId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/clan/${clanId}/blogs`, { headers });
  return handleResponse(res);
}

export async function createBlog(blog: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/blogs`, {
    method: "POST",
    headers,
    body: JSON.stringify(blog),
  });
  return handleResponse(res);
}

export async function updateBlog(id: string, data: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/blogs/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * CMS: ADS
 */

export async function fetchAds(clanId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/clan/${clanId}/ads`, { headers });
  return handleResponse(res);
}

export async function createAd(ad: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/ads`, {
    method: "POST",
    headers,
    body: JSON.stringify(ad),
  });
  return handleResponse(res);
}

export async function updateAd(id: string, data: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/ads/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function fetchFinancialReport(clanId: string) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/clan/${clanId}/financial-report`, { headers });
    const data = await handleResponse(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * MESSAGING
 */

export async function fetchMessages() {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/messages`, { headers });
    const data = await handleResponse(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function sendMessage(message: any) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify(message),
  });
  return handleResponse(res);
}

export async function markMessageRead(id: string) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/messages/${id}/read`, {
    method: "PATCH",
    headers,
  });
  return handleResponse(res);
}

/**
 * GALLERY & ACTUAL PHOTO ARCHIVES (Sustained & Visible to All Visitors)
 */

export async function fetchGalleryPhotos() {
  return await fetchActiveGalleryPhotos();
}

export async function uploadGalleryPhoto(photoData: any, userContext?: { id?: string; role?: string; email?: string }) {
  let headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    headers = await getHeaders();
  } catch (err) {
    console.warn("Failed to get auth headers for upload, using fallback:", err);
  }
  if (userContext?.id) headers["x-user-id"] = userContext.id;
  if (userContext?.role) headers["x-user-role"] = userContext.role;
  if (userContext?.email) headers["x-user-email"] = userContext.email;

  const res = await fetch(`${API_BASE}/gallery`, {
    method: "POST",
    headers,
    body: JSON.stringify(photoData),
  });
  return handleResponse(res);
}

export async function updateGalleryPhoto(
  id: string, 
  data: any, 
  userContext?: { id?: string; role?: string; email?: string }
) {
  let headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    headers = await getHeaders();
  } catch (err) {
    console.warn("Failed to get auth headers for update, using fallback:", err);
  }
  if (userContext?.id) headers["x-user-id"] = userContext.id;
  if (userContext?.role) headers["x-user-role"] = userContext.role;
  if (userContext?.email) headers["x-user-email"] = userContext.email;

  const res = await fetch(`${API_BASE}/gallery/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteGalleryPhoto(id: string, src?: string, filename?: string, userContext?: { id?: string; role?: string; email?: string }) {
  return await deleteActivePhoto({ id, src, filename }, userContext);
}

export async function resetGalleryPhotos() {
  return await resetArchiveToDefaults();
}
