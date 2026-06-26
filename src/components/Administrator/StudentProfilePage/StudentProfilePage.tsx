import React, { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  BookOpen,
  Award,
  Clock,
  CreditCard,
  AlertCircle,
  Search,
  SlidersHorizontal,
  Users,
  Download,
  Plus,
  ArrowLeft,
  Eye,
  Trash2,
  ShieldAlert,
  CheckCircle,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById,
  getAvailableUsers,
  type StudentResponse,
  type UserOption,
  type CreateStudentPayload,
} from"../../../services/Studentservice";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const displayName = (s: StudentResponse) => s.userId?.fullName ?? "Unknown";
const displayEmail = (s: StudentResponse) => s.userId?.email ?? "—";

export default function StudentProfilePage() {
  // ─── Core State ──────────────────────────────────────────────────────────
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentResponse | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<
    "personal" | "academic" | "contact"
  >("personal");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ─── Filter State ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ─── Add Modal State ─────────────────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // user picker
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserLabel, setSelectedUserLabel] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  // other fields
  const [newClass, setNewClass] = useState("");
  const [newSection, setNewSection] = useState("");
  const [newAdmission, setNewAdmission] = useState("");
  const [newRollNumber, setNewRollNumber] = useState("");

  // ─── Fetch students ───────────────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ─── Load users when modal opens ─────────────────────────────────────────
  useEffect(() => {
    if (!isAddModalOpen) return;
    setUsersLoading(true);
    getAvailableUsers()
      .then(setUserOptions)
      .catch(() => setAddError("Could not load users list."))
      .finally(() => setUsersLoading(false));
  }, [isAddModalOpen]);

  // ─── Reset modal state on close ──────────────────────────────────────────
  const closeModal = () => {
    setIsAddModalOpen(false);
    setAddError(null);
    setUserSearch("");
    setSelectedUserId("");
    setSelectedUserLabel("");
    setShowDropdown(false);
    setNewClass("");
    setNewSection("");
    setNewAdmission("");
    setNewRollNumber("");
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleViewStudent = async (id: string) => {
    try {
      setActionLoading(id);
      const full = await getStudentById(id);
      setSelectedStudent(full);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Could not load student profile.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: "Active" | "On Leave" | "Suspended"
  ) => {
    try {
      setActionLoading(id);
      const updated = await updateStudent(id, { status: newStatus });
      setStudents((prev) => prev.map((s) => (s._id === id ? updated : s)));
      if (selectedStudent?._id === id) setSelectedStudent(updated);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Status update failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (
      !window.confirm(
        "Permanently delete this student record? This cannot be undone."
      )
    )
      return;
    try {
      setActionLoading(id);
      await deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s._id !== id));
      if (selectedStudent?._id === id) setSelectedStudent(null);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Delete failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setAddError("Please select a user from the dropdown.");
      return;
    }
    if (!newClass || !newSection) {
      setAddError("Class and Section are required.");
      return;
    }

    const payload: CreateStudentPayload = {
      userId: selectedUserId,
      class: newClass,
      section: newSection,
      admissionNumber: newAdmission || undefined,
      rollNumber: newRollNumber || undefined,
    };

    try {
      setAddLoading(true);
      setAddError(null);
      const created = await createStudent(payload);
      setStudents((prev) => [created, ...prev]);
      closeModal();
    } catch (err: any) {
      setAddError(err?.response?.data?.message ?? "Could not create student.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleSelectUser = (user: UserOption) => {
    setSelectedUserId(user._id);
    setSelectedUserLabel(`${user.fullName} — ${user.email}`);
    setUserSearch("");
    setShowDropdown(false);
  };

  const handleDownloadTranscript = (name: string) => {
    alert(`Generating transcript for: ${name}`);
  };

  // ─── Filtered list ────────────────────────────────────────────────────────
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      displayName(s).toLowerCase().includes(q) ||
      displayEmail(s).toLowerCase().includes(q) ||
      s._id.toLowerCase().includes(q) ||
      (s.admissionNumber ?? "").toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // user dropdown results
  const filteredUsers = userOptions.filter(
    (u) =>
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-slate-50 min-h-screen p-6 font-sans text-slate-800 relative">

      {/* ════════════════════════════════════════════════════════════
          DIRECTORY VIEW
      ════════════════════════════════════════════════════════════ */}
      {!selectedStudent ? (
        <div className="max-w-6xl mx-auto flex flex-col gap-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-100">
                <Users size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Student Registry</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Admin — {students.length} total records
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all self-start sm:self-center"
            >
              <Plus size={15} /> Add Student
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-8 relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by name, email, admission number or ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-medium outline-none transition-all shadow-sm"
              />
            </div>
            <div className="md:col-span-4 relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-4 pr-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs outline-none cursor-pointer shadow-sm appearance-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Suspended">Suspended</option>
              </select>
              <SlidersHorizontal
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={14}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm font-medium">Loading students…</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-2 py-20">
                <AlertCircle size={20} className="text-rose-400" />
                <p className="text-sm font-semibold text-rose-500">{error}</p>
                <button
                  onClick={fetchStudents}
                  className="mt-2 text-xs font-bold text-blue-600 underline"
                >
                  Retry
                </button>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-400">
                <Users size={20} />
                <p className="text-sm font-semibold">No students match your filters.</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                      <th className="py-3 px-5 font-medium">Student</th>
                      <th className="py-3 font-medium">Class / Section</th>
                      <th className="py-3 font-medium">Admission No.</th>
                      <th className="py-3 text-center font-medium">Status</th>
                      <th className="py-3 pr-5 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {filteredStudents.map((student) => {
                      const busy = actionLoading === student._id;
                      return (
                        <tr
                          key={student._id}
                          className="hover:bg-slate-50/40 group transition-colors duration-150"
                        >
                          {/* Student Info */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-sm">
                                {displayName(student)
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                                  {displayName(student)}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                                  {displayEmail(student)}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Class / Section */}
                          <td className="py-3.5 font-semibold text-slate-700">
                            <div>Class {student.class}</div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                              Section {student.section}
                              {student.rollNumber
                                ? ` · Roll ${student.rollNumber}`
                                : ""}
                            </div>
                          </td>

                          {/* Admission No */}
                          <td className="py-3.5 font-medium text-slate-500">
                            {student.admissionNumber ?? (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* Status dropdown */}
                          <td className="py-3.5 text-center">
                            <select
                              value={student.status}
                              disabled={busy}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  student._id,
                                  e.target.value as any
                                )
                              }
                              className={`font-bold border-none bg-transparent rounded-lg p-1 text-center cursor-pointer outline-none disabled:opacity-50 text-xs ${
                                student.status === "Active"
                                  ? "text-emerald-600"
                                  : student.status === "Suspended"
                                  ? "text-rose-600"
                                  : "text-amber-600"
                              }`}
                            >
                              <option value="Active">Active</option>
                              <option value="On Leave">On Leave</option>
                              <option value="Suspended">Suspended</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 pr-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleViewStudent(student._id)}
                                disabled={busy}
                                className="p-1.5 border border-slate-200 hover:border-blue-500 bg-white text-slate-400 hover:text-blue-600 rounded-lg transition-all disabled:opacity-50"
                                title="View Profile"
                              >
                                {busy ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Eye size={13} />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student._id)}
                                disabled={busy}
                                className="p-1.5 border border-slate-200 hover:border-rose-500 bg-white text-slate-400 hover:text-rose-600 rounded-lg transition-all disabled:opacity-50"
                                title="Delete Student"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      ) : (

        /* ════════════════════════════════════════════════════════════
            PROFILE DETAIL VIEW
        ════════════════════════════════════════════════════════════ */
        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          {/* Back + Export */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedStudent(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm transition-all"
            >
              <ArrowLeft size={14} /> Back to Registry
            </button>
            <button
              onClick={() =>
                handleDownloadTranscript(displayName(selectedStudent))
              }
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Download size={13} /> Export Transcript
            </button>
          </div>

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-28 w-full bg-linear-to-r from-slate-700 to-slate-900" />
            <div className="px-6 pb-5 flex flex-col md:flex-row items-center md:items-end justify-between gap-4 -mt-12 relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-left">
                <div className="w-24 h-24 rounded-2xl border-4 border-white bg-slate-100 shadow-md flex items-center justify-center text-slate-700 font-bold text-3xl">
                  {displayName(selectedStudent)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="mb-1">
                  <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-800">
                      {displayName(selectedStudent)}
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        selectedStudent.status === "Active"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : selectedStudent.status === "Suspended"
                          ? "bg-rose-50 text-rose-600 border-rose-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}
                    >
                      {selectedStudent.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 font-medium mt-0.5">
                    {selectedStudent.admissionNumber ?? selectedStudent._id}
                  </p>
                </div>
              </div>

              {/* Suspend / Reinstate */}
              <div className="flex items-center gap-2">
                {selectedStudent.status !== "Suspended" ? (
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedStudent._id, "Suspended")
                    }
                    className="flex items-center gap-1 px-3 py-2 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all"
                  >
                    <ShieldAlert size={14} /> Suspend
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedStudent._id, "Active")
                    }
                    className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all"
                  >
                    <CheckCircle size={14} /> Reinstate
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1">
              {(["personal", "academic", "contact"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveProfileTab(tab)}
                  className={`capitalize px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeProfileTab === tab
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-5 text-xs font-semibold text-slate-700">
              {activeProfileTab === "personal" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                      Date of Birth
                    </label>
                    {selectedStudent.dob
                      ? new Date(selectedStudent.dob).toLocaleDateString()
                      : "—"}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                      Roll Number
                    </label>
                    {selectedStudent.rollNumber ?? "—"}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                      Admission No.
                    </label>
                    {selectedStudent.admissionNumber ?? "—"}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                      Account Status
                    </label>
                    {selectedStudent.status}
                  </div>
                </div>
              )}
              {activeProfileTab === "academic" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                      School
                    </label>
                    {selectedStudent.schoolId?.name ?? "—"}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                      Class
                    </label>
                    {selectedStudent.class}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                      Section
                    </label>
                    {selectedStudent.section}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                      Enrolled Since
                    </label>
                    {new Date(selectedStudent.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )}
              {activeProfileTab === "contact" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                      Phone
                    </label>
                    {selectedStudent.phone ?? "—"}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                      Email
                    </label>
                    {displayEmail(selectedStudent)}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                      Address
                    </label>
                    {selectedStudent.address ?? "—"}
                  </div>
                  {selectedStudent.parentId && (
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                        Guardian
                      </label>
                      {selectedStudent.parentId.fullName}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: <Clock size={18} />,
                bg: "bg-blue-50 text-blue-600",
                label: "Attendance",
                value:
                  selectedStudent.attendanceOverall != null
                    ? `${selectedStudent.attendanceOverall}%`
                    : "—",
              },
              {
                icon: <Award size={18} />,
                bg: "bg-purple-50 text-purple-600",
                label: "GPA",
                value:
                  selectedStudent.currentGpa != null
                    ? selectedStudent.currentGpa.toFixed(2)
                    : "—",
              },
              {
                icon: <BookOpen size={18} />,
                bg: "bg-emerald-50 text-emerald-600",
                label: "Completed Courses",
                value:
                  selectedStudent.completedCourses != null
                    ? `${selectedStudent.completedCourses} passed`
                    : "—",
              },
              {
                icon: <CreditCard size={18} />,
                bg: "bg-cyan-50 text-cyan-600",
                label: "Fee Status",
                value: selectedStudent.feePaidStatus ?? "—",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-3.5"
              >
                <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                    {stat.label}
                  </span>
                  <h4 className="text-base font-bold text-slate-800">
                    {stat.value}
                  </h4>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + Logs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-700 text-base mb-4">
                GPA Progression
              </h3>
              <div className="h-48 w-full -ml-5">
                {selectedStudent.performance &&
                selectedStudent.performance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedStudent.performance}
                      margin={{ left: -20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="semester"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 4.0]}
                        ticks={[0, 2.0, 4.0]}
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          borderRadius: "12px",
                          border: "none",
                          color: "#fff",
                        }}
                      />
                      <Bar
                        dataKey="gpa"
                        fill="#1e293b"
                        radius={[4, 4, 0, 0]}
                        barSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                    No semester data yet.
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-700 text-base mb-4">
                Activity Log
              </h3>
              {selectedStudent.logs && selectedStudent.logs.length > 0 ? (
                <div className="flex flex-col gap-3.5">
                  {selectedStudent.logs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 mt-0.5">
                        <AlertCircle size={14} />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-400 text-[10px]">
                          {log.date}
                        </span>
                        <p className="text-slate-600 font-medium mt-0.5 line-clamp-2">
                          {log.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center flex-1 text-slate-400 text-xs font-semibold">
                  No activity logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          ADD STUDENT MODAL
      ════════════════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Add New Student
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Link an existing user account to a student profile
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Error Banner */}
              {addError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl font-semibold">
                  <AlertCircle size={14} className="shrink-0" />
                  {addError}
                </div>
              )}

              {/* ── USER SEARCH PICKER ── */}
              <div>
                <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                  Select User{" "}
                  <span className="text-rose-400">*</span>
                </label>

                {/* Selected pill */}
                {selectedUserId && !showDropdown ? (
                  <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                    <div>
                      <p className="font-bold text-blue-700">
                        {selectedUserLabel.split(" — ")[0]}
                      </p>
                      <p className="text-[10px] text-blue-400 mt-0.5">
                        {selectedUserLabel.split(" — ")[1]}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedUserId("");
                        setSelectedUserLabel("");
                        setShowDropdown(true);
                      }}
                      className="text-blue-400 hover:text-blue-600 transition-colors ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Search input */}
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={13}
                      />
                      <input
                        type="text"
                        placeholder={
                          usersLoading
                            ? "Loading users…"
                            : "Search by name or email…"
                        }
                        value={userSearch}
                        disabled={usersLoading}
                        onFocus={() => setShowDropdown(true)}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          setShowDropdown(true);
                        }}
                        className="w-full pl-8 pr-8 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all disabled:opacity-50"
                      />
                      {usersLoading ? (
                        <Loader2
                          size={13}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
                        />
                      ) : (
                        <ChevronDown
                          size={13}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      )}
                    </div>

                    {/* Dropdown results */}
                    {showDropdown && !usersLoading && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden max-h-44 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                          <div className="p-3 text-slate-400 text-center font-medium">
                            {userSearch
                              ? "No users match your search."
                              : "No users available."}
                          </div>
                        ) : (
                          filteredUsers.slice(0, 8).map((u) => (
                            <div
                              key={u._id}
                              onClick={() => handleSelectUser(u)}
                              className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                            >
                              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 text-[10px]">
                                {u.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-700 truncate">
                                  {u.fullName}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── CLASS & SECTION ── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                    Class <span className="text-rose-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 10"
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                    Section <span className="text-rose-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. A"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all"
                  />
                </div>
              </div>

              {/* ── ADMISSION & ROLL ── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                    Admission No.{" "}
                    <span className="text-slate-300 normal-case font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ADM-2026-001"
                    value={newAdmission}
                    onChange={(e) => setNewAdmission(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                    Roll No.{" "}
                    <span className="text-slate-300 normal-case font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 45"
                    value={newRollNumber}
                    onChange={(e) => setNewRollNumber(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleCreateStudent}
                disabled={addLoading || !selectedUserId}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-md transition-all mt-1 flex items-center justify-center gap-2"
              >
                {addLoading && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                {addLoading ? "Creating…" : "Create Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}