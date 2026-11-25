"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  PlusCircle,
  CheckCircle2,
  ArrowLeftRight,
  FileText,
  History,
  FileSpreadsheet,
  Lock,
  Zap,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Data LOTO",
      path: "/data-loto",
      icon: ShieldAlert,
    },
    {
      label: "Tambah LOTO",
      path: "/tambah-loto",
      icon: PlusCircle,
      badge: "Baru",
      badgeColor: "bg-primary text-white",
    },
    {
      label: "Verifikasi",
      path: "/verifikasi",
      icon: CheckCircle2,
      badge: "1",
      badgeColor: "bg-tertiary text-white rounded-full w-5 h-5 flex items-center justify-center",
    },
    {
      label: "Serah Terima Shift",
      path: "/serah-terima-shift",
      icon: ArrowLeftRight,
    },
    {
      label: "Laporan",
      path: "/laporan",
      icon: FileText,
    },
    {
      label: "Audit Trail",
      path: "/audit-trail",
      icon: History,
    },
    {
      label: "Impor Excel",
      path: "/impor",
      icon: FileSpreadsheet,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-on-background z-50 flex flex-col justify-between overflow-y-auto no-print">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                C-LOTO{" "}
                <span className="text-[10px] bg-primary px-1.5 py-0.5 rounded text-on-primary font-semibold">
                  v2.6
                </span>
              </div>
              <p className="text-[11px] text-secondary-fixed-dim leading-tight mt-0.5">
                Cilegon Lockout Tagout System
              </p>
            </div>
          </div>

          {/* Plant Unit Identity */}
          <div className="mt-4 p-3 rounded-lg bg-inverse-surface/60">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-white">UBP Cilegon</span>
              <span className="text-[10px] font-bold text-primary-fixed bg-primary/40 px-2 py-0.5 rounded">
                PLN IP
              </span>
            </div>
            <div className="text-[11px] text-secondary-fixed-dim flex items-center gap-1 mt-1">
              <Zap className="w-3.5 h-3.5 text-primary-fixed" />
              <span>PLTGU Cilegon (660 MW)</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive =
              item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-[13px] font-medium ${
                  isActive
                    ? "bg-primary-container text-on-primary font-bold shadow-sm"
                    : "text-secondary-fixed-dim hover:bg-inverse-surface hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold ${item.badgeColor} px-1.5 py-0.5 rounded`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Plant Visual & Safety Notice */}
      <div className="p-4 mt-4">
        <div className="relative rounded-xl overflow-hidden shadow-md bg-inverse-surface p-3 border border-outline-variant/20">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              PLTGU Cilegon CCGT
            </span>
          </div>
          <span className="text-[11px] text-secondary-fixed-dim block">
            HRSG Stack & Turbine Island
          </span>
          <div className="mt-2 pt-2 border-t border-outline-variant/20 text-[10px] text-secondary-fixed-dim flex items-center justify-between">
            <span>Zona Waktu</span>
            <span className="font-bold text-primary-fixed">Asia/Jakarta (WIB)</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
