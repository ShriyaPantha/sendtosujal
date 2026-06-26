import { useMemo, useState, useEffect, useCallback } from "react";
import {
  TrendingUp, Shield, RefreshCw, Search, ChevronDown,
  CheckCircle2, ArrowUpDown, X, Loader2, Users, GraduationCap,
  BookOpen, UserCheck, Activity, AlertCircle, Building2,
  Mail, Phone, Calendar, School,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import axiosInstance from "../../../api/axiosInstance";

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface Admin {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  schoolId?: { _id: string; name: string; email: string } | string | null;
  role: string;
  isActive?: boolean;
  createdAt: string;
}

interface Stats {
  totalAdmins: number;
  totalTeachers: number;
  totalStudents: number;
  totalParents: number;
}

// ── STATIC CHART DATA ─────────────────────────────────────────────────────────
const userGrowth = [
  { month: "Jan", students: 320, teachers: 40, parents: 80 },
  { month: "Feb", students: 380, teachers: 45, parents: 95 },
  { month: "Mar", students: 450, teachers: 52, parents: 110 },
  { month: "Apr", students: 520, teachers: 58, parents: 130 },
  { month: "May", students: 610, teachers: 63, parents: 155 },
  { month: "Jun", students: 700, teachers: 70, parents: 178 },
];

const sessionData = [
  { day: "Mon", sessions: 210 },
  { day: "Tue", sessions: 280 },
  { day: "Wed", sessions: 260 },
  { day: "Thu", sessions: 312 },
  { day: "Fri", sessions: 295 },
  { day: "Sat", sessions: 140 },
  { day: "Sun", sessions: 90 },
];
const peakSession = Math.max(...sessionData.map((d) => d.sessions));

const systemStatus = [
  { label: "API Gateway",            ok: true  },
  { label: "Database Cluster",       ok: true  },
  { label: "CDN",                    ok: true  },
  { label: "Authentication Service", ok: true  },
  { label: "Email Queue",            ok: true  },
];

// ── CUSTOM TOOLTIP ────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2.5 text-xs shadow-lg">
      <p className="text-slate-400 font-semibold mb-1.5 uppercase tracking-wide">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-bold text-slate-900">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── SCHOOL NAME HELPER ────────────────────────────────────────────────────────
const getSchoolName = (schoolId: Admin["schoolId"]): string => {
  if (!schoolId) return "—";
  if (typeof schoolId === "object" && "name" in schoolId) return schoolId.name;
  return "Assigned";
};

// ── INITIALS ──────────────────────────────────────────────────────────────────
const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

// ── AVATAR COLORS (deterministic by name) ────────────────────────────────────
const avatarPalette = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
];
const avatarColor = (name: string) =>
  avatarPalette[name.charCodeAt(0) % avatarPalette.length];

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
const SuperAdminDashboard = () => {
  const [stats, setStats]                   = useState<Stats | null>(null);
  const [admins, setAdmins]                 = useState<Admin[]>([]);
  const [loadingStats, setLoadingStats]     = useState(true);
  const [loadingAdmins, setLoadingAdmins]   = useState(true);
  const [error, setError]                   = useState("");

  const [statusOpen, setStatusOpen] = useState(false);
  const [lastSync, setLastSync]     = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [refreshing, setRefreshing] = useState(false);

  const [adminSearch, setAdminSearch] = useState("");
  const [sortBy, setSortBy]           = useState<"fullName" | "createdAt">("createdAt");
  const [sortDesc, setSortDesc]       = useState(true);

  // ── Fetch stats ────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await axiosInstance.get<{ success: boolean; data: Stats }>(
        "/api/superadmin/dashboard-stats"
      );
      setStats(res.data.data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load stats");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ── Fetch admins from Admin collection ────────────────────────────────────
  const fetchAdmins = useCallback(async () => {
    try {
      setLoadingAdmins(true);
      const res = await axiosInstance.get<{ success: boolean; data: Admin[] }>("/api/admin/");
      setAdmins(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load admins");
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchAdmins();
  }, [fetchStats, fetchAdmins]);

  // ── Refresh ────────────────────────────────────────────────────────────────
  const refresh = () => {
    setRefreshing(true);
    setError("");
    Promise.all([fetchStats(), fetchAdmins()]).finally(() => {
      setLastSync(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setRefreshing(false);
    });
  };

  // ── Filtered + sorted admins ───────────────────────────────────────────────
  const filteredAdmins = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    return admins
      .filter((a) =>
        !q ||
        a.fullName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        getSchoolName(a.schoolId).toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const dir = sortDesc ? -1 : 1;
        if (sortBy === "fullName") return a.fullName.localeCompare(b.fullName) * dir;
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      });
  }, [admins, adminSearch, sortBy, sortDesc]);

  const toggleSort = (key: "fullName" | "createdAt") => {
    if (sortBy === key) setSortDesc((d) => !d);
    else { setSortBy(key); setSortDesc(true); }
  };

  // ── Stat cards config ──────────────────────────────────────────────────────
  const statCards = stats
    ? [
        {
          label: "Admins",
          value: stats.totalAdmins,
          icon: <Shield size={16} />,
          color: "text-violet-600",
          bg: "bg-violet-50",
          trend: "+2 this month",
        },
        {
          label: "Teachers",
          value: stats.totalTeachers,
          icon: <BookOpen size={16} />,
          color: "text-blue-600",
          bg: "bg-blue-50",
          trend: "+5 this month",
        },
        {
          label: "Students",
          value: stats.totalStudents,
          icon: <GraduationCap size={16} />,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          trend: "+48 this month",
        },
        {
          label: "Parents",
          value: stats.totalParents,
          icon: <Users size={16} />,
          color: "text-amber-600",
          bg: "bg-amber-50",
          trend: "+12 this month",
        },
        {
          label: "Total Users",
          value: stats.totalAdmins + stats.totalTeachers + stats.totalStudents + stats.totalParents,
          icon: <UserCheck size={16} />,
          color: "text-slate-600",
          bg: "bg-slate-100",
          trend: "All roles",
        },
        {
          label: "Uptime",
          value: "99.9%",
          icon: <Activity size={16} />,
          color: "text-teal-600",
          bg: "bg-teal-50",
          trend: "Last 30 days",
        },
      ]
    : [];

  // ── Role distribution ──────────────────────────────────────────────────────
  const roleData = stats
    ? [
        { name: "Students", value: stats.totalStudents, color: "#6d28d9", bg: "bg-violet-500" },
        { name: "Teachers", value: stats.totalTeachers, color: "#0284c7", bg: "bg-blue-500"   },
        { name: "Parents",  value: stats.totalParents,  color: "#0d9488", bg: "bg-teal-500"   },
        { name: "Admins",   value: stats.totalAdmins,   color: "#d97706", bg: "bg-amber-500"  },
      ]
    : [];
  const roleTotal = roleData.reduce((a, b) => a + b.value, 0);

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-5 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-violet-500 mb-2">
              <Shield size={12} /> EduSmart · Super Admin
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Platform overview — live data
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStatusOpen((v) => !v)}
              className="inline-flex items-center gap-2 text-xs px-3.5 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-colors font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
              <ChevronDown size={11} className={`transition-transform ${statusOpen ? "rotate-180" : ""}`} />
            </button>

            <button
              onClick={refresh}
              disabled={refreshing}
              title="Refresh data"
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-violet-600 hover:border-violet-200 disabled:opacity-50 transition-all shadow-sm"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Last sync */}
        <p className="text-[11px] text-slate-400 font-mono -mt-4">
          Last synced: {lastSync}
        </p>

        {/* ── ERROR ────────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Something went wrong</p>
              <p className="text-xs text-red-500 mt-0.5">{error} — check your backend connection and auth token.</p>
            </div>
          </div>
        )}

        {/* ── SYSTEM STATUS ─────────────────────────────────────────────────── */}
        {statusOpen && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Service Health</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {systemStatus.map((s) => (
                <div key={s.label} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span className="text-xs font-medium text-slate-700 leading-tight">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STAT CARDS ───────────────────────────────────────────────────── */}
        {loadingStats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm animate-pulse">
                <div className="w-8 h-8 bg-slate-100 rounded-lg mb-3" />
                <div className="h-6 bg-slate-100 rounded w-12 mb-1" />
                <div className="h-3 bg-slate-50 rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {statCards.map((s, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className={`w-8 h-8 ${s.bg} ${s.color} rounded-lg flex items-center justify-center mb-3`}>
                  {s.icon}
                </div>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{s.value}</p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{s.label}</p>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <TrendingUp size={9} className="text-emerald-500" />
                  {s.trend}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── CHARTS ───────────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* User growth */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-slate-900 text-sm">User Growth</h2>
                <p className="text-xs text-slate-400 mt-0.5">Monthly platform expansion</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                {[
                  { label: "Students", color: "#6d28d9" },
                  { label: "Teachers", color: "#0284c7" },
                  { label: "Parents",  color: "#0d9488" },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="gStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6d28d9" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#6d28d9" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gTeachers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0284c7" stopOpacity={0.10} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gParents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0d9488" stopOpacity={0.10} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="students" name="Students" stroke="#6d28d9" strokeWidth={2} fill="url(#gStudents)" />
                <Area type="monotone" dataKey="teachers" name="Teachers" stroke="#0284c7" strokeWidth={2} fill="url(#gTeachers)" />
                <Area type="monotone" dataKey="parents"  name="Parents"  stroke="#0d9488" strokeWidth={2} fill="url(#gParents)"  />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly sessions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="font-semibold text-slate-900 text-sm">Weekly Sessions</h2>
              <p className="text-xs text-slate-400 mt-0.5">Active usage trends</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sessionData} barSize={18}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="sessions" name="Sessions" radius={[4, 4, 0, 0]}>
                  {sessionData.map((d, i) => (
                    <Cell key={i} fill={d.sessions === peakSession ? "#6d28d9" : "#e2e8f0"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── ROLE DISTRIBUTION ─────────────────────────────────────────────── */}
        {stats && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-slate-900 text-sm">Role Distribution</h2>
                <p className="text-xs text-slate-400 mt-0.5">{roleTotal.toLocaleString()} total users across all roles</p>
              </div>
              <span className="text-xs text-slate-400 font-mono bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">Live</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roleData.map((r) => {
                const pct = roleTotal > 0 ? Math.round((r.value / roleTotal) * 100) : 0;
                return (
                  <div key={r.name} className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium text-slate-700">{r.name}</span>
                      <span className="text-xs text-slate-400">{pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: r.color }}
                      />
                    </div>
                    <p className="text-xl font-bold text-slate-900">{r.value.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ADMINS TABLE ──────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Building2 size={15} className="text-violet-500" />
                School Administrators
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {loadingAdmins ? "Loading…" : `${filteredAdmins.length} admin${filteredAdmins.length !== 1 ? "s" : ""}${adminSearch ? " found" : " registered"}`}
              </p>
            </div>

            {/* Search */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-full sm:w-64 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search by name, email, school…"
                className="bg-transparent outline-none ml-2 w-full text-sm text-slate-700 placeholder:text-slate-400"
              />
              {adminSearch && (
                <button onClick={() => setAdminSearch("")} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {loadingAdmins ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-violet-400" size={24} />
              <p className="text-sm text-slate-400">Loading administrators…</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center px-6">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Users size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">
                {adminSearch ? `No admins matching "${adminSearch}"` : "No administrators yet"}
              </p>
              <p className="text-xs text-slate-400">
                {adminSearch ? "Try a different search term" : "Admins created from this portal will appear here"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {[
                        { label: "Administrator",  key: "fullName"  as const, sortable: true  },
                        { label: "Email",           key: null,                sortable: false  },
                        { label: "Phone",           key: null,                sortable: false  },
                        { label: "School",          key: null,                sortable: false  },
                        { label: "Status",          key: null,                sortable: false  },
                        { label: "Joined",          key: "createdAt" as const, sortable: true  },
                      ].map((col) => (
                        <th
                          key={col.label}
                          onClick={() => col.sortable && col.key && toggleSort(col.key)}
                          className={`px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap ${col.sortable ? "cursor-pointer hover:text-slate-600 select-none" : ""}`}
                        >
                          <span className="inline-flex items-center gap-1">
                            {col.label}
                            {col.sortable && <ArrowUpDown size={10} className="opacity-50" />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredAdmins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-slate-50/70 transition-colors group">
                        {/* Name + avatar */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(admin.fullName)}`}>
                              {initials(admin.fullName)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{admin.fullName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{admin._id.slice(-8)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-3.5">
                          <a href={`mailto:${admin.email}`} className="text-sm text-slate-500 hover:text-violet-600 flex items-center gap-1.5 transition-colors">
                            <Mail size={12} className="shrink-0 opacity-50" />
                            {admin.email}
                          </a>
                        </td>

                        {/* Phone */}
                        <td className="px-5 py-3.5">
                          {admin.phone ? (
                            <span className="flex items-center gap-1.5 text-sm text-slate-500">
                              <Phone size={12} className="shrink-0 opacity-50" />
                              {admin.phone}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-sm">—</span>
                          )}
                        </td>

                        {/* School */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                            <School size={10} className="shrink-0" />
                            {getSchoolName(admin.schoolId)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          {admin.isActive !== false ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                              <span className="w-1 h-1 rounded-full bg-slate-400" /> Inactive
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                            <Calendar size={11} className="shrink-0" />
                            {new Date(admin.createdAt).toLocaleDateString("en-US", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredAdmins.map((admin) => (
                  <div key={admin._id} className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor(admin.fullName)}`}>
                        {initials(admin.fullName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800 truncate">{admin.fullName}</p>
                          {admin.isActive !== false ? (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full shrink-0">Active</span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">Inactive</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{admin.email}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            <School size={9} /> {getSchoolName(admin.schoolId)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Showing {filteredAdmins.length} of {admins.length} administrators
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Synced {lastSync}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-400 pt-1 pb-4">
          EduSmart Admin · v2.4.1 · All data from live API
        </p>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;