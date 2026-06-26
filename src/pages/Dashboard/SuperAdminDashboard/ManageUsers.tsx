import React, { useState, useEffect, useMemo } from "react";
import {
  Trash2, Edit, Search, Filter, UserPlus,
  ChevronDown, Shield, BookOpen, Users, GraduationCap,
  User, Loader2, X, Check, RefreshCw, Building2,
} from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
// import axiosInstance from "../utils/axios"; // adjust path to where your axios.ts lives

// ── TYPES ──────────────────────────────────────────────────────────────────
type Role = "student" | "teacher" | "admin" | "parent" | "superadmin" | "receptionist" | "user";

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  role: Role;
  isVerified: boolean;
  phone?: string;
  schoolId?: { _id: string; name: string } | null;
  createdAt: string;
}

interface School {
  _id: string;
  name: string;
  email: string;
}

// ── ROLE STYLES ────────────────────────────────────────────────────────────
const roleStyle: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  student:      { bg: "bg-blue-50",   text: "text-blue-700",   icon: <GraduationCap size={11} /> },
  teacher:      { bg: "bg-violet-50", text: "text-violet-700", icon: <BookOpen size={11} />      },
  admin:        { bg: "bg-amber-50",  text: "text-amber-700",  icon: <Shield size={11} />        },
  parent:       { bg: "bg-teal-50",   text: "text-teal-700",   icon: <Users size={11} />         },
  superadmin:   { bg: "bg-red-50",    text: "text-red-700",    icon: <User size={11} />          },
  receptionist: { bg: "bg-pink-50",   text: "text-pink-700",   icon: <User size={11} />          },
  user:         { bg: "bg-gray-50",   text: "text-gray-700",   icon: <User size={11} />          },
};

// ── USER MODAL (Create / Edit) ─────────────────────────────────────────────
interface UserModalProps {
  onClose: () => void;
  onSaved: () => void;
  editing: UserData | null;
  schools: School[];
}

const UserModal: React.FC<UserModalProps> = ({ onClose, onSaved, editing, schools }) => {
  const [form, setForm] = useState({
    fullName: editing?.fullName || "",
    email:    editing?.email    || "",
    phone:    editing?.phone    || "",
    role:     editing?.role     || "admin",
    schoolId: (editing?.schoolId as any)?._id || "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!editing && !form.password) { setError("Password is required"); return; }

    setLoading(true);
    try {
      if (editing) {
        // UPDATE via superadmin/admins (works for any user type)
        const body: any = {
          fullName: form.fullName,
          email:    form.email,
          phone:    form.phone,
          schoolId: form.schoolId || null,
        };
        if (form.password) body.password = form.password;
        await axiosInstance.put(`/api/superadmin/admins/${editing._id}`, body);
      } else {
        // CREATE new admin
        await axiosInstance.post("/api/superadmin/admins", {
          fullName: form.fullName,
          email:    form.email,
          password: form.password,
          phone:    form.phone,
          schoolId: form.schoolId || null,
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">{editing ? "Edit User" : "Create New Admin"}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Full Name */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Full Name</label>
            <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Phone (optional)</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>

          {/* School */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Assign to School (optional)</label>
            <select value={form.schoolId} onChange={(e) => set("schoolId", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200">
              <option value="">— No School —</option>
              {schools.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              {editing ? "New Password (leave blank to keep)" : "Password"}
            </label>
            <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
              required={!editing}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 disabled:opacity-60">
            {loading ? "Saving..." : editing ? "Update User" : "Create Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
const ManageUsers: React.FC = () => {
  const [users, setUsers]       = useState<UserData[]>([]);
  const [schools, setSchools]   = useState<School[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [schoolFilter, setSchoolFilter] = useState("All");

  const [showModal, setShowModal]     = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);

  // ── Fetch all users (all admins across all schools) ──────────────────────
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get<{ success: boolean; data: UserData[] }>("/api/superadmin/admins");
      setUsers(res.data.data);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || "Failed to load users");
    }
  };

  // ── Fetch all schools ────────────────────────────────────────────────────
  const fetchSchools = async () => {
    try {
      const res = await axiosInstance.get<{ success: boolean; data: School[] }>("/api/school");
      setSchools(res.data.data);
    } catch (e: any) {
      console.warn("Could not load schools:", e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchSchools()]);
      setLoading(false);
    };
    init();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(), fetchSchools()]);
    setRefreshing(false);
  };

  // ── Delete user ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/api/superadmin/admins/${id}`);
      setUsers((u) => u.filter((user) => user._id !== id));
    } catch (e: any) {
      alert(e.response?.data?.message || e.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchSearch = !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole   = roleFilter === "All"   || u.role === roleFilter.toLowerCase();
      const matchStatus = statusFilter === "All" || (statusFilter === "Active" ? u.isVerified : !u.isVerified);
      const matchSchool = schoolFilter === "All" || (u.schoolId as any)?._id === schoolFilter || (!u.schoolId && schoolFilter === "none");
      return matchSearch && matchRole && matchStatus && matchSchool;
    });
  }, [users, search, roleFilter, statusFilter, schoolFilter]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = [
    { label: "Total Users",  value: users.length,                                    color: "text-gray-800"   },
    { label: "Verified",     value: users.filter((u) => u.isVerified).length,        color: "text-green-700"  },
    { label: "Unverified",   value: users.filter((u) => !u.isVerified).length,       color: "text-red-600"    },
    { label: "Total Schools",value: schools.length,                                   color: "text-indigo-600" },
  ];

  const selectClass = "bg-transparent outline-none text-xs text-gray-500 cursor-pointer";

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <Loader2 className="animate-spin" size={28} />
        <p className="text-sm">Loading users...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Manage Users</h1>
            <p className="text-xs text-gray-400 mt-0.5">SuperAdmin · Full access to all user accounts</p>
          </div>
          <div className="flex gap-2">
            <button onClick={refresh} disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-500 text-xs hover:bg-gray-50 disabled:opacity-50">
              <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={() => { setEditingUser(null); setShowModal(true); }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
            >
              <UserPlus size={13} /> Add Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex justify-between">
            ⚠️ {error}
            <button onClick={() => setError("")}><X size={14} /></button>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {stats.map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-gray-200 rounded-lg px-3 h-9">
            <Search size={13} className="text-gray-300 shrink-0" />
            <input type="text" placeholder="Search name or email..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-xs text-gray-700 placeholder-gray-300 w-full" />
            {search && <button onClick={() => setSearch("")}><X size={12} className="text-gray-300" /></button>}
          </div>

          {/* Role filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 h-9">
            <Filter size={12} className="text-gray-300" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectClass}>
              {["All", "admin", "teacher", "student", "parent", "superadmin", "receptionist"].map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
            <ChevronDown size={11} className="text-gray-300" />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 h-9">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
              <option value="All">All status</option>
              <option value="Active">Verified</option>
              <option value="Inactive">Unverified</option>
            </select>
            <ChevronDown size={11} className="text-gray-300" />
          </div>

          {/* School filter */}
          {schools.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 h-9">
              <Building2 size={12} className="text-gray-300" />
              <select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} className={selectClass}>
                <option value="All">All schools</option>
                <option value="none">No school</option>
                {schools.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown size={11} className="text-gray-300" />
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider w-[26%]">User</th>
                <th className="px-4 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider w-[16%]">Role</th>
                <th className="px-4 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider w-[18%]">School</th>
                <th className="px-4 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider w-[13%]">Status</th>
                <th className="px-4 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider w-[13%]">Joined</th>
                <th className="px-4 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider w-[14%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm text-gray-400">
                    {users.length === 0 ? "No users yet. Create an admin to get started!" : "No users match your filters."}
                  </td>
                </tr>
              ) : filtered.map((u, i) => {
                const r = roleStyle[u.role] || roleStyle.user;
                const schoolName = (u.schoolId as any)?.name || "—";
                return (
                  <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${i !== filtered.length - 1 ? "border-b border-gray-100" : ""}`}>

                    {/* USER */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold shrink-0">
                          {u.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{u.fullName}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium ${r.bg} ${r.text}`}>
                        {r.icon} {u.role}
                      </span>
                    </td>

                    {/* SCHOOL */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 truncate block">{schoolName}</span>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium ${u.isVerified ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isVerified ? "bg-green-500" : "bg-red-400"}`} />
                        {u.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>

                    {/* JOINED */}
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => { setEditingUser(u); setShowModal(true); }}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          disabled={deletingId === u._id}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all disabled:opacity-50"
                        >
                          {deletingId === u._id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Trash2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          Showing {filtered.length} of {users.length} users
        </p>
      </div>

      {showModal && (
        <UserModal
          onClose={() => { setShowModal(false); setEditingUser(null); }}
          onSaved={fetchUsers}
          editing={editingUser}
          schools={schools}
        />
      )}
    </div>
  );
};

export default ManageUsers;