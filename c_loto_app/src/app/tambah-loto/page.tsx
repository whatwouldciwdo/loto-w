"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  Cpu,
  Factory,
  ShieldCheck,
  Save,
  FileCheck,
} from "lucide-react";

export default function TambahLotoPage() {
  const router = useRouter();
  const { currentUser, permissions } = useRole();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Data Pekerjaan & Pemohon
    namaPeralatan: "",
    unit: "GT 1.1",
    lokasiPeralatan: "Gas Turbine Generator 1.1",
    peralatan: "Valve",
    bagian: "Pemeliharaan Mesin",
    shift: currentUser.shift?.replace("Shift ", "") || "B",
    type: "WO CM",
    workOrderNumber: "",
    executor: currentUser.name,
    keterangan: "",

    // Step 2: Identifikasi KKS & Titik Isolasi
    kks: "",
    nomorLockTag: "",
    energyTypes: ["Mekanik"] as string[],

    // Dynamic Multi-Isolation Points
    isolationPoints: [
      {
        pointName: "Manual Isolation Valve",
        kksCode: "",
        energyType: "Mekanik",
        isolationMethod: "Closed & Chain Padlocked",
        padlockNumber: "012",
        tagNumber: "TAG-012",
        verificationMethod: "Pemeriksaan visual dan indikator posisi",
      },
    ],

    // Step 4: Safety Confirmation
    zeroEnergyCheck: false,
    padlockAffixedCheck: false,
    areaClearCheck: false,
  });

  const handleTextChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handlePointChange = (index: number, field: string, val: any) => {
    setFormData((prev) => {
      const updated = [...prev.isolationPoints];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, isolationPoints: updated };
    });
  };

  const addIsolationPoint = () => {
    setFormData((prev) => ({
      ...prev,
      isolationPoints: [
        ...prev.isolationPoints,
        {
          pointName: "",
          kksCode: prev.kks ? `${prev.kks}-PT${prev.isolationPoints.length + 1}` : "",
          energyType: "Listrik",
          isolationMethod: "Breaker Racked Out",
          padlockNumber: "",
          tagNumber: "",
          verificationMethod: "Multimeter test 0V",
        },
      ],
    }));
  };

  const removeIsolationPoint = (index: number) => {
    if (formData.isolationPoints.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      isolationPoints: prev.isolationPoints.filter((_, i) => i !== index),
    }));
  };

  const toggleEnergy = (type: string) => {
    setFormData((prev) => {
      const exists = prev.energyTypes.includes(type);
      return {
        ...prev,
        energyTypes: exists
          ? prev.energyTypes.filter((t) => t !== type)
          : [...prev.energyTypes, type],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kks || !formData.namaPeralatan) {
      alert("Harap lengkapi KKS dan Nama Peralatan!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          actorName: currentUser.name,
          actorRole: currentUser.role,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Gagal membuat formulir LOTO.");
      }

      setSuccessId(result.id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Command & Breadcrumb Context Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-secondary text-xs">
            <span>Sistem Manajemen LOTO</span>
            <ChevronRight className="w-3 h-3" />
            <span>Pengajuan LOTO</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary font-bold">Registrasi Form Baru</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-xl font-bold text-on-surface">
              Formulir Pengajuan & Pemasangan LOTO Baru
            </h1>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[11px] font-bold">
              CLG.05.01.31
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Standar Operasional Prosedur Penguncian dan Pelabelan Keselamatan Kerja PLTGU Cilegon (660 MW)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-xl shadow-sm border border-outline-variant/20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low text-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-semibold text-on-surface">Draf Aktif</span>
          </div>
          <span className="text-[11px] font-mono text-secondary">
            User: {currentUser.name} ({currentUser.role})
          </span>
        </div>
      </div>

      {/* Mandatory K3 Safety Protocol Banner */}
      <div className="rounded-xl bg-gradient-to-r from-tertiary-container via-tertiary to-tertiary-container text-white shadow-md mb-6 p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider">
              Perhatian Mandatori Keselamatan K3 (Golden Rules)
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
              WAJIB VERIFIKASI ZERO ENERGY
            </span>
          </div>
          <p className="mt-1 leading-relaxed opacity-95">
            Pemasangan gembok dan tag fisik <strong>wajib dilakukan langsung oleh tim isolator di lapangan</strong> sebelum sistem ini disahkan oleh Supervisor Operasi dan Tim K3. Sistem C-LOTO <strong>tidak membuka/mengunci peralatan secara elektrik otomatis</strong>, melainkan mencatat integritas isolasi energi fisik.
          </p>
        </div>
      </div>

      {/* 4-Stage Process Stepper Progress Bar */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { n: 1, title: "Tahap 1", sub: "Data Pekerjaan & Pemohon", desc: "Lingkup WO, Unit & PIC" },
            { n: 2, title: "Tahap 2", sub: "Identifikasi KKS & Titik", desc: "Daftar Titik Penguncian" },
            { n: 3, title: "Tahap 3", sub: "Padlock & Field Evidence", desc: "Gembok Master & Tag" },
            { n: 4, title: "Tahap 4", sub: "Verifikasi & Otorisasi K3", desc: "Review & Pengesahan SOP" },
          ].map((st) => (
            <button
              key={st.n}
              type="button"
              onClick={() => setStep(st.n)}
              className={`flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                step === st.n
                  ? "bg-primary/10 border-b-2 border-primary"
                  : step > st.n
                  ? "bg-surface-container-low opacity-90"
                  : "bg-surface-container-low opacity-60"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  step === st.n
                    ? "bg-primary text-white"
                    : step > st.n
                    ? "bg-[#22c55e] text-white"
                    : "bg-surface-container-high text-secondary"
                }`}
              >
                {step > st.n ? "✓" : st.n}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-secondary uppercase block">
                  {st.title}
                </span>
                <div className="text-xs font-bold text-on-surface truncate">{st.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Success Dialog */}
      {successId && (
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-[#22c55e]/40 shadow-lg text-center flex flex-col items-center gap-3 my-4">
          <div className="w-12 h-12 rounded-full bg-[#dcfce7] text-[#15803d] flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-on-surface">Pendaftaran Formulir LOTO Berhasil</h2>
          <p className="text-xs text-secondary max-w-md">
            Data kasus LOTO telah tersimpan dengan aman ke database internal UBP Cilegon dan siap diverifikasi oleh Verifikator K3.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => router.push(`/loto/${successId}`)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-sm"
            >
              Buka Lembar Kerja Kasus
            </button>
            <button
              onClick={() => {
                setSuccessId(null);
                setStep(1);
                setFormData({
                  namaPeralatan: "",
                  unit: "GT 1.1",
                  lokasiPeralatan: "Gas Turbine Generator 1.1",
                  peralatan: "Valve",
                  bagian: "Pemeliharaan Mesin",
                  shift: "B",
                  type: "WO CM",
                  workOrderNumber: "",
                  executor: currentUser.name,
                  keterangan: "",
                  kks: "",
                  nomorLockTag: "",
                  energyTypes: ["Mekanik"],
                  isolationPoints: [
                    {
                      pointName: "Manual Isolation Valve",
                      kksCode: "",
                      energyType: "Mekanik",
                      isolationMethod: "Closed & Chain Padlocked",
                      padlockNumber: "012",
                      tagNumber: "TAG-012",
                      verificationMethod: "Pemeriksaan visual",
                    },
                  ],
                  zeroEnergyCheck: false,
                  padlockAffixedCheck: false,
                  areaClearCheck: false,
                });
              }}
              className="px-4 py-2 bg-surface-container text-on-surface rounded-lg text-xs font-semibold"
            >
              Tambah Kasus Baru Lagi
            </button>
          </div>
        </div>
      )}

      {/* Multi-Step Wizard Body */}
      {!successId && (
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-6">
          {/* STEP 1: Data Pekerjaan & Pemohon */}
          {step === 1 && (
            <div className="flex flex-col gap-4 text-xs">
              <h2 className="text-sm font-bold text-on-surface pb-2 border-b border-outline-variant/20 flex items-center gap-2">
                <Factory className="w-4 h-4 text-primary" />
                <span>Tahap 1: Lingkup Pekerjaan & Identitas Pemohon</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-secondary block mb-1">
                    Nama Peralatan yang Diisolasi <span className="text-tertiary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Boiler Feedwater Pump 1A Motor Suction Valve"
                    value={formData.namaPeralatan}
                    onChange={(e) => handleTextChange("namaPeralatan", e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-secondary block mb-1">
                    Nomor Work Order (WO / CM / PM)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: WO-2026-109402"
                    value={formData.workOrderNumber}
                    onChange={(e) => handleTextChange("workOrderNumber", e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-secondary block mb-1">Unit Pembangkit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => {
                      handleTextChange("unit", e.target.value);
                      handleTextChange("lokasiPeralatan", e.target.value);
                    }}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="GT 1.1">GT 1.1 (Gas Turbine 1.1)</option>
                    <option value="GT 1.2">GT 1.2 (Gas Turbine 1.2)</option>
                    <option value="ST 1.0">ST 1.0 (Steam Turbine)</option>
                    <option value="HRSG 1.1">HRSG 1.1 (Heat Recovery Steam Generator)</option>
                    <option value="HRSG 1.2">HRSG 1.2 (Heat Recovery Steam Generator)</option>
                    <option value="BOP (Demin)">BOP (Water Treatment Plant / Demin)</option>
                    <option value="BOP / Common">BOP / Common Utility Area</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-secondary block mb-1">Lokasi Detail Lapangan</label>
                  <input
                    type="text"
                    placeholder="Contoh: HRSG 1.1 Floor 2 Valve Manifold"
                    value={formData.lokasiPeralatan}
                    onChange={(e) => handleTextChange("lokasiPeralatan", e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-secondary block mb-1">Jenis Peralatan</label>
                  <select
                    value={formData.peralatan}
                    onChange={(e) => handleTextChange("peralatan", e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="Valve">Valve (Katup Mekanikal)</option>
                    <option value="Breaker">Breaker (Pemutus Daya Listrik / CB)</option>
                    <option value="Switchgear">Switchgear / Cubicle</option>
                    <option value="Damper">Damper Saluran Gas Buang</option>
                    <option value="Pump">Motor / Pompa</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-secondary block mb-1">Bagian Pelaksana</label>
                  <select
                    value={formData.bagian}
                    onChange={(e) => handleTextChange("bagian", e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="Har Mesin">Har Mesin (Pemeliharaan Mesin & Boiler)</option>
                    <option value="Har Elec">Har Elec (Pemeliharaan Listrik)</option>
                    <option value="Har Instrumen">Har Instrumen & Kontrol</option>
                    <option value="Har BOP">Har BOP (Common Plant)</option>
                    <option value="Operasi">Tim Operasi Pembangkit</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-secondary block mb-1">Shift Kerja</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => handleTextChange("shift", e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="A">Shift A</option>
                    <option value="B">Shift B</option>
                    <option value="C">Shift C</option>
                    <option value="D">Shift D</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-secondary block mb-1">Tipe Pekerjaan</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleTextChange("type", e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="WO CM">WO CM (Corrective Maintenance)</option>
                    <option value="WO CD">WO CD (Condition Direct)</option>
                    <option value="WO PM">WO PM (Preventive Maintenance)</option>
                    <option value="WO PRO">WO PRO (Project / Overhaul)</option>
                    <option value="OH">OH (Major Overhaul)</option>
                    <option value="Other">Other / Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-secondary block mb-1">
                  Keterangan Lingkup Pekerjaan
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan alasan penguncian dan cakupan pekerjaan pemeliharaan..."
                  value={formData.keterangan}
                  onChange={(e) => handleTextChange("keterangan", e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Identifikasi KKS & Titik Isolasi */}
          {step === 2 && (
            <div className="flex flex-col gap-4 text-xs">
              <h2 className="text-sm font-bold text-on-surface pb-2 border-b border-outline-variant/20 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <span>Tahap 2: Identifikasi Kode KKS & Sumber Energi Berbahaya</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-secondary block mb-1">
                    No. KKS Utama (Kraftwerk-Kennzeichensystem) <span className="text-tertiary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 10LBA10AA001"
                    value={formData.kks}
                    onChange={(e) => handleTextChange("kks", e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs font-mono font-bold text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-secondary mt-1 block">
                    Pertahankan angka nol di depan dan huruf kapital KKS resmi.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-secondary block mb-1">
                    Nomor Lock / Tag Utama (Leading Zeros Dijaga)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 012 atau 017"
                    value={formData.nomorLockTag}
                    onChange={(e) => handleTextChange("nomorLockTag", e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs font-mono font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-secondary block mb-2">
                  Identifikasi Tipe Energi Berbahaya Terlibat (Pilih Semua yang Berlaku):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {["Listrik", "Mekanik", "Termal", "Hidrolik", "Pneumatik", "Kimia"].map((et) => {
                    const isSelected = formData.energyTypes.includes(et);
                    return (
                      <button
                        key={et}
                        type="button"
                        onClick={() => toggleEnergy(et)}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? "bg-primary text-white border-primary"
                            : "bg-surface-container-low text-secondary border-outline-variant/30 hover:bg-surface-container"
                        }`}
                      >
                        <span>{isSelected ? "✓" : "+"}</span>
                        <span>{et}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Multi-Point Isolation & Padlocks */}
          {step === 3 && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span>Tahap 3: Rincian Titik Penguncian Padlock / Tag ({formData.isolationPoints.length} Titik)</span>
                </h2>
                <button
                  type="button"
                  onClick={addIsolationPoint}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Titik</span>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {formData.isolationPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary font-mono text-xs">
                        Titik Isolasi #{idx + 1}
                      </span>
                      {formData.isolationPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIsolationPoint(idx)}
                          className="text-tertiary hover:text-error transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-secondary block mb-1">
                          Nama / Lokasi Titik
                        </label>
                        <input
                          type="text"
                          placeholder="Misal: Suction Valve Manual"
                          value={pt.pointName}
                          onChange={(e) => handlePointChange(idx, "pointName", e.target.value)}
                          className="w-full p-2 rounded bg-surface-container-lowest border border-outline-variant/30 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-secondary block mb-1">
                          Sub Kode KKS (bila spesifik)
                        </label>
                        <input
                          type="text"
                          placeholder="Misal: 10LBA10AA001-V01"
                          value={pt.kksCode}
                          onChange={(e) => handlePointChange(idx, "kksCode", e.target.value)}
                          className="w-full p-2 rounded bg-surface-container-lowest border border-outline-variant/30 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-secondary block mb-1">
                          Metode Isolasi Fisik
                        </label>
                        <input
                          type="text"
                          placeholder="Misal: Closed, Chain Padlocked"
                          value={pt.isolationMethod}
                          onChange={(e) => handlePointChange(idx, "isolationMethod", e.target.value)}
                          className="w-full p-2 rounded bg-surface-container-lowest border border-outline-variant/30 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-secondary block mb-1">
                          Nomor Padlock (Gembok)
                        </label>
                        <input
                          type="text"
                          placeholder="Misal: LB-012"
                          value={pt.padlockNumber}
                          onChange={(e) => handlePointChange(idx, "padlockNumber", e.target.value)}
                          className="w-full p-2 rounded bg-surface-container-lowest border border-outline-variant/30 text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-secondary block mb-1">
                          Nomor Danger Tag
                        </label>
                        <input
                          type="text"
                          placeholder="Misal: TAG-012"
                          value={pt.tagNumber}
                          onChange={(e) => handlePointChange(idx, "tagNumber", e.target.value)}
                          className="w-full p-2 rounded bg-surface-container-lowest border border-outline-variant/30 text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-secondary block mb-1">
                          Metode Pengujian Bebas Energi
                        </label>
                        <input
                          type="text"
                          placeholder="Misal: Multimeter 0V / Pressure Gauge 0 Bar"
                          value={pt.verificationMethod}
                          onChange={(e) => handlePointChange(idx, "verificationMethod", e.target.value)}
                          className="w-full p-2 rounded bg-surface-container-lowest border border-outline-variant/30 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Verifikasi & Otorisasi K3 */}
          {step === 4 && (
            <div className="flex flex-col gap-4 text-xs">
              <h2 className="text-sm font-bold text-on-surface pb-2 border-b border-outline-variant/20 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Tahap 4: Pemeriksaan Persyaratan K3 & Konfirmasi Registrasi</span>
              </h2>

              <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
                <span className="font-bold text-on-surface block text-xs">
                  Ringkasan Registrasi LOTO:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-secondary block">Peralatan:</span>
                    <strong className="text-on-surface">{formData.namaPeralatan || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-secondary block">KKS:</span>
                    <strong className="text-primary font-mono">{formData.kks || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-secondary block">Unit & Shift:</span>
                    <strong className="text-on-surface">{formData.unit} (Shift {formData.shift})</strong>
                  </div>
                  <div>
                    <span className="text-secondary block">Jumlah Titik:</span>
                    <strong className="text-on-surface">{formData.isolationPoints.length} Titik</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#fee2e2]/60 border border-[#fecaca] text-[#991b1b] flex flex-col gap-2">
                <span className="font-bold block">Checklist Mandatori Lapangan Sebelum Pengajuan:</span>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.zeroEnergyCheck}
                    onChange={(e) => handleTextChange("zeroEnergyCheck", e.target.checked)}
                    className="rounded text-primary w-4 h-4"
                  />
                  <span>Telah dilakukan isolasi fisik dan pengujian bebas energi (Zero Energy State) di lokasi peralatan.</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.padlockAffixedCheck}
                    onChange={(e) => handleTextChange("padlockAffixedCheck", e.target.checked)}
                    className="rounded text-primary w-4 h-4"
                  />
                  <span>Padlock pengunci fisik dan label tag bahaya LOTO telah dipasang dan dikunci secara aman.</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.areaClearCheck}
                    onChange={(e) => handleTextChange("areaClearCheck", e.target.checked)}
                    className="rounded text-primary w-4 h-4"
                  />
                  <span>Area kerja aman dan personel yang berwenang siap melaksanakan pekerjaan pemeliharaan.</span>
                </label>
              </div>

              <div className="text-[11px] text-secondary">
                * Setelah draf disimpan, status awal akan menjadi <strong>Draft</strong> dan menunggu pengesahan inspeksi oleh <strong>Verifikator K3</strong> untuk berubah menjadi <strong>Aktif</strong>.
              </div>
            </div>
          )}

          {/* Stepper Footer Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-outline-variant/30 text-xs font-semibold hover:bg-surface-container"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !formData.namaPeralatan) {
                    alert("Nama peralatan wajib diisi!");
                    return;
                  }
                  if (step === 2 && !formData.kks) {
                    alert("Kode KKS wajib diisi!");
                    return;
                  }
                  setStep((s) => s + 1);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container"
              >
                <span>Langkah Selanjutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-md disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Menyimpan ke Database..." : "Simpan Formulir LOTO"}</span>
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
