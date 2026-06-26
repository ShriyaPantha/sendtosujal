// src/pages/Dashboard/ParentDashboard/Attendance.tsx
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, CalendarDays,
  TrendingUp, AlertCircle, ChevronRight,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type DayStatus = "present" | "absent" | "late" | "holiday";

interface DayRecord {
  date: string;
  day: string;
  status: DayStatus;
  note?: string;
}

interface MonthData {
  month: string;
  present: number;
  absent: number;
  late: number;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const monthlyTrend: MonthData[] = [
  { month: "Jan", present: 20, absent: 2, late: 1 },
  { month: "Feb", present: 18, absent: 3, late: 2 },
  { month: "Mar", present: 22, absent: 1, late: 0 },
  { month: "Apr", present: 19, absent: 2, late: 1 },
  { month: "May", present: 21, absent: 1, late: 1 },
  { month: "Jun", present: 16, absent: 1, late: 0 },
];

const subjectWise = [
  { subject: "Math",    present: 92, absent: 8 },
  { subject: "Science", present: 96, absent: 4 },
  { subject: "English", present: 88, absent: 12 },
  { subject: "S.St",   present: 90, absent: 10 },
  { subject: "Comp",   present: 98, absent: 2 },
];

const recentDays: DayRecord[] = [
  { date: "Jun 10", day: "Mon", status: "present" },
  { date: "Jun 9",  day: "Fri", status: "present" },
  { date: "Jun 8",  day: "Thu", status: "late",    note: "Arrived 15 min late" },
  { date: "Jun 7",  day: "Wed", status: "present" },
  { date: "Jun 6",  day: "Tue", status: "present" },
  { date: "Jun 5",  day: "Mon", status: "absent",  note: "Medical leave" },
  { date: "Jun 2",  day: "Fri", status: "holiday", note: "School holiday" },
  { date: "Jun 1",  day: "Thu", status: "present" },
  { date: "May 31", day: "Wed", status: "present" },
  { date: "May 30", day: "Tue", status: "present" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

const statusConfig: Record<DayStatus, { label: string; bg: string; text: string; icon: React.FC<any> }> = {
  present: { label: "Present", bg: "bg-emerald-50", text: "text-emerald-600", icon: CheckCircle2 },
  absent:  { label: "Absent",  bg: "bg-rose-50",    text: "text-rose-600",    icon: XCircle },
  late:    { label: "Late",    bg: "bg-amber-50",   text: "text-amber-600",   icon: Clock },
  holiday: { label: "Holiday", bg: "bg-slate-100",  text: "text-slate-500",   icon: CalendarDays },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value} days</p>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const Attendance = () => {
  const navigate = useNavigate();

  const totalPresent = monthlyTrend.reduce((s, m) => s + m.present, 0);
  const totalAbsent  = monthlyTrend.reduce((s, m) => s + m.absent,  0);
  const totalLate    = monthlyTrend.reduce((s, m) => s + m.late,    0);
  const totalDays    = totalPresent + totalAbsent + totalLate;
  const rate         = Math.round((totalPresent / totalDays) * 100);

  const stats = [
    { label: "Present",  value: totalPresent, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Absent",   value: totalAbsent,  color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-100"    },
    { label: "Late",     value: totalLate,    color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100"   },
    { label: "Total",    value: totalDays,    color: "text-indigo-600",  bg: "bg-indigo-50",  border: "border-indigo-100"  },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Attendance</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Aryan Sharma · Grade 5 – Section A</p>
          </div>
        </div>

        {/* Rate banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold opacity-75 uppercase tracking-widest">Overall Rate</p>
            <p className="text-5xl font-bold mt-1">{rate}%</p>
            <p className="text-xs opacity-75 mt-1">{totalPresent} of {totalDays} school days present</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${rate >= 90 ? "bg-emerald-400/20 text-emerald-100" : "bg-rose-400/20 text-rose-100"}`}>
              {rate >= 90 ? <TrendingUp className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {rate >= 90 ? "On track" : "Needs attention"}
            </div>
            <p className="text-[11px] opacity-60 mt-2">Min. required: 85%</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className={`bg-white rounded-2xl border ${s.border} shadow-sm p-5`}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-slate-400 mt-1">{s.label} days</p>
              <div className={`mt-3 h-1.5 rounded-full ${s.bg} overflow-hidden`}>
                <div className={`h-full rounded-full ${s.bg.replace("50", "400")}`}
                  style={{ width: `${Math.round((s.value / totalDays) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Monthly trend */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Monthly trend</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Present vs absent days</p>
              </div>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="present" name="Present" stroke="#6366f1" strokeWidth={2} fill="url(#pGrad)" dot={{ fill: "#6366f1", r: 3 }} />
                  <Area type="monotone" dataKey="absent"  name="Absent"  stroke="#f43f5e" strokeWidth={2} fill="url(#aGrad)" dot={{ fill: "#f43f5e", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-5 mt-3">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-3 h-0.5 bg-indigo-500 rounded inline-block" /> Present
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-3 h-0.5 bg-rose-400 rounded inline-block" /> Absent
                </span>
              </div>
            </div>
          </div>

          {/* Subject-wise */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Subject-wise attendance</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Present % per subject</p>
              </div>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={subjectWise} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="swGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="present" name="Present %" radius={[6, 6, 0, 0]} fill="url(#swGrad)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Daily log */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-800">Daily log</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Recent attendance records</p>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {recentDays.map((d) => {
              const cfg = statusConfig[d.status];
              const Icon = cfg.icon;
              return (
                <div key={d.date} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="w-14 shrink-0">
                    <p className="text-xs font-semibold text-slate-800">{d.date}</p>
                    <p className="text-[11px] text-slate-400">{d.day}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                    <Icon className="w-3 h-3" /> {cfg.label}
                  </div>
                  {d.note && (
                    <p className="text-[11px] text-slate-400 ml-auto">{d.note}</p>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-200 ml-auto shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Attendance;