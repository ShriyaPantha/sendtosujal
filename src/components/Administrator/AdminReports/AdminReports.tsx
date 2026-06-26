import { useState, useCallback, type JSX } from "react";
import {
  BarChart3, RefreshCw, 
  Clock, ShieldCheck, Users, Wallet, BookOpen,
  AlertTriangle, Loader2,
} from "lucide-react";
import api from "../../../api/axiosInstance";

// ── Types ─────────────────────────────────────────────────────────────────────

type ReportKey = "academic" | "financial" | "attendance" | "system";

interface ReportMeta {
  id: ReportKey;
  title: string;
  description: string;
  category: string;
  color: string;
  icon: JSX.Element;
}

const REPORTS: ReportMeta[] = [
  {
    id: "academic",
    title: "Semester Grade Distribution Matrix",
    description: "Exam results, grade distribution, pass rates across all published exams.",
    category: "Academic",
    color: "blue",
    icon: <BookOpen size={18} />,
  },
  {
    id: "financial",
    title: "Fee Collection & Payroll Ledger",
    description: "Fee invoiced vs collected, outstanding dues, payroll disbursement summary.",
    category: "Financial",
    color: "emerald",
    icon: <Wallet size={18} />,
  },
  {
    id: "attendance",
    title: "Institutional Attendance Report",
    description: "Overall attendance rates, per-class breakdown, absent/late counts.",
    category: "Attendance",
    color: "amber",
    icon: <Users size={18} />,
  },
  {
    id: "system",
    title: "System Access Logs & Audit Trail",
    description: "Admin actions, audit log categories, total user counts across roles.",
    category: "System",
    color: "slate",
    icon: <ShieldCheck size={18} />,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminReports() {
  const [activeReport, setActiveReport] = useState<ReportKey | null>(null);
  const [reportData, setReportData]     = useState<Record<string, any>>({});
  const [loading, setLoading]           = useState<ReportKey | null>(null);
  const [error, setError]               = useState<string | null>(null);

  const fetchReport = useCallback(async (id: ReportKey) => {
    setLoading(id); setError(null);
    try {
      const { data } = await api.get(`/api/reports/${id}`);
      setReportData(prev => ({ ...prev, [id]: data.data }));
      setActiveReport(id);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load report");
    } finally { setLoading(null); }
  }, []);

  // ── Renderers ─────────────────────────────────────────────────────────────

  const renderAcademic = (d: any) => (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Exams",   value: d.summary.totalExams },
          { label: "Published",     value: d.summary.published },
          { label: "Pass Rate",     value: `${d.passRate}%` },
          { label: "Results Recorded", value: d.totalStudentResults },
        ].map(({ label, value }) => (
          <div key={label} className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">{label}</div>
            <div className="text-lg font-black text-blue-800 mt-1">{value}</div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Grade Distribution</h4>
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(d.gradeDistribution).map(([grade, count]) => (
            <div key={grade} className="bg-white border border-slate-100 rounded-xl p-2 text-center">
              <div className="text-xs font-black text-slate-700">{grade}</div>
              <div className="text-base font-bold text-blue-600">{count as number}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Exams</h4>
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead><tr className="bg-slate-50 text-slate-400 text-[10px] uppercase">
              <th className="py-2 px-3 font-medium">Title</th>
              <th className="py-2 font-medium">Class</th>
              <th className="py-2 font-medium">Date</th>
              <th className="py-2 text-center font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {d.exams.slice(0, 10).map((e: any) => (
                <tr key={e._id}>
                  <td className="py-2 px-3 font-semibold text-slate-700">{e.title}</td>
                  <td className="py-2 text-slate-500">Class {e.className}{e.section ? `-${e.section}` : ""}</td>
                  <td className="py-2 text-slate-500">{new Date(e.examDate).toLocaleDateString("en-NP")}</td>
                  <td className="py-2 text-center capitalize">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      e.status === "published" ? "bg-emerald-50 text-emerald-600" :
                      e.status === "upcoming"  ? "bg-slate-100 text-slate-500" :
                      "bg-amber-50 text-amber-600"
                    }`}>{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFinancial = (d: any) => (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fee Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Total Invoiced",  value: `Rs. ${d.feeSummary.totalInvoiced.toLocaleString()}`, color: "blue" },
            { label: "Collected",       value: `Rs. ${d.feeSummary.totalCollected.toLocaleString()}`, color: "emerald" },
            { label: "Pending",         value: `Rs. ${d.feeSummary.totalPending.toLocaleString()}`, color: "rose" },
            { label: "Paid Records",    value: d.feeSummary.paid, color: "emerald" },
            { label: "Partial",         value: d.feeSummary.partial, color: "amber" },
            { label: "Unpaid",          value: d.feeSummary.pending, color: "rose" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-xl p-3 text-center`}>
              <div className={`text-[10px] font-bold text-${color}-600 uppercase tracking-wider`}>{label}</div>
              <div className={`text-base font-black text-${color}-800 mt-1`}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payroll Summary</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Bill",  value: `Rs. ${d.payrollSummary.totalNetSalary.toLocaleString()}`, color: "blue" },
            { label: "Paid",        value: `Rs. ${d.payrollSummary.totalPaid.toLocaleString()}`, color: "emerald" },
            { label: "Pending",     value: `Rs. ${d.payrollSummary.totalPending.toLocaleString()}`, color: "amber" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-xl p-3 text-center`}>
              <div className={`text-[10px] font-bold text-${color}-600 uppercase tracking-wider`}>{label}</div>
              <div className={`text-base font-black text-${color}-800 mt-1`}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAttendance = (d: any) => (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Records", value: d.summary.total,           color: "blue" },
          { label: "Present",       value: d.summary.present,         color: "emerald" },
          { label: "Absent",        value: d.summary.absent,          color: "rose" },
          { label: "Attendance Rate", value: `${d.summary.attendanceRate}%`, color: "blue" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-xl p-3 text-center`}>
            <div className={`text-[10px] font-bold text-${color}-600 uppercase tracking-wider`}>{label}</div>
            <div className={`text-base font-black text-${color}-800 mt-1`}>{value}</div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class Breakdown</h4>
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead><tr className="bg-slate-50 text-slate-400 text-[10px] uppercase">
              <th className="py-2 px-3 font-medium">Class</th>
              <th className="py-2 font-medium">Total</th>
              <th className="py-2 font-medium text-emerald-600">Present</th>
              <th className="py-2 font-medium text-rose-600">Absent</th>
              <th className="py-2 font-medium text-amber-600">Late</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {Object.entries(d.classBreakdown).map(([cls, stats]: [string, any]) => (
                <tr key={cls}>
                  <td className="py-2 px-3 font-bold text-slate-700">Class {cls}</td>
                  <td className="py-2 text-slate-500">{stats.total}</td>
                  <td className="py-2 font-semibold text-emerald-600">{stats.present}</td>
                  <td className="py-2 font-semibold text-rose-600">{stats.absent}</td>
                  <td className="py-2 font-semibold text-amber-600">{stats.late}</td>
                </tr>
              ))}
              {Object.keys(d.classBreakdown).length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-slate-400">No attendance records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSystem = (d: any) => (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Students", value: d.summary.totalStudents, color: "blue" },
          { label: "Teachers", value: d.summary.totalTeachers, color: "purple" },
          { label: "Parents",  value: d.summary.totalParents,  color: "amber" },
          { label: "Audit Logs", value: d.summary.totalLogs,   color: "slate" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-xl p-3 text-center`}>
            <div className={`text-[10px] font-bold text-${color}-600 uppercase tracking-wider`}>{label}</div>
            <div className={`text-base font-black text-${color}-800 mt-1`}>{value}</div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audit Log Categories</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(d.actionBreakdown).map(([cat, count]) => (
            <div key={cat} className="bg-white border border-slate-100 rounded-xl p-3 text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase">{cat}</div>
              <div className="text-lg font-black text-slate-700">{count as number}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recent Audit Logs</h4>
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead><tr className="bg-slate-50 text-slate-400 text-[10px] uppercase">
              <th className="py-2 px-3 font-medium">Action</th>
              <th className="py-2 font-medium">User</th>
              <th className="py-2 font-medium">Category</th>
              <th className="py-2 font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {d.logs.slice(0, 15).map((log: any) => (
                <tr key={log._id}>
                  <td className="py-2 px-3 font-semibold text-slate-700 max-w-50 truncate">{log.action}</td>
                  <td className="py-2 text-slate-500">{log.user ?? "—"}</td>
                  <td className="py-2 text-slate-500">{log.category ?? "—"}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}>{log.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderData = (id: ReportKey, d: any) => {
    if (id === "academic")   return renderAcademic(d);
    if (id === "financial")  return renderFinancial(d);
    if (id === "attendance") return renderAttendance(d);
    if (id === "system")     return renderSystem(d);
    return null;
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full bg-slate-50 min-h-screen p-6 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md"><BarChart3 size={22} /></div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Reports & Analytics Engine</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Live data pulled from DB — academic, financial, attendance, system</p>
          </div>
        </div>

        {/* Report cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORTS.map(r => (
            <div key={r.id} className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 ${activeReport === r.id ? "border-blue-300" : "border-slate-100"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-3 bg-${r.color}-50 text-${r.color}-600 rounded-xl shrink-0`}>{r.icon}</div>
                  <div>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-${r.color}-50 text-${r.color}-600`}>{r.category}</span>
                    <h3 className="font-bold text-slate-800 text-sm mt-1">{r.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.description}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => fetchReport(r.id)}
                disabled={loading === r.id}
                className={`w-full py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                  activeReport === r.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                }`}>
                {loading === r.id
                  ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
                  : <><RefreshCw size={13} /> {activeReport === r.id ? "Refresh" : "Generate Report"}</>
                }
              </button>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold p-4 rounded-2xl flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Report output */}
        {activeReport && reportData[activeReport] && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                {REPORTS.find(r => r.id === activeReport)?.icon}
                {REPORTS.find(r => r.id === activeReport)?.title}
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Clock size={11} /> Live data
              </span>
            </div>
            {renderData(activeReport, reportData[activeReport])}
          </div>
        )}

      </div>
    </div>
  );
}