import { supabase } from "./supabase";

export const API_BASE = "/api";

let cachedHeaders: { [key: string]: string } | null = null;
let lastHeaderFetch = 0;
let headerPromise: Promise<{ [key: string]: string }> | null = null;
const HEADER_CACHE_TTL = 60000; // 1 minute

async function getHeaders(): Promise<{ [key: string]: string }> {
  const now = Date.now();
  
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
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || "mem-1";
      
      const headers = {
        "Content-Type": "application/json",
        "x-user-id": userId,
        "x-user-email": session?.user?.email || ""
      };
      
      cachedHeaders = headers;
      lastHeaderFetch = Date.now();
      return headers;
    } finally {
      headerPromise = null;
    }
  })();

  return headerPromise;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    console.error(`API Error [${res.status}]: ${text}`);
    try {
      return JSON.parse(text);
    } catch {
      return { error: "Server Error", message: text };
    }
  }
  return res.json();
}

/**
 * BRANDING & CLAN MANAGEMENT
 */

export async function fetchClan(id: string) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/clan/${id}`, { headers });
  return handleResponse(res);
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
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/me`, { headers });
  return handleResponse(res);
}

/**
 * MEMBERS
 */

export async function fetchMembers(clanId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/clan/${clanId}/members`, { headers });
  return handleResponse(res);
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
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/clan/${clanId}/events`, { headers });
  return handleResponse(res);
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
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/clan/${clanId}/projects`, { headers });
  return handleResponse(res);
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
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/clan/${clanId}/alerts`, { headers });
  return handleResponse(res);
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
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/contributions/all`, { headers });
  return handleResponse(res);
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
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/clan/${clanId}/financial-report`, { headers });
  return handleResponse(res);
}

/**
 * MESSAGING
 */

export async function fetchMessages() {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/messages`, { headers });
  return handleResponse(res);
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
