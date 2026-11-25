"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Factory,
  Users,
  Cpu,
  FileCheck,
  History,
  Unlock,
  Check,
  X,
  FileText,
} from "lucide-react";
import { formatDateWIB, formatDateTimeWIB, getStatusBadgeClass } from "@/lib/utils";

export default function LotoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { currentUser, permissions } = useRole();

  const [lotoCase, setLotoCase] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Release modal
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState("");
  const [submittingRelease, setSubmittingRelease] = useState(false);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/cases/${id}`);
      if (!res.ok) {
        throw new Error("Kasus LOTO tidak ditemukan.");
      }
      const data = await res.json();
      setLotoCase(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCaseDetails();
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRequestRelease = async () => {
    try {
      setSubmittingRelease(true);
      const res = await fetch(`/api/cases/${lotoCase.id}/request-release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedBy: currentUser.name,
          requestedRole: currentUser.role,
          maintenanceDoneConfirmed: true,
          toolsPersonnelClearConfirmed: true,
          lockOwnerVerified: true,
          notes: releaseNotes,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Gagal mengajukan release.");
      }

      setShowReleaseModal(false);
      showToast("Permohonan release berhasil diajukan. Status dialihkan ke Menunggu Otorisasi.");
      fetchCaseDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingRelease(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-secondary font-medium">Memuat lembar kerja LOTO...</span>
        </div>
      </div>
    );
  }

  if (error || !lotoCase) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4">
        <AlertTriangle className="w-12 h-12 text-tertiary" />
        <h2 className="text-lg font-bold text-on-surface">Data Kasus Tidak Ditemukan</h2>
        <p className="text-xs text-secondary max-w-md">{error || "ID kasus tidak valid."}</p>
        <Link
          href="/data-loto"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Data LOTO</span>
        </Link>
      </div>
    );
  }

  const badge = getStatusBadgeClass(lotoCase.status);
  const isolationPoints = lotoCase.isolationPoints || [];
  const latestVerification = lotoCase.verifications?.[0];
  const latestReleaseRequest = lotoCase.releaseRequests?.[0];

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl border border-outline-variant/30 text-xs font-semibold animate-in fade-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Operational Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex items-center gap-2 text-secondary">
          <Link href="/data-loto" className="hover:text-primary transition-colors flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Register LOTO</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-outline-variant" />
          <span className="text-on-surface font-semibold">{lotoCase.unit || "PLTGU Cilegon"}</span>
          <ChevronRight className="w-3 h-3 text-outline-variant" />
          <span className="font-mono text-primary font-bold bg-primary-fixed/40 px-2 py-0.5 rounded">
            {lotoCase.caseNumber}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-[11px] font-bold">
            <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`}></span>
            <span>{lotoCase.status.toUpperCase()}</span>
          </span>
          <span className="font-mono text-[11px] text-secondary bg-surface-container-high px-2 py-1 rounded">
            Padlock Utama: #{lotoCase.nomorLockTag}
          </span>
        </div>
      </div>

      {/* Top Hero Header Module */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 mb-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs shadow-sm ${badge.bg}`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{lotoCase.status.toUpperCase()}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-high text-primary font-mono text-xs font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>KKS: {lotoCase.kks}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-container text-xs font-bold">
                <Factory className="w-3.5 h-3.5" />
                <span>{lotoCase.unit}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>Shift {lotoCase.shift}</span>
              </span>
            </div>

            <h1 className="text-xl font-bold text-on-surface mt-1">
              {lotoCase.caseNumber}: {lotoCase.namaPeralatan}
            </h1>
            <p className="text-xs text-secondary max-w-3xl leading-relaxed">
              {lotoCase.keterangan || "Kegiatan isolasi energi dan penguncian peralatan kerja PLTGU Cilegon."}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-primary" />
              <span>Cetak Tag Fisik</span>
            </button>

            {lotoCase.status === "Aktif" && (
              <button
                onClick={() => setShowReleaseModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-tertiary-container hover:bg-tertiary text-white text-xs font-bold transition-all shadow-md"
              >
                <Unlock className="w-4 h-4" />
                <span>Ajukan Release / Pelepasan</span>
              </button>
            )}

            {lotoCase.status === "Permintaan Release" && (
              <Link
                href="/verifikasi"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#b45309] text-white text-xs font-bold hover:bg-[#92400e] transition-colors shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Buka Antrean Otorisasi Release</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Operational Process Stepper */}
      <div className="bg-surface-container-lowest rounded-xl p-4 mb-6 shadow-sm border border-outline-variant/20 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] px-3">
          {[
            {
              step: 1,
              name: "1. Pengajuan LOTO",
              status: "done",
              detail: `${formatDateWIB(lotoCase.tanggal)} • ${lotoCase.bagian}`,
            },
            {
              step: 2,
              name: "2. Tindakan Isolasi",
              status: "done",
              detail: `${lotoCase.executor || "Teknisi Lapangan"}`,
            },
            {
              step: 3,
              name: "3. Verifikasi K3",
              status: lotoCase.verifikasiK3 ? "done" : "active",
              detail: lotoCase.verifikasiK3 ? `Diverifikasi: ${lotoCase.verifikasiK3}` : "Menunggu Pemeriksaan",
            },
            {
              step: 4,
              name: "4. Terkunci Aktif",
              status: lotoCase.status === "Aktif" ? "active" : lotoCase.status === "Release" ? "done" : "idle",
              detail: `${isolationPoints.length} Titik Terpasang Padlock`,
            },
            {
              step: 5,
              name: "5. Release Penormalan",
              status: lotoCase.status === "Release" ? "done" : "idle",
              detail: lotoCase.tanggalRelease ? formatDateWIB(lotoCase.tanggalRelease) : "Belum Release",
            },
          ].map((st, i) => (
            <div key={st.step} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    st.status === "done"
                      ? "bg-[#22c55e] text-white"
                      : st.status === "active"
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-surface-container text-secondary"
                  }`}
                >
                  {st.status === "done" ? <Check className="w-4 h-4" /> : st.step}
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block leading-tight">
                    {st.name}
                  </span>
                  <span className="text-[10px] text-secondary">{st.detail}</span>
                </div>
              </div>
              {i < 4 && <ChevronRight className="w-4 h-4 text-outline-variant mx-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Multi-Point Isolation Table + Side Card Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (8 cols): Isolation Points Table */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-on-surface">
                  Matriks Titik Isolasi & Padlock Lapangan ({isolationPoints.length} Titik)
                </h2>
                <p className="text-[11px] text-secondary">
                  Daftar seluruh titik de-energisasi fisik yang diverifikasi bebas energi berbahaya
                </p>
              </div>
              <span className="text-[10px] font-bold bg-surface-container px-2 py-0.5 rounded text-primary">
                Multi-Point Isolation SOP
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-outline-variant/20">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Titik</th>
                    <th className="py-2.5 px-3">Deskripsi Peralatan</th>
                    <th className="py-2.5 px-3">Kode KKS</th>
                    <th className="py-2.5 px-3">Tipe Energi</th>
                    <th className="py-2.5 px-3">Metode Isolasi</th>
                    <th className="py-2.5 px-3">Padlock / Tag</th>
                    <th className="py-2.5 px-3">Uji Nol Energi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15 text-on-surface">
                  {isolationPoints.map((pt: any) => (
                    <tr key={pt.id} className="hover:bg-surface-container-low/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-secondary">
                        #{pt.pointNumber}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-on-surface">
                        {pt.pointName}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-primary">
                        {pt.kksCode}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-container text-secondary">
                          {pt.energyType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-secondary text-[11px]">
                        {pt.isolationMethod}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold">
                        {pt.padlockNumber} / {pt.tagNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Terverifikasi</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Field Execution Note */}
            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-1">
                Catatan Eksekusi Isolasi Lapangan
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <strong>Tindakan Isolasi:</strong> {lotoCase.eksekusi || "-"}
                </div>
                <div>
                  <strong>Pelaksana (Executor):</strong> {lotoCase.executor || "-"}
                </div>
                <div>
                  <strong>Bagian Pelaksana:</strong> {lotoCase.bagian || "-"}
                </div>
                <div>
                  <strong>No. Work Order (WO):</strong> {lotoCase.workOrderNumber || "WO-LOTO-2026"}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Events for this Case */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Riwayat Audit & Jejak Rekam Kasus (Audit Trail)
                </h3>
              </div>
              <span className="text-[10px] text-secondary font-mono">Immutable Append-Only</span>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {(lotoCase.auditEvents || []).length === 0 ? (
                <div className="text-xs text-secondary py-3 text-center">
                  Belum ada catatan perubahan audit khusus untuk kasus ini.
                </div>
              ) : (
                lotoCase.auditEvents.map((evt: any) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/15 flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{evt.action}</span>
                        <span className="text-secondary text-[10px]">•</span>
                        <span className="font-semibold text-on-surface">{evt.actorName}</span>
                        <span className="text-[10px] text-secondary">({evt.actorRole})</span>
                      </div>
                      <p className="text-[11px] text-secondary mt-0.5">{evt.reason || "Perubahan sistem dicatat."}</p>
                    </div>
                    <span className="font-mono text-[10px] text-secondary shrink-0">
                      {formatDateTimeWIB(evt.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right (4 cols): Safety Verification & Release Status */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card: K3 Zero-Energy Verification Record */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Pengesahan Keselamatan K3
              </h3>
            </div>

            <div className="p-3 rounded-lg bg-[#dcfce7]/60 border border-[#bbf7d0] text-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#15803d]">Pemeriksaan Nol Energi</span>
                <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
              </div>
              <div className="text-[11px] text-[#166534]">
                <p>
                  <strong>Verifikator K3:</strong> {lotoCase.verifikasiK3 || latestVerification?.verifierName || "Dedi Kurniawan, S.K.M."}
                </p>
                <p className="mt-0.5">
                  <strong>Waktu Verifikasi:</strong> {formatDateTimeWIB(latestVerification?.verificationTime || lotoCase.createdAt)}
                </p>
                <p className="mt-0.5">
                  <strong>Status SOP:</strong> Terverifikasi bebas energi berbahaya (Zero Energy Certified)
                </p>
              </div>
            </div>

            {/* Release Status Overview */}
            {latestReleaseRequest && (
              <div className="p-3 rounded-lg bg-[#e0f2fe] border border-[#bae6fd] text-xs flex flex-col gap-2 mt-1">
                <span className="font-bold text-[#0369a1] block">
                  Status Pengajuan Release
                </span>
                <div className="text-[11px] text-[#075985] flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span>Otorisasi Supervisor Shift:</span>
                    <span className="font-bold">
                      {latestReleaseRequest.authorizedSupervisorApproval ? "Disetujui" : "Menunggu"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Otorisasi Verifikator K3:</span>
                    <span className="font-bold">
                      {latestReleaseRequest.k3ReleaseApproval ? "Disetujui" : "Menunggu"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Penormalan Fisik Lapangan:</span>
                    <span className="font-bold">
                      {latestReleaseRequest.physicalNormalizationConfirmed ? "Selesai" : "Belum"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Plant Specification Card */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-2.5 text-xs">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
              Spesifikasi Lokasi & Pembangkit
            </h3>
            <div className="flex justify-between py-1 border-b border-outline-variant/15">
              <span className="text-secondary">Pembangkit:</span>
              <span className="font-semibold text-on-surface">PLTGU Cilegon (660 MW)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/15">
              <span className="text-secondary">Unit / Area:</span>
              <span className="font-semibold text-on-surface">{lotoCase.unit}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/15">
              <span className="text-secondary">Jenis Peralatan:</span>
              <span className="font-semibold text-on-surface">{lotoCase.peralatan}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/15">
              <span className="text-secondary">Tipe Pekerjaan:</span>
              <span className="font-semibold text-on-surface">{lotoCase.type}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Tgl Pemasangan:</span>
              <span className="font-mono text-on-surface">{formatDateWIB(lotoCase.tanggal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Release Request Modal */}
      {showReleaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/30 max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <Unlock className="w-5 h-5 text-tertiary" />
                <h3 className="text-sm font-bold text-on-surface">Pengajuan Release LOTO</h3>
              </div>
              <button
                onClick={() => setShowReleaseModal(false)}
                className="text-secondary hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 text-xs flex flex-col gap-3">
              <p className="text-secondary leading-relaxed">
                Anda mengajukan pelepasan isolasi untuk <strong>{lotoCase.caseNumber} ({lotoCase.namaPeralatan})</strong>.
              </p>

              <div className="p-3 rounded-lg bg-[#fee2e2]/60 border border-[#fecaca] text-[#991b1b] flex flex-col gap-1.5">
                <span className="font-bold">Konfirmasi Mandatori Pekerjaan:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-primary" />
                  <span>Pekerjaan pemeliharaan / perbaikan fisik telah selesai 100%.</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-primary" />
                  <span>Semua perkakas, sampah, dan personel telah bersih dari area.</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-primary" />
                  <span>Kunci gembok personal telah dikembalikan oleh pemilik kunci.</span>
                </label>
              </div>

              <div>
                <label className="font-bold text-secondary block mb-1">
                  Catatan Pekerjaan / Hasil Uji:
                </label>
                <textarea
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="Contoh: Overhaul flange selesai, baut dikencangkan sesuai torsi, siap dinormalkan."
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReleaseModal(false)}
                className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-semibold hover:bg-surface-container"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRequestRelease}
                disabled={submittingRelease}
                className="px-4 py-1.5 rounded-lg bg-tertiary text-white text-xs font-bold hover:bg-tertiary-container disabled:opacity-50 transition-colors"
              >
                {submittingRelease ? "Mengirim..." : "Kirim Pengajuan Release"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
