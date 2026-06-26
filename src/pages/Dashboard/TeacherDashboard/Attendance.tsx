import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, Search, CheckCircle2, XCircle, Clock, Users, Calendar, AlertCircle
} from "lucide-react";
import { useDataStore } from "./DataStore";

type Status = "Present" | "Absent" | "Late";

const statusStyles: Record<Status, { bg: string; text: string; icon: JSX.Element }> = {
  Present: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "Present", icon: <CheckCircle2 size={12} /> },
  Absent:  { bg: "bg-red-50 text-red-600 border-red-200",             text: "Absent",  icon: <XCircle size={12} />       },
  Late:    { bg: "bg-amber-50 text-amber-600 border-amber-200",       text: "Late",    icon: <Clock size={12} />        },
};

// ─── Storage helpers (uses window.storage when available, falls back to localStorage) ───
const storageGet = async (key: string): Promise<string | null> => {
  try {
    if (typeof window !== "undefined" && (window as any).storage) {
      const result = await (window as any).storage.get(key);
      return result ? result.value : null;
    }
  } catch {
    // key not found or storage unavailable — fall through to localStorage
  }
  return localStorage.getItem(key);
};

const storageSet = async (key: string, value: string): Promise<void> => {
  try {
    if (typeof window !== "undefined" && (window as any).storage) {
      await (window as any).storage.set(key, value);
      return;
    }
  } catch {
    // fall through to localStorage
  }
  localStorage.setItem(key, value);
};

// ─── Component ──────────────────────────────────────────────────────────────────────────
const Attendance = () => {
  const navigate = useNavigate();
  const { classes, students, updateAttendance } = useDataStore();

  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [search, setSearch] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const todayDateStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayDateStr);
  const isFutureDate = selectedDate > todayDateStr;

  const activeStudents = students
    .filter(s => s.batch === selectedClass.batch)
    .sort((a, b) => a.name.localeCompare(b.name));

  const [attendance, setAttendance] = useState<Record<string, Status>>({});

  // Load saved attendance from persistent storage whenever class/date changes
  useEffect(() => {
    if (isFutureDate) {
      setAttendance({});
      return;
    }
    const key = `attendance_${selectedClass.id}_${selectedDate}`;
    (async () => {
      const savedData = await storageGet(key);
      if (savedData) {
        setAttendance(JSON.parse(savedData));
      } else {
        const defaultAttendance: Record<string, Status> = {};
        activeStudents.forEach(student => {
          defaultAttendance[student.id] = "Present";
        });
        setAttendance(defaultAttendance);
      }
      setSearch("");
    })();
  }, [selectedClass, selectedDate, isFutureDate]);

  const filteredStudents = activeStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toString().includes(search) ||
    s.roll.toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents  = activeStudents.length;
  const presentCount   = isFutureDate ? 0 : activeStudents.filter(s => (attendance[s.id] || "Present") === "Present").length;
  const absentCount    = isFutureDate ? 0 : activeStudents.filter(s => attendance[s.id] === "Absent").length;
  const lateCount      = isFutureDate ? 0 : activeStudents.filter(s => attendance[s.id] === "Late").length;

  // Percentages (guard divide-by-zero)
  const pct = (n: number) => totalStudents > 0 ? ((n / totalStudents) * 100).toFixed(1) : "0.0";
  const attendanceRate = totalStudents > 0 && !isFutureDate
    ? (((presentCount + lateCount) / totalStudents) * 100).toFixed(1)
    : "0.0";

  const saveAttendanceData = async () => {
    if (isFutureDate) return;
    const key = `attendance_${selectedClass.id}_${selectedDate}`;
    await storageSet(key, JSON.stringify(attendance));

    Object.entries(attendance).forEach(([id, status]) => {
      updateAttendance(Number(id), status as any);
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const markAllStudentsAs = (status: Status) => {
    if (isFutureDate) return;
    const updated = { ...attendance };
    activeStudents.forEach(student => { updated[student.id] = status; });
    setAttendance(updated);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 h-14 flex items-center px-4 sm:px-6 gap-2 sticky top-0 z-10 w-full justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/teacher/dashboard")}
            className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer"
          >
            Dashboard <ChevronRight size={12} />
          </button>
          <span className="text-xs font-semibold text-slate-700">Attendance</span>
        </div>
        <button
          disabled={isFutureDate}
          onClick={saveAttendanceData}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all duration-150 ${
            isFutureDate
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : isSaved
              ? "bg-emerald-600 text-white"
              : "bg-slate-900 text-white"
          }`}
        >
          {isSaved ? "✓ Attendance Saved" : "Save Attendance"}
        </button>
      </header>

      <div className="p-4 sm:p-6 space-y-5 max-w-[1200px] mx-auto w-full">
        {/* ── Date picker + quick counts ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-800">Select Date and Check History</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <p className="font-medium text-slate-600">{formatDate(selectedDate)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <label htmlFor="date-input" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date:</label>
              <input
                id="date-input"
                type="date"
                max={todayDateStr}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent font-medium text-xs text-slate-700 outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 border border-slate-200 rounded-xl text-[11px]">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg">{presentCount} Present</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 font-bold rounded-lg">{absentCount} Absent</span>
              <span className="px-2 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg">{lateCount} Late</span>
            </div>
          </div>
        </div>

        {/* ── Class selector ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {classes.map(cls => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className={`text-left p-3.5 rounded-2xl border transition-all duration-200 shadow-sm ${
                selectedClass.id === cls.id
                  ? "bg-slate-900 border-slate-900 text-white ring-2 ring-slate-900/10 scale-[1.01]"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-bold truncate">{cls.subject}</p>
              <p className={`text-[10px] font-semibold mt-1 ${selectedClass.id === cls.id ? "text-blue-400" : "text-slate-400"}`}>
                {cls.batch}
              </p>
            </button>
          ))}
        </div>

        {/* ── Student list ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-800">{selectedClass.subject}</span>
            </div>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 gap-2 w-full sm:w-60 focus-within:border-blue-500">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                disabled={isFutureDate}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-xs outline-none w-full"
                placeholder="Search..."
              />
            </div>
          </div>

          {!isFutureDate && (
            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border-b border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-1">Mark Everyone As:</span>
              {(["Present", "Absent", "Late"] as Status[]).map(statusKey => (
                <button
                  key={statusKey}
                  onClick={() => markAllStudentsAs(statusKey)}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg border shadow-sm bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  {statusKey}
                </button>
              ))}
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {isFutureDate ? (
              <div className="p-12 text-center text-slate-400">
                <AlertCircle size={24} className="mx-auto mb-2 text-amber-500" />
                <p className="text-xs">Cannot Take Attendance For Future Dates</p>
              </div>
            ) : (
              filteredStudents.map((student, i) => (
                <div
                  key={student.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50/40 w-full"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-slate-400 w-5">{i + 1}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{student.name}</p>
                      <p className="text-[10px] text-slate-400">Roll: {student.roll}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {(["Present", "Absent", "Late"] as Status[]).map(statusKey => (
                      <button
                        key={statusKey}
                        onClick={() => setAttendance(prev => ({ ...prev, [student.id]: statusKey }))}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold ${
                          attendance[student.id] === statusKey
                            ? statusStyles[statusKey].bg
                            : "bg-white border-slate-200 text-slate-400"
                        }`}
                      >
                        {statusKey}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* ── Footer Summary ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-3">

          {isFutureDate ? (
            <p className="text-center text-[11px] text-slate-400 font-medium py-1">No attendance data for future dates</p>
          ) : (
            <div className="flex flex-wrap items-center gap-3 sm:gap-0 sm:justify-between">
              {/* Attendance rate pill */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Rate</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  Number(attendanceRate) >= 75
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-700"
                }`}>
                  {attendanceRate}%
                </span>
              </div>

              {/* Stat bars */}
              <div className="flex items-center gap-4">
                {/* Present */}
                <div className="flex flex-col items-center gap-0.5 min-w-[56px]">
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${pct(presentCount)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-emerald-700">{presentCount}</span>
                    <span className="text-[10px] text-slate-400">Present</span>
                    <span className="text-[10px] font-semibold text-emerald-600">({pct(presentCount)}%)</span>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-200" />

                {/* Absent */}
                <div className="flex flex-col items-center gap-0.5 min-w-[56px]">
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-300"
                      style={{ width: `${pct(absentCount)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-red-600">{absentCount}</span>
                    <span className="text-[10px] text-slate-400">Absent</span>
                    <span className="text-[10px] font-semibold text-red-500">({pct(absentCount)}%)</span>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-200" />

                {/* Late */}
                <div className="flex flex-col items-center gap-0.5 min-w-[48px]">
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${pct(lateCount)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-amber-600">{lateCount}</span>
                    <span className="text-[10px] text-slate-400">Late</span>
                    <span className="text-[10px] font-semibold text-amber-500">({pct(lateCount)}%)</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center gap-1.5">
                <Users size={12} className="text-slate-400" />
                <span className="text-[11px] font-bold text-slate-600">{totalStudents}</span>
                <span className="text-[10px] text-slate-400">Total Students</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;