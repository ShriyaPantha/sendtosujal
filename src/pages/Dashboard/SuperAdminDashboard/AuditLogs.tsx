import React, { useEffect, useState } from "react";
import {
  FaSignInAlt, FaUserPlus, FaCog, FaShieldAlt,
  FaSearch, FaFilter, FaDownload,
} from "react-icons/fa";
import axiosInstance from "../../../api/axiosInstance";
import { FaRotateRight } from "react-icons/fa6";

type Category = "Auth" | "User" | "Settings" | "Security";
type Status   = "success" | "warning" | "danger";

interface Log {
  _id?:     string;
  action:   string;
  user:     string;
  role:     string;
  time:     string;
  date:     string;
  category: Category;
  status:   Status;
  ip?:      string;
}

const catIcon: Record<Category, React.ElementType> = {
  Auth: FaSignInAlt, User: FaUserPlus,
  Settings: FaCog,  Security: FaShieldAlt,
};

const catColor: Record<Category, string> = {
  Auth:     "bg-blue-50 text-blue-700",
  User:     "bg-emerald-50 text-emerald-700",
  Settings: "bg-violet-50 text-violet-700",
  Security: "bg-amber-50 text-amber-700",
};

const pillColor: Record<Category, string> = {
  Auth:     "bg-blue-50 text-blue-800",
  User:     "bg-emerald-50 text-emerald-800",
  Settings: "bg-violet-50 text-violet-800",
  Security: "bg-amber-50 text-amber-800",
};

const statusStyle: Record<Status, { badge: string; dot: string; label: string }> = {
  success: { badge: "bg-green-50 text-green-800",  dot: "bg-green-500",  label: "Success"  },
  warning: { badge: "bg-amber-50 text-amber-800",  dot: "bg-amber-500",  label: "Warning"  },
  danger:  { badge: "bg-red-50 text-red-800",      dot: "bg-red-500",    label: "Critical" },
};

const AuditLogs: React.FC = () => {
  const [logs,    setLogs]    = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [cat,     setCat]     = useState("All");
  const [status,  setStatus]  = useState("All");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/api/audit-logs");
      setLogs(res.data?.data ?? res.data ?? []);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Failed to load audit logs";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter((l) =>
    (l.action?.toLowerCase().includes(search.toLowerCase()) ||
     l.user?.toLowerCase().includes(search.toLowerCase())) &&
    (cat    === "All" || l.category === cat) &&
    (status === "All" || l.status   === status)
  );

  const grouped = filtered.reduce<Record<string, Log[]>>((acc, l) => {
    const d = l.date || "Unknown";
    acc[d] = [...(acc[d] || []), l];
    return acc;
  }, {});

  const exportCSV = () => {
    const rows = [
      ["Date", "Time", "Action", "User", "Role", "Category", "Status", "IP"],
      ...filtered.map((l) => [
        l.date, l.time, l.action, l.user, l.role,
        l.category, l.status, l.ip ?? "—",
      ]),
    ];
    const csv  = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "audit-logs.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: "Total events", value: logs.length,                                      color: "text-blue-700"  },
    { label: "Success",      value: logs.filter((l) => l.status === "success").length, color: "text-green-700" },
    { label: "Warnings",     value: logs.filter((l) => l.status === "warning").length, color: "text-amber-700" },
    { label: "Critical",     value: logs.filter((l) => l.status === "danger").length,  color: "text-red-700"   },
  ];

  const selectClass = "bg-transparent outline-none text-xs text-gray-500 cursor-pointer font-medium";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Audit Logs</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Track all system activity and user actions
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border
                border-gray-200 bg-white text-xs text-gray-500 hover:bg-gray-50
                transition-colors disabled:opacity-40"
            >
              <FaRotateRight className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={exportCSV}
              disabled={!filtered.length}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border
                border-gray-200 bg-white text-xs text-gray-500 hover:bg-gray-50
                transition-colors disabled:opacity-40"
            >
              <FaDownload className="text-xs" /> Export
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600
            text-xs px-4 py-3 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchLogs} className="underline ml-3">Retry</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {stats.map((s) => (
            <div key={s.label}
              className="bg-white border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              {loading
                ? <div className="h-6 w-12 bg-gray-100 rounded animate-pulse mt-1" />
                : <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-50 bg-white border
            border-gray-200 rounded-lg px-3 h-9">
            <FaSearch className="text-gray-300 text-xs shrink-0" />
            <input
              type="text"
              placeholder="Search action or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-xs text-gray-700
                placeholder-gray-300 w-full"
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200
            rounded-lg px-3 h-9">
            <FaFilter className="text-gray-300 text-xs" />
            <select value={cat} onChange={(e) => setCat(e.target.value)}
              className={selectClass}>
              {["All", "Auth", "User", "Settings", "Security"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-white border border-gray-200
            rounded-lg px-3 h-9">
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className={selectClass}>
              <option value="All">All status</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="danger">Critical</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <FaRotateRight className="animate-spin text-gray-300 text-xl" />
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">
              No audit logs found.
            </p>
          ) : (
            Object.entries(grouped).map(([date, entries]) => (
              <div key={date}>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                    {date}
                  </span>
                </div>
                {entries.map((log, i) => {
                  const Icon = catIcon[log.category] ?? FaShieldAlt;
                  const s    = statusStyle[log.status] ?? statusStyle.success;
                  return (
                    <div key={log._id ?? i}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50
                        transition-colors ${i !== entries.length - 1
                          ? "border-b border-gray-100" : ""}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center
                        justify-center text-xs shrink-0 ${catColor[log.category]}`}>
                        <Icon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{log.action}</p>
                        <p className="text-xs text-gray-400">
                          {log.user} · {log.role}
                          {log.ip && (
                            <span className="ml-2 font-mono text-gray-300">{log.ip}</span>
                          )}
                        </p>
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium
                        hidden sm:block ${pillColor[log.category]}`}>
                        {log.category}
                      </span>
                      <span className={`flex items-center gap-1.5 text-[11px] px-2.5
                        py-1 rounded-full font-medium ${s.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                      <span className="text-xs text-gray-400 w-14 text-right shrink-0">
                        {log.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          Showing {filtered.length} of {logs.length} events
        </p>
      </div>
    </div>
  );
};

export default AuditLogs;