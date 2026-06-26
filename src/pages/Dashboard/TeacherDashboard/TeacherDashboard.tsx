import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap, ClipboardCheck,
  Bell, Users, BookOpen, Clock, ChevronRight, AlertCircle, Award, Loader2
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis,
} from "recharts";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:4000";

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface TeacherProfile {
  _id: string;
  employeeId: string;
  department: string;
  qualification?: string;
  subjects: string[];
  joiningDate: string;
  status: string;
  userId: {
    fullName: string;
    email: string;
    role: string;
  };
  schoolId: {
    name: string;
    email: string;
  };
}

// ─── STATIC / PLACEHOLDER DATA (replace with your real endpoints) ────────────
const COLORS = ["#6366f1", "#ef4444", "#f59e0b", "#3b82f6"];

const weeklyData = [
  { day: "Mon", attendance: 90 },
  { day: "Tue", attendance: 85 },
  { day: "Wed", attendance: 88 },
  { day: "Thu", attendance: 82 },
  { day: "Fri", attendance: 91 },
  { day: "Sat", attendance: 78 },
];

const notifications = [
  { text: "New homework answers submitted for DBMS", time: "2h ago", type: "info" },
  { text: "Bikash Gurung marked Late in class today",  time: "5h ago", type: "warning" },
  { text: "Teachers meeting tomorrow at 11:00 AM",     time: "1d ago", type: "info" },
];

// ─── HELPER ─────────────────────────────────────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem("token");
}

async function apiFetch<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────
const TeacherDashboard = () => {
  const navigate = useNavigate();

  const [teacher, setTeacher]       = useState<TeacherProfile | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // These would come from your attendance / assignment endpoints.
  // Swap these useState defaults with real fetches once those routes exist.
  const [totalStudents]             = useState(42);
  const [presentStudents]           = useState(36);
  const [absentStudents]            = useState(4);
  const [lateStudents]              = useState(2);
  const [leaveStudents]             = useState(0);
  const [activeAssignments]         = useState(3);
  const [itemsToGradeCount]         = useState(7);

  const [classes] = useState([
    { id: "c1", subject: "Data Structures", batch: "BCA-2nd",  room: "Room 201", time: "9:00 AM",  status: "done"    },
    { id: "c2", subject: "DBMS",            batch: "BCA-3rd",  room: "Room 305", time: "11:00 AM", status: "ongoing" },
    { id: "c3", subject: "Algorithms",      batch: "BCA-4th",  room: "Room 102", time: "2:00 PM",  status: "upcoming"},
  ]);

  const [assignments] = useState([
    { title: "ER Diagram Assignment", submissions: 28, total: 42, status: "Active" },
    { title: "Sorting Algorithm Lab",  submissions: 35, total: 42, status: "Active" },
    { title: "SQL Query Practice",     submissions: 10, total: 42, status: "Active" },
  ]);

  // ── Fetch teacher profile from backend ──────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch<{ success: boolean; data: TeacherProfile }>("/api/teachers/me");
        if (data.success) setTeacher(data.data);
        else throw new Error("Failed to load profile");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ── Derived values ───────────────────────────────────────────────────────
  const avgAttendance =
    totalStudents > 0
      ? Math.round(((presentStudents + lateStudents) / totalStudents) * 100)
      : 0;

  const attendanceData = [
    { name: "Present", value: presentStudents },
    { name: "Absent",  value: absentStudents  },
    { name: "Late",    value: lateStudents    },
    { name: "Leave",   value: leaveStudents   },
  ].filter((item) => item.value > 0);

  const nextScheduledClass =
    classes.find((c) => c.status === "ongoing") || classes[0];

  const handleAttendanceNavigation = (classItem: typeof nextScheduledClass) => {
    navigate("/teacher/attendance", {
      state: {
        classId: classItem.id,
        subject: classItem.subject,
        batch:   classItem.batch,
      },
    });
  };

  const stats = [
    {
      title:  "Total Students",
      value:  totalStudents.toString(),
      icon:   Users,
      trend:  "View student lists",
      color:  "text-indigo-600",
      bg:     "bg-indigo-50",
      action: () => navigate("/teacher/students"),
    },
    {
      title:  "Classes Today",
      value:  classes.length.toString(),
      icon:   BookOpen,
      trend:  `${classes.filter((c) => c.status === "upcoming").length} classes left`,
      color:  "text-emerald-600",
      bg:     "bg-emerald-50",
      action: () => navigate("/teacher/attendance"),
    },
    {
      title:  "Today's Attendance",
      value:  `${avgAttendance}%`,
      icon:   ClipboardCheck,
      trend:  `${presentStudents} students present`,
      color:  "text-blue-600",
      bg:     "bg-blue-50",
      action: () => navigate("/teacher/attendance"),
    },
    {
      title:  "Ungraded Work",
      value:  itemsToGradeCount.toString(),
      icon:   Award,
      trend:  `${activeAssignments} active tasks`,
      color:  "text-orange-600",
      bg:     "bg-orange-50",
      action: () => navigate("/teacher/grades"),
    },
  ];

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <p className="text-sm font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white border border-red-100 rounded-xl p-6 max-w-sm text-center shadow-sm">
          <AlertCircle className="text-red-400 mx-auto mb-3" size={32} />
          <p className="text-sm font-semibold text-slate-700 mb-1">Could not load dashboard</p>
          <p className="text-xs text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Resolved display name ────────────────────────────────────────────────
  const displayName  = teacher?.userId?.fullName  ?? "Teacher";
  const displayRole  = teacher?.department         ? `${teacher.department} Dept.` : "Associate Professor";
  const displayId    = teacher?.employeeId         ?? "—";
  const displaySubs  = teacher?.subjects?.length   ? teacher.subjects : ["—"];
  const schoolName   = teacher?.schoolId?.name     ?? "";

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-4 bg-slate-50 min-h-screen space-y-4">

      {/* ── TOP: PROFILE BANNER + NEXT CLASS ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* PROFILE BANNER */}
        <div className="lg:col-span-2 bg-gradient-to-r from-violet-700 to-indigo-700 text-white rounded-xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />

          <div>
            <p className="text-[10px] tracking-widest opacity-70 uppercase font-bold">
              Teacher Portal {schoolName ? `· ${schoolName}` : ""}
            </p>
            <h1 className="text-2xl font-bold mt-1">Welcome Back, {displayName} 👋</h1>
            <p className="text-xs opacity-75 mt-1">
              Check your schedule, track student attendance, and manage student grades.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 text-xs">
            <span className="bg-white/15 px-3 py-1 rounded-full flex items-center gap-1">
              <GraduationCap size={12} /> {displayRole}
            </span>
            <span className="bg-white/15 px-3 py-1 rounded-full">{displayId}</span>
            {teacher?.status && (
              <span className={`px-3 py-1 rounded-full font-semibold capitalize ${
                teacher.status === "active"
                  ? "bg-emerald-400/30 text-emerald-100"
                  : "bg-red-400/30 text-red-100"
              }`}>
                {teacher.status}
              </span>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex gap-2 flex-wrap items-center">
            <span className="text-[10px] opacity-60 uppercase mr-1">Your Subjects:</span>
            {displaySubs.map((s, i) => (
              <span key={i} className="bg-white/20 text-[10px] px-2 py-0.5 rounded font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* NEXT CLASS CARD */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col justify-between border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800">Next Class Up</span>
            <button
              onClick={() => handleAttendanceNavigation(nextScheduledClass)}
              className="text-indigo-600 text-xs flex items-center gap-0.5 font-semibold hover:underline"
            >
              View Sheet <ChevronRight size={11} />
            </button>
          </div>

          <div>
            <span className="bg-indigo-100 text-indigo-800 text-[9px] px-2 py-0.5 rounded font-semibold inline-block mt-2 uppercase">
              {nextScheduledClass.status}
            </span>
            <p className="text-base font-bold mt-1 text-slate-800">{nextScheduledClass.subject}</p>
            <p className="text-xs text-slate-500">Batch: {nextScheduledClass.batch} · {nextScheduledClass.room}</p>
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
              <Clock size={12} className="text-indigo-500" />
              <span>Starts at {nextScheduledClass.time} (Today)</span>
            </div>
          </div>

          <button
            onClick={() => handleAttendanceNavigation(nextScheduledClass)}
            className="mt-3 w-full bg-indigo-600 text-white text-xs py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Open {nextScheduledClass.subject} Register →
          </button>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div
            key={i}
            onClick={s.action}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-200 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.title}</p>
                <p className="text-2xl font-black text-slate-800">{s.value}</p>
                <p className="text-[10px] text-slate-500 font-medium">{s.trend}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${s.bg}`}>
                <s.icon size={18} className={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── SCHEDULE + PIE ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* DAILY SCHEDULE */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Today's Class Schedule</h3>
              <p className="text-[11px] text-slate-400">Click any row to open its attendance tracker</p>
            </div>
            <button
              onClick={() => navigate("/teacher/attendance")}
              className="text-indigo-600 text-xs font-semibold hover:underline"
            >
              See Full Day
            </button>
          </div>

          <div className="space-y-2.5">
            {classes.map((cls, i) => (
              <div
                key={i}
                onClick={() => handleAttendanceNavigation(cls)}
                className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${
                  cls.status === "ongoing"  ? "bg-indigo-50/60 border-indigo-200 shadow-sm" :
                  cls.status === "done"     ? "bg-slate-50/50 border-slate-100 opacity-60"  :
                  "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="text-xs font-bold text-slate-600 w-16 text-right shrink-0">{cls.time}</div>
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  cls.status === "ongoing" ? "bg-indigo-500 ring-4 ring-indigo-100" :
                  cls.status === "done"    ? "bg-slate-300" : "bg-amber-400 animate-pulse"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{cls.subject}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{cls.batch} · <span className="text-slate-400">{cls.room}</span></p>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                  cls.status === "ongoing" ? "bg-indigo-100 text-indigo-700" :
                  cls.status === "done"    ? "bg-slate-100 text-slate-500"   :
                  "bg-amber-50 text-amber-700"
                }`}>
                  {cls.status === "ongoing" ? "Active Now" : cls.status === "done" ? "Finished" : "Upcoming"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">Attendance Breakdown</h3>
            <p className="text-[10px] text-slate-400">Visual status of students currently logged</p>
          </div>

          <div className="relative flex justify-center items-center my-2">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={attendanceData} dataKey="value" innerRadius={42} outerRadius={60} paddingAngle={3}>
                  {attendanceData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-xl font-black text-indigo-600">{avgAttendance}%</p>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Present</p>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-50 pt-2.5">
            {attendanceData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">
                  {item.value} {item.value === 1 ? "student" : "students"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* WEEKLY BAR CHART */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">Weekly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={weeklyData} barSize={16}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="attendance" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ASSIGNMENT PROGRESS */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Assignment Hand-ins</h3>
            <button
              onClick={() => navigate("/teacher/assignments")}
              className="text-indigo-600 text-xs font-medium"
            >
              See All
            </button>
          </div>
          <div className="space-y-3 max-h-[130px] overflow-y-auto pr-1">
            {assignments.slice(0, 3).map((asg, i) => {
              const percentage = Math.round((asg.submissions / asg.total) * 100) || 0;
              return (
                <div
                  key={i}
                  className="space-y-1 cursor-pointer"
                  onClick={() => navigate("/teacher/assignments")}
                >
                  <div className="flex justify-between text-xs">
                    <p className="font-bold text-slate-700 truncate flex-1 pr-2">{asg.title}</p>
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                      {asg.submissions}/{asg.total}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1">
            <Bell size={13} className="text-indigo-500" /> Recent Updates
          </p>
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <div className={`mt-0.5 shrink-0 ${n.type === "warning" ? "text-amber-500" : "text-indigo-500"}`}>
                  <AlertCircle size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 font-medium leading-tight">{n.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;