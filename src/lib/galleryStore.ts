import { useState, useEffect, useCallback } from "react";
import { API_BASE, handleResponse } from "./api";

export type HomepageSection = 
  | "hero" 
  | "bursary" 
  | "consultation" 
  | "vetting" 
  | "welfare" 
  | "heritage" 
  | "featured_carousel" 
  | "none";

export interface HomepageSectionOption {
  id: HomepageSection;
  label: string;
  description: string;
}

export const HOMEPAGE_SECTIONS: HomepageSectionOption[] = [
  { 
    id: "hero", 
    label: "Hero Showcase Banner", 
    description: "Main top banner on the homepage establishing the documentary visual identity." 
  },
  { 
    id: "bursary", 
    label: "Bursary Cheques Distribution Card", 
    description: "Featured in the 'Leadership in Action' section illustrating education cheque issuing." 
  },
  { 
    id: "consultation", 
    label: "Civil & Synod Consultations Card", 
    description: "Featured in the 'Leadership in Action' section showing executive meetings with civil leaders." 
  },
  { 
    id: "vetting", 
    label: "Application Vetting & Integrity Banner", 
    description: "Displayed in the due diligence verification bar for education and welfare." 
  },
  { 
    id: "welfare", 
    label: "Community Welfare & Well-Wishers Giving", 
    description: "Showcased in the donation and well-wishers giving fund section." 
  },
  { 
    id: "heritage", 
    label: "Ancestral Heritage & Descendancy Section", 
    description: "Showcased alongside the historical heritage and 14 lineage houses." 
  },
  { 
    id: "featured_carousel", 
    label: "Homepage Highlight Reel", 
    description: "Featured in the homepage documentary highlights carousel." 
  },
  { 
    id: "none", 
    label: "Gallery Archive Only", 
    description: "Accessible in the public photo gallery without homepage placement." 
  },
];

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
  uploaded_by_user_id?: string;
  uploaded_by_email?: string;
  uploaded_by_role?: string;
  is_admin_uploaded?: boolean;
  created_at?: string;
  show_on_homepage?: boolean;
  homepage_section?: HomepageSection;
}

export interface DeletedPhotoRecord {
  id: string;
  src?: string;
  filename?: string;
  deleted_by?: string;
  deleted_at?: string;
  reason?: string;
}

// Only actual photographs uploaded by administrators or registered users are maintained in the archive.
// Stock sample mock photos have been completely removed per administrator directive.
export const DEFAULT_GALLERY_PHOTOS: GalleryPhoto[] = [];

const STORAGE_DELETED_KEY = "mifuongo_deleted_photos_registry_v1";
const STORAGE_ACTIVE_CACHE_KEY = "mifuongo_active_photos_cache_v1";

// Helper: Normalize strings for robust matching (ignoring slashes, case, and query params)
function normalizeName(str?: string): string {
  if (!str) return "";
  return str.split("?")[0].replace(/^.*[\\/]/, "").toLowerCase().trim();
}

/**
 * Get all deleted photo records stored in local client cache
 */
export function getDeletedPhotoRecords(): DeletedPhotoRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Ensure Price1.jpeg is never treated as deleted
    const filtered = parsed.filter(r => 
      normalizeName(r.filename) !== "price1.jpeg" && 
      normalizeName(r.src) !== "price1.jpeg" && 
      r.id !== "photo-bursary-ceremony-1"
    );
    if (filtered.length !== parsed.length) {
      localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (err) {
    console.warn("Failed to read deleted photo records:", err);
    return [];
  }
}

/**
 * Merge server deleted records into local storage without triggering recursive broadcast loops
 */
export function mergeServerDeletedRecords(serverRecords: DeletedPhotoRecord[]) {
  try {
    const current = getDeletedPhotoRecords();
    let changed = false;
    for (const record of serverRecords) {
      if (!record || !record.id) continue;
      const cleanId = String(record.id);
      const cleanSrc = record.src || "";
      const cleanFilename = record.filename || normalizeName(cleanSrc);
      const exists = current.some(
        r => r.id === cleanId || 
             (cleanFilename && normalizeName(r.filename) === normalizeName(cleanFilename)) ||
             (cleanSrc && r.src === cleanSrc)
      );
      if (!exists) {
        current.push({
          id: cleanId,
          src: cleanSrc,
          filename: cleanFilename,
          deleted_at: record.deleted_at || new Date().toISOString()
        });
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(current));
    }
  } catch (err) {
    console.warn("Failed to merge server deleted records:", err);
  }
}

/**
 * Record a photo as deleted across its ID, filename, and image URL
 */
export function markPhotoDeleted(record: { id: string; src?: string; filename?: string }, broadcast: boolean = false) {
  try {
    const current = getDeletedPhotoRecords();
    const cleanId = String(record.id);
    const cleanSrc = record.src || "";
    const cleanFilename = record.filename || normalizeName(cleanSrc);

    // Check if already in list
    const exists = current.some(
      r => r.id === cleanId || 
           (cleanFilename && normalizeName(r.filename) === normalizeName(cleanFilename)) ||
           (cleanSrc && r.src === cleanSrc)
    );

    if (!exists) {
      current.push({
        id: cleanId,
        src: cleanSrc,
        filename: cleanFilename,
        deleted_at: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(current));
    }

    // Also purge from active photos cache
    try {
      const activeRaw = localStorage.getItem(STORAGE_ACTIVE_CACHE_KEY);
      if (activeRaw) {
        const activeList = JSON.parse(activeRaw);
        if (Array.isArray(activeList)) {
          const filtered = activeList.filter(p => !isPhotoDeleted(p));
          localStorage.setItem(STORAGE_ACTIVE_CACHE_KEY, JSON.stringify(filtered));
        }
      }
    } catch {
      // ignore
    }

    // Broadcast change only when requested (e.g. active user deletion action)
    if (broadcast && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("gallery_updated", { detail: { deletedId: cleanId } }));
    }
  } catch (err) {
    console.error("Failed to mark photo deleted in client storage:", err);
  }
}

/**
 * Check if a given photo, src, id, or filename is flagged as deleted
 */
export function isPhotoDeleted(photoOrIdentifier: { id?: string; src?: string; filename?: string } | string): boolean {
  if (!photoOrIdentifier) return false;

  let testId = "";
  let testSrc = "";
  let testFilename = "";

  if (typeof photoOrIdentifier === "string") {
    testId = photoOrIdentifier;
    testSrc = photoOrIdentifier;
    testFilename = normalizeName(photoOrIdentifier);
  } else {
    testId = photoOrIdentifier.id ? String(photoOrIdentifier.id) : "";
    testSrc = photoOrIdentifier.src || "";
    testFilename = photoOrIdentifier.filename 
      ? normalizeName(photoOrIdentifier.filename) 
      : normalizeName(photoOrIdentifier.src);
  }

  // Stock mock sample photos are purged from archive
  if (/^price[1-4]\.jpe?g$/i.test(testFilename) || /^price[1-4]\.jpe?g$/i.test(normalizeName(testSrc))) {
    return true;
  }
  if (/^photo-[1-4]$/i.test(testId) || testId === "photo-bursary-ceremony-1") {
    return true;
  }

  const deletedRecords = getDeletedPhotoRecords();
  if (deletedRecords.length === 0) return false;

  const normalizedTestSrc = normalizeName(testSrc);

  return deletedRecords.some(r => {
    if (testId && String(r.id) === String(testId)) return true;
    if (r.src && testSrc && r.src === testSrc) return true;
    if (r.filename && testFilename && normalizeName(r.filename) === testFilename) return true;
    if (r.src && normalizedTestSrc && normalizeName(r.src) === normalizedTestSrc) return true;
    return false;
  });
}

/**
 * Clear deleted photos records (e.g., when Admin restores archive defaults)
 */
export function clearDeletedPhotosRegistry() {
  try {
    localStorage.removeItem(STORAGE_DELETED_KEY);
    localStorage.removeItem(STORAGE_ACTIVE_CACHE_KEY);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("gallery_updated", { detail: { reset: true } }));
    }
  } catch (err) {
    console.warn("Failed to clear deleted photos registry:", err);
  }
}

/**
 * Filter an array of photos, ensuring NO deleted photo is included
 */
export function filterActivePhotos(photos: GalleryPhoto[]): GalleryPhoto[] {
  if (!Array.isArray(photos)) return [];
  return photos.filter(photo => !isPhotoDeleted(photo));
}

let inFlightFetch: Promise<GalleryPhoto[]> | null = null;
let lastFetchTimestamp = 0;
const FETCH_COOLDOWN_MS = 2500; // Throttle background fetches to once every 2.5s

/**
 * Fetch active photos from server, syncing server deleted registry and client deleted registry
 */
export async function fetchActiveGalleryPhotos(force = false): Promise<GalleryPhoto[]> {
  const now = Date.now();

  // If a fetch is already in flight, return the existing shared promise
  if (inFlightFetch) {
    return inFlightFetch;
  }

  // If recent fetch occurred and not forced, return cached data to prevent network spamming
  if (!force && now - lastFetchTimestamp < FETCH_COOLDOWN_MS) {
    try {
      const cached = localStorage.getItem(STORAGE_ACTIVE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return filterActivePhotos(parsed);
        }
      }
    } catch {
      // ignore
    }
  }

  inFlightFetch = (async () => {
    let serverList: GalleryPhoto[] = [];

    // 1. Fetch server deleted registry first if available
    try {
      const delRes = await fetch(`${API_BASE}/gallery/deleted`, {
        headers: { "Cache-Control": "no-cache" }
      });
      const delContentType = delRes.headers.get("content-type") || "";
      if (delRes.ok && delContentType.includes("json")) {
        const serverDeleted = await delRes.json();
        if (Array.isArray(serverDeleted)) {
          mergeServerDeletedRecords(serverDeleted);
        }
      }
    } catch {
      // Non-blocking
    }

    // 2. Fetch main gallery from API
    try {
      const res = await fetch(`${API_BASE}/gallery`, {
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      });
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("json")) {
        const data = await res.json();
        if (Array.isArray(data)) {
          serverList = data;
        }
      }
    } catch (err) {
      console.warn("[GalleryStore] fetch active photos error, trying static:", err);
    }

    // 3. If server didn't return an array, check static /gallery.json
    if (serverList.length === 0) {
      try {
        const staticRes = await fetch("/gallery.json", { cache: "no-store" });
        const staticContentType = staticRes.headers.get("content-type") || "";
        if (staticRes.ok && staticContentType.includes("json")) {
          const staticData = await staticRes.json();
          if (Array.isArray(staticData)) {
            serverList = staticData;
          }
        }
      } catch {
        // ignore
      }
    }

    // 4. If still empty, use defaults
    if (serverList.length === 0) {
      serverList = [...DEFAULT_GALLERY_PHOTOS];
    }

    // 5. CRITICAL: Strictly filter out any photo deleted by admin
    const activePhotos = filterActivePhotos(serverList);

    // Cache filtered list quietly
    try {
      localStorage.setItem(STORAGE_ACTIVE_CACHE_KEY, JSON.stringify(activePhotos));
    } catch {
      // ignore
    }

    lastFetchTimestamp = Date.now();
    return activePhotos;
  })().finally(() => {
    inFlightFetch = null;
  });

  return inFlightFetch;
}

/**
 * Perform deletion on server and client
 */
export async function deleteActivePhoto(
  photo: GalleryPhoto | { id: string; src?: string; filename?: string },
  userContext?: { id?: string; role?: string; email?: string }
) {
  // 1. Mark in client registry immediately and broadcast to UI
  markPhotoDeleted({
    id: photo.id,
    src: photo.src,
    filename: photo.filename
  }, true);

  // 2. Call server endpoint with authentication headers
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (userContext?.id) headers["x-user-id"] = userContext.id;
  if (userContext?.role) headers["x-user-role"] = userContext.role;
  if (userContext?.email) headers["x-user-email"] = userContext.email;

  try {
    const res = await fetch(`${API_BASE}/gallery/${photo.id}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({
        user_id: userContext?.id,
        user_role: userContext?.role,
        user_email: userContext?.email
      })
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn("Server delete call warning:", err);
    return { success: true, message: "Deleted from client registry" };
  }
}

/**
 * Reset gallery to default archives
 */
export async function resetArchiveToDefaults() {
  clearDeletedPhotosRegistry();
  try {
    const res = await fetch(`${API_BASE}/gallery/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn("Reset API error:", err);
    return { success: true, gallery: DEFAULT_GALLERY_PHOTOS };
  }
}

/**
 * React hook to listen to active gallery photos across all pages
 */
export function useGalleryPhotos() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_ACTIVE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return filterActivePhotos(parsed);
        }
      }
    } catch {
      // ignore
    }
    return filterActivePhotos(DEFAULT_GALLERY_PHOTOS);
  });
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async (force = false) => {
    setIsLoading(true);
    try {
      const active = await fetchActiveGalleryPhotos(force);
      setPhotos(active);
    } catch (err) {
      console.warn("Error refreshing gallery photos:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload(false);

    let debounceTimer: any = null;
    const handleUpdate = () => {
      // Immediately filter existing in-memory photos so deleted photos disappear instantly
      setPhotos(prev => filterActivePhotos(prev));
      // Debounce the network reload to prevent cascading storms
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        reload(true);
      }, 400);
    };

    window.addEventListener("gallery_updated", handleUpdate);

    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener("gallery_updated", handleUpdate);
    };
  }, [reload]);

  return { photos, isLoading, reload };
}
