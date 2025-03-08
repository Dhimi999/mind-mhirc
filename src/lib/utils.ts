
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
