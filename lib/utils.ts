import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((v) => String(v).padStart(2, "0")).join(":");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(value);
}

/** Returns a contrasting text color (white or dark) for a hex background. */
export function getContrastTextColor(hex: string): string {
  const h = hex.replace(/^#/, "");
  if (h.length !== 6) return "#1e293b";
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 0.5 ? "#1e293b" : "#ffffff";
}
