"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  Printer,
  Plus,
  Eye,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { formatDateWIB, getStatusBadgeClass } from "@/lib/utils";

export default function DataLotoPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "Semua";

  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [areaFilter, setAreaFilter] = useState("Semua");
  const [shiftFilter, setShiftFilter] = useState("Semua");
  const [typeFilter, setTypeFilter] = useState("Semua");

  // Drawer
  const [drawerCase, setDrawerCase] = useState<any | null>(null);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        status: statusFilter,
        area: areaFilter,
        shift: shiftFilter,
        type: typeFilter,
      });

      const res = await fetch(`/api/cases?${params.toString()}`);
      const result = await res.json();
      setCases(result.data || []);
      setTotal(result.pagination?.total || 0);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Gagal memuat data kasus:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [page, statusFilter, areaFilter, shiftFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCases();
  };

  const handleExport = (format: "xlsx" | "csv") => {
    const params = new URLSearchParams({
      format,
      status: statusFilter,
      area: areaFilter,
      shift: shiftFilter,
    });
    window.open(`/api/reports/export?${params.toString()}`, "_blank");
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-16">
      {/* Top Banner & Section Head */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-on-surface">Data LOTO Terpusat</h1>
            <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
              Master Data
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-primary bg-surface-container px-2 py-0.5 rounded font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
              KKS Active Base
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 max-w-3xl">
            Repositori resmi log isolasi mekanikal, elektrikal, dan instrumen PLTGU Cilegon CCGT (660 MW) • Standar K3L / SOP-CLG-LOTO-2026
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExport("xlsx")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container transition-colors text-xs font-semibold border border-outline-variant/30"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container transition-colors text-xs font-semibold border border-outline-variant/30"
          >
            <Printer className="w-4 h-4 text-secondary" />
            <span>Cetak Logsheet</span>
          </button>
          <Link
            href="/tambah-loto"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-white shadow-sm hover:bg-primary-container transition-colors text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah LOTO Baru</span>
          </Link>
        </div>
      </div>

      {/* Quick Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-on-surface block leading-tight">
                {total}
              </span>
              <span className="text-[11px] text-on-surface-variant font-medium">Total Tag LOTO</span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-surface-container text-primary px-2 py-0.5 rounded">
            Aktif & Arsip
          </span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-error-container/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center text-tertiary">
              <Lock className="w-5 h-5 text-tertiary" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-tertiary block leading-tight">31</span>
              <span className="text-[11px] text-on-surface-variant font-medium">Aktif Terisolasi</span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-error-container text-tertiary px-2 py-0.5 rounded">
            17.8%
          </span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#dcfce7] flex items-center justify-center text-[#15803d]">
              <CheckCircle2 className="w-5 h-5 text-[#15803d]" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-[#15803d] block leading-tight">143</span>
              <span className="text-[11px] text-on-surface-variant font-medium">Telah Release</span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded">
            82.2%
          </span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-[#fef3c7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#fef3c7] flex items-center justify-center text-[#b45309]">
              <AlertTriangle className="w-5 h-5 text-[#b45309]" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-[#b45309] block leading-tight">1</span>
              <span className="text-[11px] text-on-surface-variant font-medium">Verifikasi K3</span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-[#fef3c7] text-[#b45309] px-2 py-0.5 rounded">
            Perlu Tindakan
          </span>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-on-surface">Filter & Pencarian LOTO Multikriteria</span>
          </div>
          {(search || statusFilter !== "Semua" || areaFilter !== "Semua" || shiftFilter !== "Semua" || typeFilter !== "Semua") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("Semua");
                setAreaFilter("Semua");
                setShiftFilter("Semua");
                setTypeFilter("Semua");
                setPage(1);
              }}
              className="text-[11px] text-tertiary hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {/* Keyword Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-secondary" />
            <input
              type="text"
              placeholder="Cari KKS, Lock/Tag, Peralatan, No WO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-surface-container-low rounded-lg text-xs text-on-surface font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Release">Release</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option value="Permintaan Release">Permintaan Release</option>
            <option value="Draft">Draft</option>
          </select>

          {/* Area */}
          <select
            value={areaFilter}
            onChange={(e) => {
              setAreaFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-surface-container-low rounded-lg text-xs text-on-surface font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Semua">Semua Area / Unit</option>
            <option value="GT 1.1">GT 1.1</option>
            <option value="GT 1.2">GT 1.2</option>
            <option value="ST">ST 1.0 (Turbin Uap)</option>
            <option value="HRSG 1.1">HRSG 1.1</option>
            <option value="HRSG 1.2">HRSG 1.2</option>
            <option value="BOP">BOP / Common</option>
            <option value="Demin">Demin Water Plant</option>
          </select>

          {/* Shift */}
          <select
            value={shiftFilter}
            onChange={(e) => {
              setShiftFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-surface-container-low rounded-lg text-xs text-on-surface font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Semua">Semua Shift</option>
            <option value="A">Shift A</option>
            <option value="B">Shift B</option>
            <option value="C">Shift C</option>
            <option value="D">Shift D</option>
          </select>
        </form>
      </div>

      {/* Main Table Card */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/20 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3">Shift</th>
                <th className="py-3 px-3">No KKS</th>
                <th className="py-3 px-3">Lock / Tag</th>
                <th className="py-3 px-3">Tipe WO</th>
                <th className="py-3 px-3">Nama Peralatan</th>
                <th className="py-3 px-3">Lokasi / Unit</th>
                <th className="py-3 px-3">Bagian</th>
                <th className="py-3 px-3">Tgl Pasang</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15 text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-secondary">
                    Memuat data master LOTO...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-secondary">
                    Tidak ditemukan data yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                cases.map((c, idx) => {
                  const badge = getStatusBadgeClass(c.status);
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-surface-container-low/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-secondary">
                        {c.no || (page - 1) * limit + idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold">{c.shift}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-primary">
                        {c.kks}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold">
                        {c.nomorLockTag}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container text-secondary">
                          {c.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-on-surface max-w-[220px] truncate" title={c.namaPeralatan}>
                        {c.namaPeralatan}
                      </td>
                      <td className="py-2.5 px-3 text-secondary">{c.lokasiPeralatan || c.unit}</td>
                      <td className="py-2.5 px-3 text-secondary">{c.bagian}</td>
                      <td className="py-2.5 px-3 font-mono text-secondary">
                        {formatDateWIB(c.tanggal)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDrawerCase(c)}
                            className="p-1 rounded bg-surface-container hover:bg-surface-container-high text-primary transition-colors"
                            title="Pratinjau Cepat"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/loto/${c.id}`}
                            className="p-1 rounded bg-surface-container-high hover:bg-primary hover:text-white text-on-surface transition-colors"
                            title="Buka Kasus Penuh"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-surface-container-low/40 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-secondary">
          <span>
            Menampilkan data {(page - 1) * limit + 1} s/d{" "}
            {Math.min(page * limit, total)} dari total {total} entri
          </span>

          <div className="flex items-center gap-1 self-center sm:self-auto">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-on-surface">
              Hal {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Inspection Drawer */}
      {drawerCase && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-lg bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-outline-variant/20 p-6 animate-in slide-in-from-right duration-300">
            <div>
              {/* Drawer Head */}
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-surface-container px-2 py-0.5 rounded text-primary">
                    {drawerCase.caseNumber}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      getStatusBadgeClass(drawerCase.status).bg
                    }`}
                  >
                    {drawerCase.status}
                  </span>
                </div>
                <button
                  onClick={() => setDrawerCase(null)}
                  className="p-1.5 rounded-lg text-secondary hover:bg-surface-container transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="py-4 flex flex-col gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-secondary uppercase tracking-wider block font-bold">
                    Nama Peralatan
                  </span>
                  <h3 className="text-sm font-bold text-on-surface mt-0.5">
                    {drawerCase.namaPeralatan}
                  </h3>
                  <p className="text-secondary text-[11px] mt-0.5">
                    {drawerCase.lokasiPeralatan} • {drawerCase.unit}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <div>
                    <span className="text-[10px] text-secondary block">No KKS</span>
                    <span className="font-mono font-bold text-primary">{drawerCase.kks}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary block">Nomor Lock / Tag</span>
                    <span className="font-mono font-bold text-on-surface">{drawerCase.nomorLockTag}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary block">Shift & Tipe</span>
                    <span className="font-semibold text-on-surface">
                      Shift {drawerCase.shift} • {drawerCase.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary block">Tanggal Pasang</span>
                    <span className="font-mono text-on-surface">{formatDateWIB(drawerCase.tanggal)}</span>
                  </div>
                </div>

                {/* Isolation Points */}
                <div>
                  <span className="text-[10px] text-secondary uppercase tracking-wider block font-bold mb-1.5">
                    Titik Isolasi & Padlock ({drawerCase.isolationPoints?.length || 1})
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {(drawerCase.isolationPoints || [
                      {
                        pointNumber: 1,
                        pointName: drawerCase.namaPeralatan,
                        padlockNumber: drawerCase.nomorLockTag,
                        tagNumber: `TAG-${drawerCase.nomorLockTag}`,
                        energyType: "Mekanik",
                      },
                    ]).map((pt: any, i: number) => (
                      <div
                        key={i}
                        className="p-2 rounded bg-surface-container-low flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <span className="font-bold text-on-surface block">
                            #{pt.pointNumber} {pt.pointName}
                          </span>
                          <span className="text-[10px] text-secondary">
                            Energi: {pt.energyType} • Padlock: {pt.padlockNumber}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-primary bg-surface-container px-1.5 py-0.5 rounded">
                          {pt.tagNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <span className="text-[10px] text-secondary uppercase tracking-wider block font-bold mb-1">
                    Tindakan Isolasi & Pelaksana
                  </span>
                  <div className="p-2.5 rounded bg-surface-container-low text-[11px] leading-relaxed">
                    <p>
                      <strong>Eksekusi:</strong> {drawerCase.eksekusi || "-"}
                    </p>
                    <p className="mt-1">
                      <strong>Executor:</strong> {drawerCase.executor || "-"}
                    </p>
                    <p className="mt-1">
                      <strong>Verifikasi K3:</strong> {drawerCase.verifikasiK3 || "-"}
                    </p>
                    {drawerCase.tanggalRelease && (
                      <p className="mt-1 text-[#15803d]">
                        <strong>Tanggal Release:</strong> {formatDateWIB(drawerCase.tanggalRelease)} (
                        {drawerCase.penormalan || "Normal"})
                      </p>
                    )}
                  </div>
                </div>

                {/* Keterangan */}
                {drawerCase.keterangan && (
                  <div>
                    <span className="text-[10px] text-secondary uppercase tracking-wider block font-bold mb-1">
                      Keterangan Logsheet
                    </span>
                    <p className="p-2.5 rounded bg-surface-container-low text-[11px] text-on-surface leading-relaxed">
                      {drawerCase.keterangan}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer CTA */}
            <div className="pt-4 border-t border-outline-variant/20 flex items-center gap-2">
              <Link
                href={`/loto/${drawerCase.id}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white font-bold text-xs hover:bg-primary-container transition-colors shadow-sm"
              >
                <span>Buka Lembar Kerja Kasus Penuh</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
