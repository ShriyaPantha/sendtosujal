import {
  ChevronDown,
  ArrowRight,
  BookOpen,
  Database,
  Globe,
  Network,
  Megaphone,
  Code,
  Compass,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";

const DashboardAnalyticsRow = () => {
  const gpaData = [
    { sem: "1st Sem", gpa: 3.2, x: 15, y: 75 },
    { sem: "2nd Sem", gpa: 3.45, x: 45, y: 53 },
    { sem: "3rd Sem", gpa: 3.6, x: 75, y: 40 },
    { sem: "4th Sem", gpa: 3.85, x: 105, y: 15 },
  ];

  const subjects = [
    { name: "Data Structures", score: 92, completed: 90, icon: BookOpen, color: "blue" },
    { name: "Database Systems", score: 88, completed: 75, icon: Database, color: "teal" },
    { name: "Web Technologies", score: 85, completed: 60, icon: Globe, color: "amber" },
    { name: "Computer Networks", score: 90, completed: 80, icon: Network, color: "rose" },
  ];

  const notices = [
    { id: 1, title: "Semester Break", desc: "College will remain closed for semester break.", time: "2h ago", icon: Megaphone, bg: "bg-red-50 text-red-600 border-red-100" },
    { id: 2, title: "Hackathon", desc: "Inter-college hackathon registration open.", time: "May 20", icon: Code, bg: "bg-amber-50 text-amber-600 border-amber-100" },
    { id: 3, title: "Educational Tour", desc: "Pokhara tour scheduled for CSIT students.", time: "May 18", icon: Compass, bg: "bg-blue-50 text-blue-600 border-blue-100" },
    { id: 4, title: "Exam Routine", desc: "3rd semester exam routine published.", time: "May 17", icon: FileText, bg: "bg-purple-50 text-purple-600 border-purple-100" },
  ];

  const [draw, setDraw] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDraw(true), 150);
    return () => clearTimeout(t);
  }, []);

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100/50",
    teal: "bg-teal-50 text-teal-600 border-teal-100/50",
    amber: "bg-amber-50 text-amber-600 border-amber-100/50",
    rose: "bg-rose-50 text-rose-600 border-rose-100/50",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full items-stretch mt-4">

      {/* ================= CARD 1: ACADEMIC PROGRESS ================= */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
        
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-gray-900 text-sm tracking-tight">Academic Progress</h3>
          <button className="text-xs font-semibold text-gray-500 hover:text-gray-800 border border-gray-100 bg-gray-50/50 rounded-xl px-3 py-1.5 flex items-center gap-1 transition-all">
            This Semester <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4 items-center flex-1">
          {/* GPA Trend Canvas */}
          <div className="col-span-5 flex flex-col justify-between h-full pt-1">
            <p className="text-[11px] font-bold tracking-wider uppercase text-gray-400">GPA Trend</p>
            
            <div className="w-full h-24 relative my-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 90" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Smooth Area Background */}
                <path d="M15 90 L15 75 L45 53 L75 40 L105 15 L105 90 Z" fill="url(#chartGradient)" />
                {/* Animated Trend Line */}
                <path
                  d="M15 75 L45 53 L75 40 L105 15"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="200"
                  strokeDashoffset={draw ? 0 : 200}
                  style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
                {/* Data Nodes */}
                {gpaData.map((p, i) => (
                  <g key={i} className="group/node cursor-pointer">
                    <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[10px] fill-gray-900 font-bold tabular-nums">
                      {p.gpa.toFixed(2)}
                    </text>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="3.5"
                      className="fill-blue-600 stroke-white stroke-2 shadow-xs transition-all duration-200 group-hover/node:r-5 group-hover/node:fill-blue-700"
                    />
                  </g>
                ))}
              </svg>
            </div>

            <div className="flex justify-between border-t border-gray-50 pt-2 text-[10px] font-semibold text-gray-400">
              {gpaData.map((p, i) => (
                <span key={i}>{p.sem.split(" ")[0]}</span>
              ))}
            </div>
          </div>

          {/* Subjects Visual List */}
          <div className="col-span-7 space-y-3.5 border-l border-gray-100 pl-4">
            <p className="text-[11px] font-bold tracking-wider uppercase text-gray-400">Subject Overview</p>
            {subjects.map((s, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700 truncate max-w-30">{s.name}</span>
                  <span className="font-bold text-gray-900 tabular-nums">{s.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.score}%` }} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ================= CARD 2: LEARNING PROGRESS ================= */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 text-sm tracking-tight">Learning Progress</h3>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 group">
            View Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="space-y-3 flex-1 flex flex-col justify-center">
          {subjects.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50/60 transition-all duration-200 group/item cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorMap[s.color]} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-xs font-semibold text-gray-800 block truncate">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${s.completed}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 shrink-0 tabular-nums">{s.completed}%</span>
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-300 group-hover/item:text-gray-600 -rotate-90 group-hover/item:translate-x-0.5 transition-all shrink-0 ml-2" />
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= CARD 3: RECENT NOTICES ================= */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 text-sm tracking-tight">Recent Notices</h3>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">All Bulletin</button>
        </div>

        <div className="space-y-3 flex-1 flex flex-col justify-center divide-y divide-gray-50">
          {notices.map((n, idx) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className={`flex gap-3 items-start transition-colors duration-150 group cursor-pointer ${idx !== 0 ? "pt-3" : ""}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${n.bg}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{n.title}</p>
                    <span className="text-[10px] font-medium text-gray-400 shrink-0 whitespace-nowrap">{n.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-normal line-clamp-1">
                    {n.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default DashboardAnalyticsRow;