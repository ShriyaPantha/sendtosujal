// src/pages/Dashboard/ReceptionistDashboard/ReceptionistDashboard.tsx
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, AreaChart, Area, CartesianGrid,
} from "recharts";
import {
  CheckCircle, Users, Phone, Mail, CreditCard, Bell, ArrowRight,
  MessageSquare, Calendar, AlertCircle, Clock, UserPlus, Printer,
  CircleDollarSign, CalendarDays,
} from "lucide-react";

// ── Reusable ──────────────────────────────────────────────────────────────────

const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    waiting:      "bg-amber-50 text-amber-600 border border-amber-100",
    "checked-in": "bg-indigo-50 text-indigo-600 border border-indigo-100",
    "checked-out":"bg-emerald-50 text-emerald-600 border border-emerald-100",
  };
  const labels: Record<string, string> = {
    waiting: "Waiting", "checked-in": "Checked In", "checked-out": "Checked Out",
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

// ── Mock data ─────────────────────────────────────────────────────────────────

const visitorPurposeData = [
  { purpose: "Admission", count: 8 },
  { purpose: "Fees",      count: 14 },
  { purpose: "Meeting",   count: 6 },
  { purpose: "Delivery",  count: 4 },
  { purpose: "Other",     count: 3 },
];

const weeklyVisitorTrend = [
  { day: "Mon", visitors: 32, calls: 18 },
  { day: "Tue", visitors: 28, calls: 22 },
  { day: "Wed", visitors: 35, calls: 19 },
  { day: "Thu", visitors: 30, calls: 25 },
  { day: "Fri", visitors: 38, calls: 21 },
  { day: "Sat", visitors: 12, calls: 8  },
];

const checkInData = [
  { name: "Checked In",  value: 14, fill: "#6366f1" },
  { name: "Waiting",     value: 5,  fill: "#f59e0b" },
  { name: "Checked Out", value: 17, fill: "#10b981" },
];
const totalVisitorsToday = checkInData.reduce((a, b) => a + b.value, 0);

const visitorLog = [
  { id: 1, name: "Mr. Bishal Karki",   purpose: "Admission Inquiry",   time: "09:15 AM", status: "waiting" },
  { id: 2, name: "Mrs. Anita Gurung",  purpose: "Fee Payment",         time: "09:40 AM", status: "checked-out" },
  { id: 3, name: "Mr. Rajiv Koirala",  purpose: "Meeting – Principal", time: "10:05 AM", status: "checked-in" },
  { id: 4, name: "Ms. Sunita Rai",     purpose: "Document Delivery",   time: "10:20 AM", status: "checked-out" },
  { id: 5, name: "Mr. Bikash Thapa",   purpose: "Parent Meeting",      time: "10:45 AM", status: "checked-in" },
];

const appointmentsToday = [
  { id: 1, title: "Campus tour – prospective parent",        time: "11:00 AM", type: "visitor" },
  { id: 2, title: "Callback: Mrs. Karki re: fee receipt",     time: "12:30 PM", type: "callback" },
  { id: 3, title: "Courier pickup – exam papers",             time: "02:00 PM", type: "task" },
];

const notices = [
  { id: 1, title: "Front office closes early on Friday",            date: "Jun 16", important: true  },
  { id: 2, title: "New visitor sign-in policy effective Monday",     date: "Jun 14", important: false },
  { id: 3, title: "Staff ID cards to be reissued this week",         date: "Jun 12", important: false },
];

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-indigo-600">{payload[0].value} visitors</p>
    </div>
  );
};

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const ReceptionistDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Visitors Today",   value: `${totalVisitorsToday}`, sub: "14 currently on campus", icon: Users,       color: "violet",  path: "/receptionist/visitors"  },
    { label: "Pending Callbacks",value: "7",                     sub: "3 marked urgent",         icon: Phone,       color: "amber",   path: "/receptionist/calls"     },
    { label: "New Inquiries",    value: "5",                     sub: "2 admission · 3 general", icon: Mail,        color: "blue",    path: "/receptionist/inquiries" },
    { label: "Fees Collected",   value: "$1,240",                sub: "12 transactions today",   icon: CreditCard,  color: "emerald", path: "/receptionist/fees"      },
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Front Desk Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">
              Welcome back, Meera &nbsp;·&nbsp; Shift{" "}
              <span className="text-indigo-500 font-medium">9:00 AM – 5:00 PM</span>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "New Visitor", icon: UserPlus,      path: "/receptionist/visitors/new" },
              { label: "Log Call",    icon: Phone,         path: "/receptionist/calls/new"    },
              { label: "Print Pass",  icon: Printer,        path: "/receptionist/passes"        },
              { label: "Calendar",    icon: Calendar,      path: "/receptionist/calendar"     },
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
            <CardHeader title="Visitor purpose breakdown" sub="So far today"
              action="Full log" onAction={() => navigate("/receptionist/visitors")} />
            <div className="p-5">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={visitorPurposeData} barSize={32} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="purpose" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="url(#barGrad)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-5 gap-2 mt-3">
                {visitorPurposeData.map((d) => (
                  <div key={d.purpose} className="text-center">
                    <p className="text-xs font-bold text-slate-800">{d.count}</p>
                    <div className="w-full h-1 rounded-full bg-slate-100 mt-1 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-400" style={{ width: `${(d.count / 14) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Radial Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader title="Front desk status" sub="Live snapshot" />
            <div className="flex flex-col items-center py-4">
              <div className="relative">
                <ResponsiveContainer width={180} height={180}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius={45} outerRadius={80}
                    data={checkInData} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "#f8fafc" }} />
                    <Tooltip formatter={(val: any) => `${val}`} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold text-slate-900">{totalVisitorsToday}</p>
                  <p className="text-[10px] text-slate-400">total today</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mt-1 px-5 w-full">
                {checkInData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-slate-700">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Area Chart + Visitor Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader title="Weekly front desk trend" sub="Visitors vs phone inquiries"
              action="View details" onAction={() => navigate("/receptionist/reports")} />
            <div className="p-5">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={weeklyVisitorTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomAreaTooltip />} />
                  <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#6366f1" strokeWidth={2}
                    fill="url(#visitGrad)" dot={{ fill: "#6366f1", r: 3 }} />
                  <Area type="monotone" dataKey="calls" name="Calls" stroke="#f59e0b" strokeWidth={2}
                    fill="url(#callGrad)" dot={{ fill: "#f59e0b", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-5 mt-3">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-3 h-0.5 bg-indigo-500 rounded inline-block" /> Visitors
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-3 h-0.5 bg-amber-400 rounded inline-block" /> Calls
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader title="Visitor log" sub="Today"
              action="View all" onAction={() => navigate("/receptionist/visitors")} />
            <div className="divide-y divide-slate-50">
              {visitorLog.slice(0, 4).map((v) => (
                <div key={v.id} className="px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-slate-800 leading-snug">{v.name}</p>
                    <Badge status={v.status} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{v.purpose} · {v.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Receptionist Profile */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">MJ</div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Meera Joshi</p>
                  <p className="text-[11px] text-slate-400">Front Desk Receptionist</p>
                  <p className="text-[11px] text-slate-400">Desk 1 · Main Lobby</p>
                </div>
              </div>
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between"><span className="text-slate-400">Calls handled</span><span className="font-medium text-slate-700">19 today</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Visitors assisted</span><span className="font-semibold text-emerald-600">{totalVisitorsToday} today</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Shift ends</span><span className="font-medium text-indigo-600">5:00 PM</span></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => navigate("/receptionist/calls/new")}
                  className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-medium hover:bg-indigo-100 flex items-center justify-center gap-1 transition-colors">
                  <Phone className="w-3.5 h-3.5" /> Log Call
                </button>
                <button onClick={() => navigate("/receptionist/visitors/new")}
                  className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 flex items-center justify-center gap-1 transition-colors">
                  <UserPlus className="w-3.5 h-3.5" /> New Visitor
                </button>
              </div>
            </div>
          </div>

          {/* Fee Collection Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-400" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-800">Collected today</p>
                <CircleDollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-amber-500">$1,240</p>
              <p className="text-[11px] text-slate-400 mt-1">across 12 transactions</p>
              <div className="space-y-2 text-xs mt-4 border-t border-slate-100 pt-3">
                <div className="flex justify-between"><span className="text-slate-400">Cash</span><span className="font-medium text-slate-700">$480</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Card</span><span className="font-medium text-slate-700">$360</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Bank transfer</span><span className="font-medium text-slate-700">$400</span></div>
              </div>
              <button onClick={() => navigate("/receptionist/fees")}
                className="w-full mt-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
                View transactions <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader title="Today's appointments" sub="Front desk schedule"
              action="Calendar" onAction={() => navigate("/receptionist/calendar")} />
            <div className="divide-y divide-slate-50">
              {appointmentsToday.map((e) => {
                const typeStyle: Record<string, string> = {
                  visitor:  "bg-indigo-50 text-indigo-500",
                  callback: "bg-amber-50 text-amber-500",
                  task:     "bg-emerald-50 text-emerald-500",
                };
                const Icon = e.type === "visitor" ? Users : e.type === "callback" ? Phone : CheckCircle;
                return (
                  <div key={e.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${typeStyle[e.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">{e.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{e.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notices */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader title="Staff notices" sub="Latest announcements"
              action="View all" onAction={() => navigate("/receptionist/notices")} />
            <div className="divide-y divide-slate-50">
              {notices.map((n) => (
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

export default ReceptionistDashboard;