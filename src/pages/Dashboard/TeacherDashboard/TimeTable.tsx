import { useNavigate } from "react-router-dom";
import { ChevronRight, CalendarDays } from "lucide-react";

// Color mapping for a clean UI
const CLASS_COLORS: Record<string, string> = {
  "Data Structures": "bg-blue-100 text-blue-700",
  "DBMS": "bg-emerald-100 text-emerald-700",
  "Algorithms": "bg-amber-100 text-amber-700",
  "Adv. Programming": "bg-purple-100 text-purple-700",
};

const SCHEDULE = [
  { time: "8-9", mon: "Data Structures", tue: "Data Structures", wed: "Data Structures", thu: "Data Structures", fri: "Data Structures" },
  { time: "10-11", mon: "DBMS", tue: "DBMS", wed: "DBMS", thu: "DBMS", fri: "DBMS" },
  { time: "1-2", mon: "Algorithms", tue: "Algorithms", wed: "Algorithms", thu: "Algorithms", fri: "Algorithms" },
  { time: "3-4", mon: "Adv. Programming", tue: "Adv. Programming", wed: "Adv. Programming", thu: "Adv. Programming", fri: "Adv. Programming" },
];

const Timetable = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 h-14 flex items-center px-4 md:px-8 gap-2 sticky top-0 z-10">
        <button onClick={() => navigate("/teacher/dashboard")} className="text-blue-600 text-xs flex items-center gap-1 hover:underline font-medium">
          Dashboard <ChevronRight size={12} />
        </button>
        <span className="text-xs font-semibold text-slate-700">Timetable</span>
      </header>

      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CalendarDays size={16} className="text-blue-600" /> Weekly Class Schedule
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-3">Time</th>
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map(day => <th key={day} className="py-4 px-3">{day}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SCHEDULE.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-4 px-3 font-bold text-slate-700">{row.time}</td>
                    {[row.mon, row.tue, row.wed, row.thu, row.fri].map((sub, idx) => (
                      <td key={idx} className="py-2 px-3">
                        <span className={`px-2.5 py-1 rounded-full font-semibold ${CLASS_COLORS[sub] || "bg-slate-100 text-slate-600"}`}>
                          {sub}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Timetable;