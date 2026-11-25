"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Download,
  Lock,
  Unlock,
  UserCheck,
  Check,
  X,
  History,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import { formatDateWIB, formatDateTimeWIB, getStatusBadgeClass } from "@/lib/utils";

export default function VerifikasiPage() {
  const { currentUser, permissions } = useRole();
  const [activeTab, setActiveTab] = useState<"k3_pending" | "release_pending" | "history">("release_pending");
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authorization Form State
  const [authNotes, setAuthNotes] = useState("");
  const [normalizationAction, setNormalizationAction] = useState("Katup dibuka penuh & breaker di-roll in ke posisi ON");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchVerificationCases = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cases?limit=50");
      const result = await res.json();
      const allCases = result.data || [];
      setCases(allCases);

      // Select default showcase case if available (LOTO-2026-0031 or LOTO-2026-0028)
      const target =
        allCases.find((c: any) => c.status === "Permintaan Release") ||
        allCases.find((c: any) => c.status === "Menunggu Verifikasi") ||
        allCases.find((c: any) => c.caseNumber === "LOTO-2026-0031") ||
        allCases[0];

      if (target) setSelectedCase(target);
    } catch (err) {
      console.error("Gagal memuat antrean verifikasi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationCases();
  }, []);

  const k3PendingCases = cases.filter(
    (c) => c.status === "Menunggu Verifikasi" || c.status === "Draft"
  );
  const releasePendingCases = cases.filter(
    (c) => c.status === "Permintaan Release" || (c.status === "Aktif" && c.releaseRequests?.length > 0)
  );
  const historyCases = cases.filter((c) => c.status === "Release");

  // Handle Supervisor Approval
  const handleSupervisorApproval = async () => {
    if (!selectedCase) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/cases/${selectedCase.id}/approve-release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "SUPERVISOR_APPROVAL",
          actorName: currentUser.name,
          actorRole: currentUser.role,
          notes: authNotes || "Otorisasi operasional release disetujui sesuai SOP.",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast("Otorisasi Supervisor Shift berhasil disahkan!");
      fetchVerificationCases();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle K3 Approval
  const handleK3Approval = async () => {
    if (!selectedCase) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/cases/${selectedCase.id}/approve-release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "K3_APPROVAL",
          actorName: currentUser.name,
          actorRole: currentUser.role,
          notes: authNotes || "Pemeriksaan keselamatan dan zero energy release disahkan.",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast("Otorisasi Verifikator K3 berhasil disahkan!");
      fetchVerificationCases();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Physical Normalization Execution
  const handleExecuteNormalization = async () => {
    if (!selectedCase) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/cases/${selectedCase.id}/approve-release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "EXECUTE_NORMALIZATION",
          actorName: currentUser.name,
          actorRole: currentUser.role,
          normalizationAction,
          notes: authNotes || "Peralatan dinormalkan fisik di lapangan.",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast("Penormalan fisik berhasil dicatat. Status resmi RELEASE!");
      fetchVerificationCases();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const activeReleaseReq = selectedCase?.releaseRequests?.[0];

  return (
    <div className="flex flex-col w-full gap-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl border border-outline-variant/30 text-xs font-semibold animate-in fade-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Quick Meta Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping"></span>
              Perlu Tindakan K3 & Otorisasi
            </span>
            <span className="font-mono text-xs text-secondary">
              REF: SOP CLG.05.01.31 / AMDT-4
            </span>
          </div>
          <h1 className="text-xl font-bold text-on-surface">
            Verifikasi Lapangan & Otorisasi Release LOTO
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5 max-w-2xl">
            Proses multi-otorisasi pelepasan gembok isolasi sesuai SOP CLG.05.01.31 UBP Cilegon (660 MW)
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20">
            <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-secondary">Antrean Lapangan</span>
              <span className="text-xs font-bold text-on-surface">
                {releasePendingCases.length} Siap Release • {k3PendingCases.length} Verif Awal
              </span>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-primary-container transition-all text-xs font-bold"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Berita Acara</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-0">
        <div className="inline-flex p-1 rounded-xl bg-surface-container-high/60 gap-1 text-xs">
          <button
            onClick={() => setActiveTab("release_pending")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              activeTab === "release_pending"
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-secondary hover:text-on-surface"
            }`}
          >
            <Unlock className="w-4 h-4 text-tertiary" />
            <span>Permohonan Release</span>
            <span className="text-[10px] bg-tertiary text-white px-1.5 py-0.5 rounded-full ml-1">
              {releasePendingCases.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("k3_pending")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              activeTab === "k3_pending"
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-secondary hover:text-on-surface"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-[#b45309]" />
            <span>Verifikasi Awal Nol Energi</span>
            <span className="text-[10px] bg-[#fef3c7] text-[#b45309] px-1.5 py-0.5 rounded-full ml-1">
              {k3PendingCases.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              activeTab === "history"
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-secondary hover:text-on-surface"
            }`}
          >
            <History className="w-4 h-4 text-secondary" />
            <span>Riwayat Otorisasi Pelepasan ({historyCases.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg text-xs font-semibold">
          <span className="text-primary font-bold">Role Aktif Saat Ini:</span>
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">
            {currentUser.name} ({currentUser.role})
          </span>
        </div>
      </div>

      {/* Main Bento Inspection Grid: 8-col Details + 4-col Action Trigger */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT 8-COL: Deep Inspection Details & Multi-Stage Matrix */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Target Item Header Card */}
          {selectedCase && (
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary mt-1 shrink-0">
                    <Unlock className="w-6 h-6 text-tertiary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold bg-surface-container-high px-2 py-0.5 rounded text-primary">
                        {selectedCase.caseNumber}
                      </span>
                      <span className="font-mono text-xs font-bold bg-surface-container px-2 py-0.5 rounded text-secondary">
                        KKS: {selectedCase.kks}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          getStatusBadgeClass(selectedCase.status).bg
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            getStatusBadgeClass(selectedCase.status).dot
                          }`}
                        ></span>
                        <span>{selectedCase.status}</span>
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-on-surface mt-1.5">
                      {selectedCase.namaPeralatan}
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      {selectedCase.lokasiPeralatan} • Unit: {selectedCase.unit} • {selectedCase.bagian}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-secondary block">Shift & Tgl Pasang</span>
                  <span className="font-bold text-on-surface block mt-0.5">
                    Shift {selectedCase.shift} • {formatDateWIB(selectedCase.tanggal)}
                  </span>
                  <span className="text-[10px] font-mono text-primary font-bold">
                    No. WO: {selectedCase.workOrderNumber || "WO-LOTO-2026"}
                  </span>
                </div>
              </div>

              {/* Multi-Stage Verification Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {/* Stage 1: Permohonan & Kunci Personal */}
                <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-secondary uppercase">
                        Tahap 1: Pemohon Lapangan
                      </span>
                      {activeReleaseReq?.maintenanceDoneConfirmed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
                      ) : (
                        <Clock className="w-4 h-4 text-secondary" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-on-surface block">
                      Konfirmasi Pekerjaan Selesai
                    </span>
                    <p className="text-[10px] text-secondary mt-1">
                      Perkakas bersih, personal lock dilepas oleh pelaksana.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant/15 text-[10px]">
                    <span className="text-secondary">PIC Pemohon:</span>{" "}
                    <strong>{activeReleaseReq?.requestedBy || selectedCase.executor || "Teknisi"}</strong>
                  </div>
                </div>

                {/* Stage 2: Otorisasi Supervisor */}
                <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-secondary uppercase">
                        Tahap 2: Supervisor Shift
                      </span>
                      {activeReleaseReq?.authorizedSupervisorApproval ? (
                        <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#b45309]" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-on-surface block">
                      Otorisasi Operasi Pembangkit
                    </span>
                    <p className="text-[10px] text-secondary mt-1">
                      Persetujuan keselamatan sistem dan kesiapan penormalan unit.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant/15 text-[10px]">
                    <span className="text-secondary">Supervisor:</span>{" "}
                    <strong>
                      {activeReleaseReq?.authorizedSupervisorApproval
                        ? activeReleaseReq.supervisorName
                        : "Menunggu Approval"}
                    </strong>
                  </div>
                </div>

                {/* Stage 3: Verifikator K3 */}
                <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-secondary uppercase">
                        Tahap 3: Verifikator K3
                      </span>
                      {activeReleaseReq?.k3ReleaseApproval ? (
                        <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#b45309]" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-on-surface block">
                      Verifikasi Keselamatan K3
                    </span>
                    <p className="text-[10px] text-secondary mt-1">
                      Pemeriksaan bebas potensi bahaya dan izin kerja LOTO.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant/15 text-[10px]">
                    <span className="text-secondary">Verifikator K3:</span>{" "}
                    <strong>
                      {activeReleaseReq?.k3ReleaseApproval
                        ? activeReleaseReq.k3VerifierName
                        : "Menunggu Approval"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Titik Isolasi & Padlock List */}
              <div className="pt-2">
                <span className="text-xs font-bold text-on-surface block mb-2">
                  Titik Isolasi Fisik yang Akan Dinormalkan:
                </span>
                <div className="flex flex-col gap-2">
                  {(selectedCase.isolationPoints || []).map((pt: any) => (
                    <div
                      key={pt.id}
                      className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-on-surface block">
                          #{pt.pointNumber} {pt.pointName}
                        </span>
                        <span className="text-[10px] text-secondary">
                          KKS: {pt.kksCode} • Energi: {pt.energyType} • Metode: {pt.isolationMethod}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-primary block">
                          Padlock: {pt.padlockNumber}
                        </span>
                        <span className="text-[10px] text-secondary">Tag: {pt.tagNumber}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Queue Selection List */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Pilih Kasus dari Antrean ({releasePendingCases.length} Kasus)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {releasePendingCases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-3 rounded-lg text-left transition-all border text-xs flex flex-col justify-between ${
                    selectedCase?.id === c.id
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "bg-surface-container-low/60 border-outline-variant/20 hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-primary text-[11px]">{c.caseNumber}</span>
                    <span className="text-[10px] font-bold text-tertiary bg-error-container/60 px-1.5 py-0.5 rounded">
                      {c.status}
                    </span>
                  </div>
                  <strong className="text-on-surface truncate block">{c.namaPeralatan}</strong>
                  <span className="text-[10px] text-secondary mt-1 block">
                    KKS: {c.kks} • {c.unit}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT 4-COL: Role Authorization Action Trigger */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <UserCheck className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Panel Otorisasi Keselamatan
              </h3>
            </div>

            <div className="text-xs flex flex-col gap-3">
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <span className="text-[10px] font-bold text-secondary uppercase block">
                  Identitas Pengguna Saat Ini
                </span>
                <span className="text-xs font-bold text-on-surface block mt-0.5">
                  {currentUser.name}
                </span>
                <span className="text-[11px] text-primary font-semibold block">
                  Role: {currentUser.role}
                </span>
                <span className="text-[10px] text-secondary block mt-0.5 font-mono">
                  NIP: {currentUser.nip} • {currentUser.division}
                </span>
              </div>

              <div>
                <label className="font-bold text-secondary text-[11px] block mb-1">
                  Catatan Otorisasi / Berita Acara:
                </label>
                <textarea
                  rows={2}
                  value={authNotes}
                  onChange={(e) => setAuthNotes(e.target.value)}
                  placeholder="Catatan inspeksi fisik, hasil pengukuran voltase/tekanan nol..."
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Action Button 1: Supervisor Approval */}
              <div>
                <button
                  type="button"
                  onClick={handleSupervisorApproval}
                  disabled={
                    actionLoading ||
                    currentUser.role !== "Supervisor Shift" ||
                    activeReleaseReq?.authorizedSupervisorApproval
                  }
                  className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                    currentUser.role === "Supervisor Shift" && !activeReleaseReq?.authorizedSupervisorApproval
                      ? "bg-primary text-white hover:bg-primary-container"
                      : "bg-surface-container text-secondary opacity-60 cursor-not-allowed"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>
                    {activeReleaseReq?.authorizedSupervisorApproval
                      ? "✓ Otorisasi Supervisor Selesai"
                      : "Sahkan Otorisasi Supervisor Shift"}
                  </span>
                </button>
                {currentUser.role !== "Supervisor Shift" && (
                  <span className="text-[10px] text-secondary mt-1 block italic text-center">
                    Hanya untuk role 'Supervisor Shift'
                  </span>
                )}
              </div>

              {/* Action Button 2: K3 Approval */}
              <div>
                <button
                  type="button"
                  onClick={handleK3Approval}
                  disabled={
                    actionLoading ||
                    currentUser.role !== "Verifikator K3" ||
                    activeReleaseReq?.k3ReleaseApproval
                  }
                  className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                    currentUser.role === "Verifikator K3" && !activeReleaseReq?.k3ReleaseApproval
                      ? "bg-[#b45309] text-white hover:bg-[#92400e]"
                      : "bg-surface-container text-secondary opacity-60 cursor-not-allowed"
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>
                    {activeReleaseReq?.k3ReleaseApproval
                      ? "✓ Otorisasi K3 Selesai"
                      : "Sahkan Verifikasi K3 Bebas Bahaya"}
                  </span>
                </button>
                {currentUser.role !== "Verifikator K3" && (
                  <span className="text-[10px] text-secondary mt-1 block italic text-center">
                    Hanya untuk role 'Verifikator K3' (Admin Sistem dilarang bypass)
                  </span>
                )}
              </div>

              {/* Action Button 3: Execute Physical Normalization */}
              <div className="pt-2 border-t border-outline-variant/20">
                <label className="font-bold text-secondary text-[11px] block mb-1">
                  Tindakan Penormalan Fisik di Lapangan:
                </label>
                <input
                  type="text"
                  value={normalizationAction}
                  onChange={(e) => setNormalizationAction(e.target.value)}
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs mb-2"
                />

                <button
                  type="button"
                  onClick={handleExecuteNormalization}
                  disabled={
                    actionLoading ||
                    !activeReleaseReq?.authorizedSupervisorApproval ||
                    !activeReleaseReq?.k3ReleaseApproval ||
                    !["Operator Shift", "Maintenance Authorized Person"].includes(currentUser.role)
                  }
                  className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                    activeReleaseReq?.authorizedSupervisorApproval &&
                    activeReleaseReq?.k3ReleaseApproval &&
                    ["Operator Shift", "Maintenance Authorized Person"].includes(currentUser.role)
                      ? "bg-[#15803d] text-white hover:bg-[#166534]"
                      : "bg-surface-container text-secondary opacity-60 cursor-not-allowed"
                  }`}
                >
                  <Unlock className="w-4 h-4" />
                  <span>Eksekusi Penormalan Fisik (Release Kasus)</span>
                </button>

                {(!activeReleaseReq?.authorizedSupervisorApproval || !activeReleaseReq?.k3ReleaseApproval) && (
                  <span className="text-[10px] text-tertiary mt-1 block font-semibold text-center">
                    Terkunci: Wajib disahkan Supervisor & Tim K3 terlebih dahulu.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
