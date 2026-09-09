import { useState, useEffect, useCallback } from "react";
import { API_BASE, handleResponse } from "./api";

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
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to read deleted photo records:", err);
    return [];
  }
}

/**
 * Record a photo as deleted across its ID, filename, and image URL
 */
export function markPhotoDeleted(record: { id: string; src?: string; filename?: string }) {
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

    // Broadcast change to all pages and tabs
    if (typeof window !== "undefined") {
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

  // Stock mock photos are permanently purged from the archive
  if (/^price[1-4]\.jpe?g$/i.test(testFilename) || /^price[1-4]\.jpe?g$/i.test(normalizeName(testSrc))) {
    return true;
  }
  if (/^photo-[1-4]$/i.test(testId)) {
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

/**
 * Fetch active photos from server, syncing server deleted registry and client deleted registry
 */
export async function fetchActiveGalleryPhotos(): Promise<GalleryPhoto[]> {
  let serverList: GalleryPhoto[] = [];

  // 1. Fetch server deleted registry first if available
  try {
    const delRes = await fetch(`${API_BASE}/gallery/deleted`, {
      headers: { "Cache-Control": "no-cache" }
    });
    if (delRes.ok) {
      const serverDeleted = await delRes.json();
      if (Array.isArray(serverDeleted)) {
        serverDeleted.forEach(record => {
          if (record && record.id) {
            markPhotoDeleted(record);
          }
        });
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
    const data = await handleResponse(res);
    if (Array.isArray(data)) {
      serverList = data;
    }
  } catch (err) {
    console.warn("[GalleryStore] fetch active photos error, trying cache/static:", err);
  }

  // 3. If server didn't return an array, check static /gallery.json
  if (serverList.length === 0) {
    try {
      const staticRes = await fetch("/gallery.json", { cache: "no-store" });
      if (staticRes.ok) {
        const staticData = await staticRes.json();
        if (Array.isArray(staticData)) {
          serverList = staticData;
        }
      }
    } catch {
      // ignore
    }
  }

  // 4. If still empty and no photos have ever been deleted, use defaults
  const deletedRecords = getDeletedPhotoRecords();
  if (serverList.length === 0 && deletedRecords.length === 0) {
    serverList = [...DEFAULT_GALLERY_PHOTOS];
  }

  // 5. CRITICAL: Strictly filter out any photo deleted by admin
  const activePhotos = filterActivePhotos(serverList);

  // Cache filtered list
  try {
    localStorage.setItem(STORAGE_ACTIVE_CACHE_KEY, JSON.stringify(activePhotos));
  } catch {
    // ignore
  }

  return activePhotos;
}

/**
 * Perform deletion on server and client
 */
export async function deleteActivePhoto(
  photo: GalleryPhoto | { id: string; src?: string; filename?: string },
  userContext?: { id?: string; role?: string; email?: string }
) {
  // 1. Mark in client registry immediately so UI responds without delay
  markPhotoDeleted({
    id: photo.id,
    src: photo.src,
    filename: photo.filename
  });

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
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const active = await fetchActiveGalleryPhotos();
      setPhotos(active);
    } catch (err) {
      console.warn("Error refreshing gallery photos:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();

    const handleUpdate = () => {
      // Immediately filter current state
      setPhotos(prev => filterActivePhotos(prev));
      reload();
    };

    window.addEventListener("gallery_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("gallery_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [reload]);

  return { photos, isLoading, reload };
}
