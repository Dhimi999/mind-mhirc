
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Json } from "@/integrations/supabase/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  try {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return new Date(dateString).toLocaleDateString('id-ID', options);
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString;
  }
}

export function parseComments(comments: Json | null): Array<{ name: string; email: string; content: string; date: string }> {
  if (!comments) return [];
  
  if (Array.isArray(comments)) {
    return comments as Array<{ name: string; email: string; content: string; date: string }>;
  }
  
  try {
    if (typeof comments === 'string') {
      return JSON.parse(comments);
    }
  } catch (error) {
    console.error("Error parsing comments:", error);
  }
  
  return [];
}

// Resolve the canonical/site base URL
export function getSiteBaseUrl(): string {
  try {
    const envBase = (import.meta as any)?.env?.VITE_SITE_BASE_URL as string | undefined;
    if (envBase && typeof envBase === 'string' && envBase.trim()) {
      return envBase.replace(/\/$/, '');
    }
  } catch {}
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  // Final fallback to your primary domain (adjust as needed)
  return 'https://www.mentalstatus.zone.id';
}
