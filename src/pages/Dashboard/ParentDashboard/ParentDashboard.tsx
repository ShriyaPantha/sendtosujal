// src/pages/Dashboard/ParentDashboard/ParentDashboard.tsx
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, AreaChart, Area, CartesianGrid,
} from "recharts";
import {
  CheckCircle, BookOpen, CreditCard, Bell, ArrowRight,
  MessageSquare, FileText, DollarSign, Calendar, AlertCircle,
  Clock, TrendingUp, CalendarDays, CircleDollarSign, Award, Users,
} from "lucide-react";
import { useDataStore } from "./DataStore";

// ── Reusable ──────────────────────────────────────────────────────────────────

const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending:      "bg-rose-50 text-rose-600 border border-rose-100",
    "in-progress":"bg-amber-50 text-amber-600 border border-amber-100",
    submitted:    "bg-emerald-50 text-emerald-600 border border-emerald-100",
  };
  const labels: Record<string, string> = {
    pending: "Pending", "in-progress": "In Progress", submitted: "Submitted",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const CardHeader = ({ title, sub, action, onAction }: {
  title: string; sub?: string; action?: string; onAction?: () => void;
}) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
    <div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
    {action && (
      <button onClick={onAction}
        className="flex items-center gap-1 text-[11px] font-medium text-indigo-500 hover:text-indigo-700 transition-colors">
        {action} <ArrowRight className="w-3 h-3" />
      </button>
    )}
  </div>
);

// ── Chart data ────────────────────────────────────────────────────────────────

const subjectBarData = [
  { subject: "Math",  score: 92 },
  { subject: "Sci",   score: 88 },
  { subject: "Eng",   score: 79 },
  { subject: "S.St",  score: 85 },
  { subject: "Comp",  score: 95 },
];

const attendanceTrendData = [
  { month: "Jan", present: 20, absent: 2 },
  { month: "Feb", present: 18, absent: 3 },
  { month: "Mar", present: 22, absent: 1 },
  { month: "Apr", present: 19, absent: 2 },
  { month: "May", present: 21, absent: 1 },
  { month: "Jun", present: 16, absent: 1 },
];

const radialData = [
  { name: "Present", value: 93, fill: "#6366f1" },
  { name: "Late",    value: 4,  fill: "#f59e0b" },
  { name: "Absent",  value: 3,  fill: "#f43f5e" },
];

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-indigo-600">{payload[0].value}%</p>
    </div>
  );
};

const CustomAreaTooltip = ({ active, payload, label }: any) => {
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

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { studentName, attendanceRate, pendingFees, assignments, notices, events } = useDataStore();

  const stats = [
    { label: "Attendance",  value: `${attendanceRate}%`, sub: "167/180 days",       icon: CheckCircle, color: "emerald", path: "/parent/attendance" },
    { label: "Assignments", value: "2 Pending",          sub: "3 done this month",  icon: BookOpen,    color: "violet",  path: "/parent/assignments" },
    { label: "Fees Due",    value: `$${pendingFees}`,    sub: "Due Jun 20, 2026",   icon: CreditCard,  color: "amber",   path: "/parent/fees" },
    { label: "Notices",     value: "4 New",              sub: "Last updated today", icon: Bell,        color: "blue",    path: "/parent/notices" },
  ];

  const colorMap: Record<string, { bg: string; text: string }> = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    violet:  { bg: "bg-violet-50",  text: "text-violet-600"  },
    amber:   { bg: "bg-amber-50",   text: "text-amber-600"   },
    blue:    { bg: "bg-blue-50",    text: "text-blue-600"    },
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Parent Portal</h1>
            <p className="text-xs text-slate-400 mt-1">
              Welcome back, Rajesh &nbsp;·&nbsp; Tracking{" "}
              <span className="text-indigo-500 font-medium">{studentName}</span>'s journey
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Message",  icon: MessageSquare, path: "/parent/messages" },
              { label: "Reports",  icon: FileText,      path: "/parent/reports" },
              { label: "Pay Fees", icon: DollarSign,    path: "/parent/fees" },
              { label: "Calendar", icon: Calendar,      path: "/parent/calendar" },
            ].map((a) => (
              <button key={a.path} onClick={() => navigate(a.path)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition-all">
                <a.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const c = colorMap[s.color];
            return (
              <div key={s.label} onClick={() => navigate(s.path)}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-slate-200 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-slate-400 transition-colors mt-1" />
                </div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1 leading-none">{s.value}</p>
                <p className="text-[11px] text-slate-400 mt-2">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader title="Subject performance" sub="Latest exam scores"
              action="Full report" onAction={() => navigate("/parent/reports")} />
            <div className="p-5">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={subjectBarData} barSize={32} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="url(#barGrad)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-5 gap-2 mt-3">
                {subjectBarData.map((d) => (
                  <div key={d.subject} className="text-center">
                    <p className="text-xs font-bold text-slate-800">{d.score}%</p>
                    <div className="w-full h-1 rounded-full bg-slate-100 mt-1 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-400" style={{ width: `${d.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Radial Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader title="Attendance breakdown" sub="This academic year" />
            <div className="flex flex-col items-center py-4">
              <div className="relative">
                <ResponsiveContainer width={180} height={180}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius={45} outerRadius={80}
                    data={radialData} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "#f8fafc" }} />
                    <Tooltip formatter={(val: any) => `${val}%`} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold text-slate-900">{attendanceRate}%</p>
                  <p className="text-[10px] text-slate-400">present</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mt-1 px-5 w-full">
                {radialData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-slate-700">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Area Chart + Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader title="Monthly attendance trend" sub="Present vs absent days"
              action="View details" onAction={() => navigate("/parent/attendance")} />
            <div className="p-5">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={attendanceTrendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomAreaTooltip />} />
                  <Area type="monotone" dataKey="present" name="Present" stroke="#6366f1" strokeWidth={2}
                    fill="url(#presentGrad)" dot={{ fill: "#6366f1", r: 3 }} />
                  <Area type="monotone" dataKey="absent" name="Absent" stroke="#f43f5e" strokeWidth={2}
                    fill="url(#absentGrad)" dot={{ fill: "#f43f5e", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-5 mt-3">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-3 h-0.5 bg-indigo-500 rounded inline-block" /> Present days
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-3 h-0.5 bg-rose-400 rounded inline-block" /> Absent days
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader title="Assignments" sub="Active tasks"
              action="View all" onAction={() => navigate("/parent/assignments")} />
            <div className="divide-y divide-slate-50">
              {assignments.slice(0, 4).map((a) => (
                <div key={a.id} className="px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-slate-800 leading-snug">{a.title}</p>
                    <Badge status={a.status} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{a.subject} · Due {a.due}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Student Profile */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">AS</div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{studentName}</p>
                  <p className="text-[11px] text-slate-400">Grade 5 – Section A</p>
                  <p className="text-[11px] text-slate-400">Roll No. 24</p>
                </div>
              </div>
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between"><span className="text-slate-400">Teacher</span><span className="font-medium text-slate-700">Mrs. Sharma</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Attendance</span><span className="font-semibold text-emerald-600">{attendanceRate}%</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Rank</span><span className="font-medium text-indigo-600">Top 15%</span></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => navigate("/parent/messages")}
                  className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-medium hover:bg-indigo-100 flex items-center justify-center gap-1 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </button>
                <button onClick={() => navigate("/parent/attendance")}
                  className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 flex items-center justify-center gap-1 transition-colors">
                  <CalendarDays className="w-3.5 h-3.5" /> Details
                </button>
              </div>
            </div>
          </div>

          {/* Fee Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-400" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-800">Fee summary</p>
                <CircleDollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-amber-500">${pendingFees}</p>
              <p className="text-[11px] text-slate-400 mt-1">total outstanding</p>
              <div className="space-y-2 text-xs mt-4 border-t border-slate-100 pt-3">
                <div className="flex justify-between"><span className="text-slate-400">Due date</span><span className="font-medium text-slate-700">Jun 20, 2026</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Last paid</span><span className="font-medium text-slate-700">$500 · May 10</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Status</span>
                  <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">Partial</span>
                </div>
              </div>
              <button onClick={() => navigate("/parent/fees")}
                className="w-full mt-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
                Pay now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Events */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader title="Upcoming events" sub="Important dates"
              action="Calendar" onAction={() => navigate("/parent/calendar")} />
            <div className="divide-y divide-slate-50">
              {events.slice(0, 3).map((e) => {
                const typeStyle: Record<string, string> = {
                  meeting: "bg-indigo-50 text-indigo-500",
                  holiday: "bg-emerald-50 text-emerald-500",
                  event:   "bg-violet-50 text-violet-500",
                };
                const Icon = e.type === "meeting" ? Users : e.type === "holiday" ? TrendingUp : Award;
                return (
                  <div key={e.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${typeStyle[e.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">{e.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{e.date} · {e.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notices */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader title="School notices" sub="Latest announcements"
              action="View all" onAction={() => navigate("/parent/notices")} />
            <div className="divide-y divide-slate-50">
              {notices.slice(0, 3).map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${n.important ? "bg-rose-50" : "bg-blue-50"}`}>
                    {n.important
                      ? <AlertCircle className="w-4 h-4 text-rose-500" />
                      : <Bell className="w-4 h-4 text-blue-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-xs font-semibold text-slate-800 leading-snug">{n.title}</p>
                      {n.important && <span className="text-[9px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-bold">!</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {n.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;