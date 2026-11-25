"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { DEMO_USERS } from "@/lib/auth";
import {
  Clock,
  Bell,
  UserCheck,
  ChevronDown,
  ShieldCheck,
  CheckCircle,
  FileCheck,
} from "lucide-react";

export function Header() {
  const { currentUser, switchUser, selectedShift, setSelectedShift } = useRole();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showShiftMenu, setShowShiftMenu] = useState(false);

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-6 no-print">
      {/* Left Title & Status */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-on-surface">
              Monitoring LOTO - UBP Cilegon
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container text-primary font-bold">
              CLG.05.01.31
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface text-[11px]">
              <FileCheck className="w-3 h-3 text-primary" />
              <span>Sistem Intranet Aktif • SOP LOTO 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls: Shift, Notifications, Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Shift Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowShiftMenu(!showShiftMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface text-xs font-semibold transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Shift: {selectedShift}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showShiftMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/30 py-1 z-50">
              {["Semua", "A", "B", "C", "D"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSelectedShift(s);
                    setShowShiftMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-surface-container-low ${
                    selectedShift === s ? "font-bold text-primary" : "text-on-surface"
                  }`}
                >
                  <span>{s === "Semua" ? "Semua Shift" : `Shift ${s}`}</span>
                  {selectedShift === s && <CheckCircle className="w-3 h-3 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            title="Notifikasi LOTO"
          >
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-tertiary text-white flex items-center justify-center text-[9px] font-bold">
            1
          </span>
        </div>

        {/* Role Switcher Menu (Interactive RBAC Testing) */}
        <div className="relative pl-2 border-l border-outline-variant/30">
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-surface-container-low transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-on-surface leading-tight">
                  {currentUser.name}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" title="Aktif"></span>
              </div>
              <span className="text-[11px] text-primary font-semibold leading-tight">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-secondary" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 py-2 z-50">
              <div className="px-3 py-2 border-b border-outline-variant/20">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                  Simulasi Role & Otorisasi RBAC
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Ganti peran untuk menguji hak akses dan verifikasi:
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.username}
                    type="button"
                    onClick={() => {
                      switchUser(user.username);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-surface-container-low flex items-start justify-between transition-colors ${
                      currentUser.username === user.username
                        ? "bg-primary/10 border-l-2 border-primary"
                        : ""
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-on-surface">{user.name}</div>
                      <div className="text-[11px] text-primary font-semibold">{user.role}</div>
                      <div className="text-[10px] text-secondary">{user.division}</div>
                    </div>
                    {currentUser.username === user.username && (
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
