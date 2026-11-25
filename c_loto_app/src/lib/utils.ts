import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateWIB(date: string | Date | null | undefined): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return String(date);
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return String(date);
  }
}

export function formatDateTimeWIB(date: string | Date | null | undefined): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return String(date);
    return (
      new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d) + " WIB"
    );
  } catch {
    return String(date);
  }
}

export function getStatusBadgeClass(status: string | null | undefined): {
  bg: string;
  text: string;
  dot: string;
  label: string;
} {
  const s = String(status || "").toLowerCase().trim();
  if (s === "aktif") {
    return {
      bg: "bg-[#fee2e2] text-tertiary",
      text: "text-tertiary",
      dot: "bg-tertiary",
      label: "Aktif",
    };
  }
  if (s === "release") {
    return {
      bg: "bg-[#dcfce7] text-[#15803d]",
      text: "text-[#15803d]",
      dot: "bg-[#15803d]",
      label: "Release",
    };
  }
  if (s === "menunggu verifikasi") {
    return {
      bg: "bg-[#fef3c7] text-[#b45309]",
      text: "text-[#b45309]",
      dot: "bg-[#b45309]",
      label: "Menunggu Verifikasi",
    };
  }
  if (s === "menunggu persetujuan" || s === "permintaan release") {
    return {
      bg: "bg-[#e0f2fe] text-[#0369a1]",
      text: "text-[#0369a1]",
      dot: "bg-[#0369a1]",
      label: status || "Menunggu",
    };
  }
  return {
    bg: "bg-surface-container text-on-surface-variant",
    text: "text-on-surface-variant",
    dot: "bg-outline",
    label: status || "Draft",
  };
}
