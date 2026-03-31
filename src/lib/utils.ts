import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Normalizes and resolves image URLs for the CMS.
 * Standard format: /uploads/images/{module}/{filename}
 */
export function getImageUrl(path: string | null | undefined, module: string = 'general'): string {
  if (!path) return '/placeholder-image.jpg'; // Path to a default placeholder
  
  if (path.startsWith('http')) return path;

  // Clean the path from leading slashes and common prefixes
  let cleanPath = path.replace(/^\/+/, '').replace(/\\/g, '/');
  
  // If the path already contains Uploads or uploads, we just normalize the casing for the host part
  if (cleanPath.toLowerCase().startsWith('uploads/')) {
    return `http://localhost:5066/${cleanPath}`;
  }

  // Otherwise, we assume it's just a filename and prepend the full standardized path
  return `http://localhost:5066/uploads/images/${module.toLowerCase()}/${cleanPath}`;
}
