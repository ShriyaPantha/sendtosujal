import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle, XCircle, AlertTriangle, Search, SlidersHorizontal,
  Download, ArrowLeft, Eye, Calendar, Users, ShieldAlert, Clock, RefreshCw,
} from "lucide-react";
import api from "../../../api/axiosInstance";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StudentAttendanceRecord {
  id: string;           // student _id
  name: string;
  email: string;
  department: string;
  semester: string;     // class + section
  totalClasses: number; // total records in DB for this student
  classesAttended: number;
  attendancePercentage: number;
  status: "Compliant" | "Warning" | "Critical";
  lastActive: string;   // most recent attendance date
}

interface DepartmentSummary {
  name: string;
  code: string;
  avgAttendance: number;
  criticalCount: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveStatus(pct: number): "Compliant" | "Warning" | "Critical" {
  if (pct < 60) return "Critical";
  if (pct < 80) return "Warning";
  return "Compliant";
}

// raw attendance records → per-student summary rows
function aggregateByStudent(rawRecords: any[]): StudentAttendanceRecord[] {
  const map = new Map<string, any>();

  for (const rec of rawRecords) {
    const s = rec.studentId;
    if (!s?._id) continue;
    const sid = s._id.toString();

    if (!map.has(sid)) {
      map.set(sid, {
        id: sid,
        name: s.userId?.fullName ?? "Unknown",
        email: s.userId?.email ?? "—",
        department: s.department ?? s.class ?? "—",
        semester: [s.class, s.section].filter(Boolean).join(" · ") || "—",
        total: 0,
        present: 0,
        lastDate: "",
      });
    }

    const entry = map.get(sid)!;
    entry.total += 1;
    if (rec.status === "present") entry.present += 1;
    if (!entry.lastDate || rec.date > entry.lastDate) entry.lastDate = rec.date;
  }

  return Array.from(map.values()).map((e) => {
    const pct = e.total > 0 ? +(( e.present / e.total) * 100).toFixed(1) : 0;
    return {
      id: e.id,
      name: e.name,
      email: e.email,
      department: e.department,
      semester: e.semester,
      totalClasses: e.total,
      classesAttended: e.present,
      attendancePercentage: pct,
      status: deriveStatus(pct),
      lastActive: e.lastDate || "—",
    };
  });
}

// dept performance → dept summary cards
function mapDeptCards(perfData: any[]): DepartmentSummary[] {
  return perfData.map((d) => ({
    name: d.name,
    code: d.name.split(/\s+/).map((w: string) => w[0]).join("").toUpperCase().slice(0, 4),
    avgAttendance: d.attendance ?? 0,
    criticalCount: 0, // no critical count from perf endpoint — computed below
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminAttendance() {
  const [records, setRecords] = useState<StudentAttendanceRecord[]>([]);
  const [deptCards, setDeptCards] = useState<DepartmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentAttendanceRecord | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [attRes, perfRes] = await Promise.all([
        api.get("/api/attendance/admin/all"),
        api.get("/api/admin/departments/performance").catch(() => ({ data: { data: [] } })),
      ]);

      const rows = aggregateByStudent(attRes.data?.data ?? []);
      setRecords(rows);

      // inject critical counts from aggregated rows
      const rawCards = mapDeptCards(perfRes.data?.data ?? []);
      const enriched = rawCards.map((card) => ({
        ...card,
        criticalCount: rows.filter(
          (r) => r.department === card.name && r.status === "Critical"
        ).length,
      }));
      setDeptCards(enriched);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Override (inject/remove one present record via update) ───────────────────
  // Backend updateAttendance is teacher-only; admin override → direct state mutation
  // + fire PUT if you add an admin-override endpoint later.
  const handleOverridePercentage = (
    id: string,
    type: "increment" | "decrement"
  ) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const delta = type === "increment" ? 1 : -1;
        const nextAttended = Math.min(r.totalClasses, Math.max(0, r.classesAttended + delta));
        const pct = +((nextAttended / r.totalClasses) * 100).toFixed(1);
        return { ...r, classesAttended: nextAttended, attendancePercentage: pct, status: deriveStatus(pct) };
      })
    );
    setSelectedStudent((prev) => {
      if (!prev || prev.id !== id) return prev;
      const delta = type === "increment" ? 1 : -1;
      const nextAttended = Math.min(prev.totalClasses, Math.max(0, prev.classesAttended + delta));
      const pct = +((nextAttended / prev.totalClasses) * 100).toFixed(1);
      return { ...prev, classesAttended: nextAttended, attendancePercentage: pct, status: deriveStatus(pct) };
    });
  };

  // ── Filter ────────────────────────────────────────────────────────────────────

  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      (r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)) &&
      (deptFilter === "All" || r.department === deptFilter) &&
      (statusFilter === "All" || r.status === statusFilter)
    );
  });

  // ── Summary stats ─────────────────────────────────────────────────────────────

  const totalRosterCount = records.length;
  const criticalCount = records.filter((r) => r.status === "Critical").length;
  const warningCount = records.filter((r) => r.status === "Warning").length;
  const complianceRatio = totalRosterCount
    ? ((records.filter((r) => r.status === "Compliant").length / totalRosterCount) * 100).toFixed(0)
    : "0";

  // unique dept names for filter dropdown
  const deptNames = Array.from(new Set(records.map((r) => r.department).filter(Boolean)));

  // ── Guards ────────────────────────────────────────────────────────────────────

  if (loading)
    return (
      <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-400 font-medium">
        Loading attendance data...
      </div>
    );

  if (error)
    return (
      <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-rose-500 font-semibold">{error}</p>
        <button onClick={loadData} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Retry</button>
      </div>
    );

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full bg-slate-50 min-h-screen p-6 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md"><Calendar size={22} /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Attendance Monitoring Panel</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Track systemic eligibility variables, handle operational overrides, and log compliance indicators
              </p>
            </div>
          </div>
          <div className="flex gap-2 self-start sm:self-center">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <RefreshCw size={14} className="text-slate-400" /> Recalibrate Cycle
            </button>
            <button
              onClick={() => alert("Export not wired yet")}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Download size={14} /> Export Sheets
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {[
            { icon: <CheckCircle size={18} />, color: "emerald", label: "Compliance Ratio", value: `${complianceRatio}% Eligible` },
            { icon: <AlertTriangle size={18} />, color: "amber", label: "Warning Index", value: `${warningCount} Records` },
            { icon: <XCircle size={18} />, color: "rose", label: "Critical Threshold", value: `${criticalCount} Flagged` },
            { icon: <Users size={18} />, color: "blue", label: "Inspected Active Roster", value: `${totalRosterCount} Students Total` },
          ].map(({ icon, color, label, value }) => (
            <div key={label} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex flex-row items-center gap-4">
              <div className={`p-3 bg-${color}-50 text-${color}-600 rounded-xl shrink-0`}>{icon}</div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block truncate">{label}</span>
                <h4 className="text-sm sm:text-base font-bold text-slate-800 truncate">{value}</h4>
              </div>
            </div>
          ))}
        </div>

        {!selectedStudent ? (
          <>
            {/* Dept Cards */}
            {deptCards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deptCards.map((dept, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xs font-bold text-slate-700">{dept.name}</h3>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Faculty Block Ref: {dept.code}</span>
                      </div>
                      {dept.criticalCount > 0 && (
                        <span className="flex items-center gap-1 text-[9px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 uppercase tracking-wide animate-pulse">
                          <ShieldAlert size={10} /> {dept.criticalCount} Critical
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${dept.avgAttendance >= 80 ? "bg-blue-600" : "bg-amber-500"}`}
                          style={{ width: `${Math.min(dept.avgAttendance, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{dept.avgAttendance}% Avg</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-6 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Query students by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-medium outline-none transition-all shadow-sm"
                />
              </div>
              <div className="md:col-span-3 relative">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full pl-4 pr-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs outline-none cursor-pointer shadow-sm appearance-none"
                >
                  <option value="All">All Departments</option>
                  {deptNames.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
              <div className="md:col-span-3 relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-4 pr-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs outline-none cursor-pointer shadow-sm appearance-none"
                >
                  <option value="All">All Operational Ranks</option>
                  <option value="Compliant">Compliant (≥80%)</option>
                  <option value="Warning">Warning (60–79%)</option>
                  <option value="Critical">Critical (&lt;60%)</option>
                </select>
                <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-187.5">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                      <th className="py-3 px-5 font-medium">Student Identity</th>
                      <th className="py-3 font-medium">Department / Class</th>
                      <th className="py-3 text-center font-medium">Aggregated Ratio</th>
                      <th className="py-3 font-medium">Progress</th>
                      <th className="py-3 text-center font-medium">Status</th>
                      <th className="py-3 pr-5 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/40 group transition-colors duration-150">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                              {record.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{record.name}</h4>
                              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{record.id.slice(-8)} • {record.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 font-semibold text-slate-700">
                          <div>{record.department}</div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">{record.semester}</div>
                        </td>
                        <td className="py-3.5 text-center font-bold text-slate-700">
                          <div>{record.classesAttended} / {record.totalClasses}</div>
                          <span className="text-[9px] text-slate-400 font-medium mt-0.5 block">Classes Logged</span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-3 max-w-xs">
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${record.status === "Compliant" ? "bg-emerald-500" : record.status === "Warning" ? "bg-amber-500" : "bg-rose-500"}`}
                                style={{ width: `${record.attendancePercentage}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-600">{record.attendancePercentage}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`font-bold px-2.5 py-0.5 rounded-full border text-[10px] ${record.status === "Compliant" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : record.status === "Warning" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3.5 pr-5 text-right">
                          <button
                            onClick={() => setSelectedStudent(record)}
                            className="p-1.5 border border-slate-200 hover:border-blue-500 bg-white text-slate-400 hover:text-blue-600 rounded-lg shadow-2xs transition-all"
                          >
                            <Eye size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredRecords.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                          No matching active student logs cached.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          // Detail view
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
              <button
                onClick={() => setSelectedStudent(null)}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm transition-all self-start"
              >
                <ArrowLeft size={14} /> Back to Attendance Directory
              </button>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Clock size={13} /> Last Record: {selectedStudent.lastActive}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center justify-center">
                  {selectedStudent.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {selectedStudent.department} • {selectedStudent.semester}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Status</span>
                  <span className={`font-bold px-3 py-1 rounded-full border text-xs ${selectedStudent.status === "Compliant" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : selectedStudent.status === "Warning" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                    {selectedStudent.status}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Attendance</span>
                  <h4 className="text-xl font-black text-slate-800">{selectedStudent.attendancePercentage}%</h4>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Present / Total</span>
                  <h4 className="text-base font-black text-slate-800">{selectedStudent.classesAttended} / {selectedStudent.totalClasses}</h4>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 p-5 border border-dashed border-slate-200 rounded-2xl">
              <div>
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">🔧 Administrative Reroute Engine</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Locally adjust computed tally. Wire to backend override endpoint when available.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOverridePercentage(selectedStudent.id, "decrement")}
                  className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 font-bold rounded-xl text-xs transition-all shadow-2xs"
                >
                  − Remove One Present Lecture
                </button>
                <button
                  onClick={() => handleOverridePercentage(selectedStudent.id, "increment")}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  + Inject One Present Lecture
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}