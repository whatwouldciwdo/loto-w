"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import {
  Database,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Plus,
  Search,
  ExternalLink,
  ShieldAlert,
  FileCheck2,
  RefreshCw,
  Clock,
  Layers,
} from "lucide-react";
import { formatDateWIB, getStatusBadgeClass } from "@/lib/utils";

export default function DashboardPage() {
  const { selectedShift, setSelectedShift } = useRole();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("Semua");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Gagal memuat statistik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const filteredActiveList = (stats?.activeLotoList || []).filter((item: any) => {
    const matchesShift = selectedShift === "Semua" || item.shift === selectedShift;
    const matchesArea =
      selectedArea === "Semua" ||
      (item.lokasiPeralatan && item.lokasiPeralatan.includes(selectedArea)) ||
      (item.unit && item.unit.includes(selectedArea));
    const matchesSearch =
      !search ||
      item.kks?.toLowerCase().includes(search.toLowerCase()) ||
      item.nomorLockTag?.toLowerCase().includes(search.toLowerCase()) ||
      item.namaPeralatan?.toLowerCase().includes(search.toLowerCase());
    return matchesShift && matchesArea && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Disclaimer Notice Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface-container-low px-5 py-3 rounded-xl shadow-sm border border-outline-variant/30 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#22c55e]/15 text-[#15803d] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
          </div>
          <span className="text-[13px] text-on-surface-variant font-medium">
            <strong className="text-on-surface font-semibold">
              Pratinjau data Excel UBP Cilegon
            </strong>{" "}
            • Ref. Dokumen CLG.05.01.31 • Sinkronisasi Data: 12 Jan 2026 12:00 WIB
          </span>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-bold text-primary bg-primary-fixed/50 px-2 py-0.5 rounded font-mono">
            ID: CLG-LOTO-2026-Q1
          </span>
        </div>
      </div>

      {/* 4 Interactive KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Data */}
        <Link
          href="/data-loto"
          className="bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group border border-outline-variant/20"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-on-surface block tracking-tight">
                {loading ? "..." : stats?.total || 174}
              </span>
              <span className="text-xs text-on-surface-variant font-bold">Total Tag LOTO</span>
            </div>
          </div>
          <div className="mt-4 pt-1 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-surface-container px-2 py-0.5 rounded">
              LOTO_2026 Database
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        {/* Card 2: Aktif */}
        <Link
          href="/data-loto?status=Aktif"
          className="bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group border border-error-container/40"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-[#fee2e2] text-tertiary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Lock className="w-6 h-6 text-tertiary" />
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-3xl font-extrabold text-tertiary block tracking-tight">
                  {loading ? "..." : stats?.aktif || 31}
                </span>
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              </div>
              <span className="text-xs text-on-surface-variant font-bold">Aktif Terisolasi</span>
            </div>
          </div>
          <div className="mt-4 pt-1 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-tertiary bg-error-container/60 px-2 py-0.5 rounded">
              17.8% Beban Isolasi
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        {/* Card 3: Release */}
        <Link
          href="/data-loto?status=Release"
          className="bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group border border-outline-variant/20"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-[#dcfce7] text-[#15803d] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6 text-[#15803d]" />
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-[#15803d] block tracking-tight">
                {loading ? "..." : stats?.release || 143}
              </span>
              <span className="text-xs text-on-surface-variant font-bold">Telah Release / Aman</span>
            </div>
          </div>
          <div className="mt-4 pt-1 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded">
              82.2% Ternormalisasi
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#15803d] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        {/* Card 4: Perlu Validasi */}
        <Link
          href="/verifikasi"
          className="bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group border border-[#fef3c7]"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6 text-[#b45309]" />
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-[#b45309] block tracking-tight">
                {loading ? "..." : stats?.perluValidasi || 1}
              </span>
              <span className="text-xs text-on-surface-variant font-bold">Perlu Tindakan K3</span>
            </div>
          </div>
          <div className="mt-4 pt-1 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b45309] bg-[#fef3c7] px-2 py-0.5 rounded">
              Antrean Verifikasi Lapangan
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#b45309] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      </div>

      {/* Main Grid: 8 cols monitoring + 4 cols actionable workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Data Table + Bar Chart Distribution */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Card: Daftar LOTO Aktif */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-4">
            {/* Header & CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-on-surface">
                    Daftar LOTO Aktif Terisolasi
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Peralatan dalam kondisi terkunci fisik dan diisolasi dari sumber energi berbahaya
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/tambah-loto"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah LOTO</span>
                </Link>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-secondary" />
                <input
                  type="text"
                  placeholder="Cari KKS, Tag, Peralatan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-3 py-1.5 bg-surface-container-low rounded-lg text-xs text-on-surface font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Semua">Semua Area & Unit</option>
                <option value="GT 1.1">GT 1.1</option>
                <option value="GT 1.2">GT 1.2</option>
                <option value="ST">ST 1.0 (Turbin Uap)</option>
                <option value="HRSG 1.1">HRSG 1.1</option>
                <option value="HRSG 1.2">HRSG 1.2</option>
                <option value="BOP">BOP / Common</option>
                <option value="Demin">Demin Water Plant</option>
              </select>

              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="px-3 py-1.5 bg-surface-container-low rounded-lg text-xs text-on-surface font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Semua">Semua Shift Kerja</option>
                <option value="A">Shift A</option>
                <option value="B">Shift B</option>
                <option value="C">Shift C</option>
                <option value="D">Shift D</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-outline-variant/30 mt-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/20 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Shift</th>
                    <th className="py-2.5 px-3">No KKS</th>
                    <th className="py-2.5 px-3">Lock/Tag</th>
                    <th className="py-2.5 px-3">Nama Peralatan</th>
                    <th className="py-2.5 px-3">Lokasi / Unit</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15 text-on-surface">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-secondary">
                        Memuat data LOTO aktif...
                      </td>
                    </tr>
                  ) : filteredActiveList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-secondary">
                        Tidak ada LOTO Aktif yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredActiveList.map((item: any, idx: number) => {
                      const badge = getStatusBadgeClass(item.status);
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-surface-container-low/50 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-mono text-secondary">{item.no || idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold">{item.shift}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-primary">
                            {item.kks}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold">
                            {item.nomorLockTag}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-on-surface max-w-xs truncate">
                            {item.namaPeralatan}
                          </td>
                          <td className="py-2.5 px-3 text-secondary">{item.lokasiPeralatan || item.unit}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Link
                              href={`/loto/${item.id}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-container px-2 py-1 rounded bg-surface-container-high/40 hover:bg-surface-container-high transition-colors"
                            >
                              <span>Detail</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-secondary pt-1">
              <span>
                Menampilkan {filteredActiveList.length} dari {stats?.aktif || 31} LOTO Aktif
              </span>
              <Link
                href="/data-loto"
                className="font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Lihat Seluruh Master Data Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card: Sebaran LOTO per Unit Pembangkit */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-on-surface">
                    Distribusi Isolasi per Unit Pembangkit
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Total sebaran kasus LOTO di blok CCGT PLTGU Cilegon (660 MW)
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-secondary bg-surface-container-high px-2 py-0.5 rounded font-bold font-mono">
                Aktif & Riwayat
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {(stats?.unitDistribution || [
                { name: "GT 1.1", count: 28 },
                { name: "GT 1.2", count: 32 },
                { name: "ST 1.0", count: 36 },
                { name: "HRSG 1.1", count: 30 },
                { name: "HRSG 1.2", count: 27 },
                { name: "BOP / Common", count: 21 },
              ]).map((unit: any) => {
                const total = stats?.total || 174;
                const percentage = Math.round((unit.count / (total || 1)) * 100);
                return (
                  <div
                    key={unit.name}
                    className="p-3.5 rounded-lg bg-surface-container-low/60 border border-outline-variant/20 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-on-surface">{unit.name}</span>
                      <span className="text-xs font-mono font-extrabold text-primary">
                        {unit.count} Kasus
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-[10px] text-secondary flex justify-between">
                      <span>Porsi total</span>
                      <span className="font-semibold">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Actionable Workflows & Protocol Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Action Cards: Quick Navigation */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
              Tindak Lanjut & Alur Kerja
            </h3>

            {/* Item 1: Antrean Verifikasi */}
            <Link
              href="/verifikasi"
              className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#fef3c7] text-[#b45309] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">
                    Antrean Verifikasi K3
                  </div>
                  <div className="text-[11px] text-secondary">
                    1 LOTO Menunggu Verifikasi Lapangan
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
            </Link>

            {/* Item 2: Serah Terima Shift */}
            <Link
              href="/serah-terima-shift"
              className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">
                    Serah Terima Shift
                  </div>
                  <div className="text-[11px] text-secondary">
                    Ringkasan {stats?.aktif || 31} status aktif antar-regu
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
            </Link>

            {/* Item 3: Impor Excel */}
            <Link
              href="/impor"
              className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#dcfce7] text-[#15803d] flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">
                    Pusat Impor Logsheet Excel
                  </div>
                  <div className="text-[11px] text-secondary">
                    Pratinjau, mapping kolom, & deteksi anomali
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
            </Link>
          </div>

          {/* Workflow Stepper Illustration */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">
              Standar Alur Proses LOTO Digital
            </h3>
            <div className="flex flex-col gap-2 pt-1">
              {[
                { no: 1, title: "1. Pengajuan LOTO", desc: "Input WO, KKS & titik isolasi", color: "bg-surface-container text-primary" },
                { no: 2, title: "2. Isolasi Fisik", desc: "Tindakan penguncian oleh pelaksana", color: "bg-surface-container text-primary" },
                { no: 3, title: "3. Verifikasi K3 (Zero Energy)", desc: "Pemeriksaan bebas tegangan / tekanan", color: "bg-[#fef3c7] text-[#b45309]" },
                { no: 4, title: "4. Status Aktif", desc: "Pekerjaan mekanikal / elektrikal berjalan", color: "bg-[#fee2e2] text-tertiary" },
                { no: 5, title: "5. Release & Penormalan", desc: "Otorisasi multi-pihak & pelepasan gembok", color: "bg-[#dcfce7] text-[#15803d]" },
              ].map((st) => (
                <div key={st.no} className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-container-low/50">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${st.color} shrink-0 mt-0.5`}>
                    {st.no}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-on-surface block leading-tight">
                      {st.title}
                    </span>
                    <span className="text-[10px] text-secondary block">{st.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 p-2.5 rounded-lg bg-surface-container text-[11px] text-on-surface-variant leading-relaxed">
              <strong>Pemberitahuan Keselamatan:</strong> Sistem ini tidak mengoperasikan katup atau sakelar breaker secara remote. Isolasi dan verifikasi bebas energi <em>wajib dilakukan secara fisik</em> oleh personel berwenang sesuai SOP.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
