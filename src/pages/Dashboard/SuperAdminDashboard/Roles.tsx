import React, { useEffect, useMemo, useState } from "react";
import {
  GraduationCap, BookOpen, Users, UserCog, Crown,
  Shield, Search, MoreVertical, Loader2, X, ChevronDown,
  Headset, CheckCircle2, XCircle, AlertCircle, RefreshCw,
} from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";

type Role = "student" | "teacher" | "admin" | "parent" | "superadmin" | "receptionist" | "user";

interface UserData {
  _id:        string;
  fullName:   string;
  email:      string;
  role:       Role;
  isVerified: boolean;
  createdAt:  string;
  schoolId?:  string;
}

const ROLES: {
  key:         Role;
  label:       string;
  permissions: string;
  icon:        React.ElementType;
  accent:      string;
  iconColor:   string;
  dot:         string;
  description: string;
}[] = [
  {
    key: "student", label: "Student", permissions: "Basic Access",
    icon: GraduationCap, accent: "bg-sky-100", iconColor: "text-sky-600",
    dot: "bg-sky-400", description: "Access courses, assignments and exams",
  },
  {
    key: "teacher", label: "Teacher", permissions: "Academic Access",
    icon: BookOpen, accent: "bg-emerald-100", iconColor: "text-emerald-600",
    dot: "bg-emerald-400", description: "Manage classes, attendance and grades",
  },
  {
    key: "parent", label: "Parent", permissions: "Monitoring Access",
    icon: Users, accent: "bg-pink-100", iconColor: "text-pink-600",
    dot: "bg-pink-400", description: "Track child performance and attendance",
  },
  {
    key: "admin", label: "Admin", permissions: "Management Access",
    icon: UserCog, accent: "bg-amber-100", iconColor: "text-amber-600",
    dot: "bg-amber-400", description: "Manage users, settings and operations",
  },
  {
    key: "receptionist", label: "Receptionist", permissions: "Front Desk Access",
    icon: Headset, accent: "bg-cyan-100", iconColor: "text-cyan-600",
    dot: "bg-cyan-400", description: "Manage enquiries, visitors and front-desk tasks",
  },
  {
    key: "superadmin", label: "Super Admin", permissions: "Full Access",
    icon: Crown, accent: "bg-violet-100", iconColor: "text-violet-600",
    dot: "bg-violet-400", description: "Complete platform control and configuration",
  },
  {
    key: "user", label: "Unassigned", permissions: "No Role Yet",
    icon: Shield, accent: "bg-slate-100", iconColor: "text-slate-500",
    dot: "bg-slate-400", description: "Registered but not yet assigned a role",
  },
];

export default function Roles() {
  const [users,        setUsers]        = useState<UserData[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [expandedRole, setExpandedRole] = useState<Role | null>(null);
  const [openMenuRole, setOpenMenuRole] = useState<Role | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/api/superadmin/users");
      setUsers(res.data?.data ?? []);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Failed to load users";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const roleCounts = useMemo(() => {
    const counts: Partial<Record<Role, number>> = {};
    users.forEach((u) => { counts[u.role] = (counts[u.role] || 0) + 1; });
    return counts;
  }, [users]);

  const filtered = ROLES.filter((r) =>
    r.label.toLowerCase().includes(search.trim().toLowerCase())
  );

  const totalUsers   = users.length;
  const activeRoles  = Object.keys(roleCounts).length;
  const verifiedUsers = users.filter((u) => u.isVerified).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View and manage platform roles and their assigned users.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200
            text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={fetchUsers}
              className="flex items-center gap-1 text-xs font-medium underline
                underline-offset-2 hover:no-underline shrink-0">
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Roles",  value: String(ROLES.length) },
            { label: "Active Roles", value: loading ? "—" : String(activeRoles) },
            { label: "Total Users",  value: loading ? "—" : totalUsers.toLocaleString() },
            { label: "Verified",     value: loading ? "—" : verifiedUsers.toLocaleString() },
          ].map((s) => (
            <div key={s.label}
              className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                {s.label}
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2
            text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles…"
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-9
              py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none
              focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Role list */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center
            justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Platform Roles</h2>
            <button onClick={fetchUsers} disabled={loading}
              className="flex items-center gap-1.5 text-xs text-slate-400
                hover:text-slate-600 disabled:opacity-40 transition-colors">
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={24} className="animate-spin text-indigo-400" />
              <p className="text-sm text-slate-400">Loading users…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Search size={24} className="text-slate-300" />
              <p className="text-sm text-slate-400">No roles match "{search}"</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((role) => {
                const Icon      = role.icon;
                const count     = roleCounts[role.key] || 0;
                const isOpen    = expandedRole === role.key;
                const menuOpen  = openMenuRole === role.key;
                const roleUsers = users.filter((u) => u.role === role.key);

                return (
                  <li key={role.key}>
                    {/* Role row */}
                    <div
                      className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50
                        transition-colors cursor-pointer select-none"
                      onClick={() => setExpandedRole(isOpen ? null : role.key)}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center
                        justify-center shrink-0 ${role.accent} ${role.iconColor}`}>
                        <Icon size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800 text-sm">
                            {role.label}
                          </span>
                          <span className={`w-1.5 h-1.5 rounded-full ${role.dot}`} />
                          <span className="text-xs text-slate-400">{role.permissions}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {role.description}
                        </p>
                      </div>

                      {/* Count pill */}
                      <div className="shrink-0 hidden sm:flex items-center gap-1.5">
                        <span className={`text-xs font-semibold rounded-full px-3 py-1
                          ${count > 0
                            ? "text-slate-700 bg-slate-100"
                            : "text-slate-400 bg-slate-50"}`}>
                          {count} {count === 1 ? "user" : "users"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <ChevronDown size={16} className={`text-slate-400
                          transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuRole(menuOpen ? null : role.key);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400
                              hover:text-slate-600 transition-colors"
                          >
                            <MoreVertical size={15} />
                          </button>
                          {menuOpen && (
                            <div
                              className="absolute right-0 top-8 z-20 bg-white border
                                border-slate-200 rounded-xl shadow-lg text-sm w-44 py-1"
                              onMouseLeave={() => setOpenMenuRole(null)}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedRole(role.key);
                                  setOpenMenuRole(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-slate-50
                                  text-slate-700"
                              >
                                View users ({count})
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard?.writeText(role.key);
                                  setOpenMenuRole(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-slate-50
                                  text-slate-700"
                              >
                                Copy role key
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded user table */}
                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase
                          tracking-wide mb-3">
                          {role.label} accounts — {roleUsers.length}
                        </p>

                        {roleUsers.length === 0 ? (
                          <div className="flex items-center gap-2 py-4 justify-center
                            text-slate-400">
                            <Shield size={16} className="text-slate-300" />
                            <span className="text-sm">
                              No {role.label.toLowerCase()} accounts yet.
                            </span>
                          </div>
                        ) : (
                          <div className="max-h-64 overflow-y-auto">
                            {/* Mobile cards */}
                            <div className="sm:hidden space-y-2">
                              {roleUsers.map((u) => (
                                <div key={u._id}
                                  className="bg-white border border-slate-200 rounded-xl
                                    px-4 py-3 flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">
                                      {u.fullName}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                      {u.email}
                                    </p>
                                  </div>
                                  <span className={`shrink-0 flex items-center gap-1
                                    text-[11px] font-medium px-2 py-1 rounded-full
                                    ${u.isVerified
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-red-50 text-red-600"}`}>
                                    {u.isVerified
                                      ? <CheckCircle2 size={11} />
                                      : <XCircle size={11} />}
                                    {u.isVerified ? "Verified" : "Pending"}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Desktop table */}
                            <table className="hidden sm:table w-full text-sm">
                              <thead>
                                <tr className="text-xs text-slate-400 uppercase tracking-wide">
                                  <th className="text-left pb-2 font-medium">Name</th>
                                  <th className="text-left pb-2 font-medium">Email</th>
                                  <th className="text-left pb-2 font-medium">Joined</th>
                                  <th className="text-left pb-2 font-medium">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {roleUsers.map((u) => (
                                  <tr key={u._id}>
                                    <td className="py-2.5 pr-4 font-medium text-slate-800
                                      whitespace-nowrap">{u.fullName}</td>
                                    <td className="py-2.5 pr-4 text-slate-500
                                      max-w-50 truncate">{u.email}</td>
                                    <td className="py-2.5 pr-4 text-slate-400 whitespace-nowrap">
                                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                                        month: "short", day: "numeric", year: "numeric",
                                      })}
                                    </td>
                                    <td className="py-2.5">
                                      <span className={`inline-flex items-center gap-1
                                        text-[11px] font-medium px-2.5 py-1 rounded-full
                                        ${u.isVerified
                                          ? "bg-emerald-50 text-emerald-700"
                                          : "bg-amber-50 text-amber-600"}`}>
                                        {u.isVerified
                                          ? <CheckCircle2 size={11} />
                                          : <XCircle size={11} />}
                                        {u.isVerified ? "Verified" : "Pending"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Permission overview */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <Shield size={16} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">Permission Overview</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0
            sm:divide-x divide-slate-100">
            {[
              { area: "User Management",  level: "Admin & Super Admin", ok: true  },
              { area: "Course Access",    level: "Student, Teacher",    ok: true  },
              { area: "Reports",          level: "Restricted",          ok: false },
              { area: "System Settings",  level: "Super Admin only",    ok: false },
            ].map((p) => (
              <div key={p.area} className="px-5 py-4">
                <p className="text-xs text-slate-400 font-medium">{p.area}</p>
                <p className={`text-sm font-semibold mt-1
                  ${p.ok ? "text-slate-800" : "text-amber-600"}`}>
                  {p.level}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}