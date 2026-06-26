// src/pages/Dashboard/ParentDashboard/AcademicReports.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, Award,
  BookOpen, FileText, Download, ChevronRight,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubjectResult {
  subject: string;
  marks: number;
  outOf: number;
  grade: string;
  teacher: string;
  remarks: string;
  trend: "up" | "down" | "stable";
}

interface TermReport {
  term: string;
  year: string;
  rank: number;
  totalStudents: number;
  percentage: number;
  subjects: SubjectResult[];
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const reports: TermReport[] = [
  {
    term: "Term 1",
    year: "2025–26",
    rank: 8,
    totalStudents: 42,
    percentage: 87.6,
    subjects: [
      { subject: "Mathematics",        marks: 88, outOf: 100, grade: "A",  teacher: "Mrs. Sharma",  remarks: "Excellent problem solving. Work on speed.",       trend: "up"     },
      { subject: "Science",            marks: 91, outOf: 100, grade: "A+", teacher: "Mr. Patel",    remarks: "Outstanding. Curious and engaged in class.",      trend: "up"     },
      { subject: "English",            marks: 79, outOf: 100, grade: "B+", teacher: "Ms. Gupta",    remarks: "Good comprehension. Needs to improve writing.",   trend: "stable" },
      { subject: "Social Studies",     marks: 85, outOf: 100, grade: "A",  teacher: "Mr. Verma",    remarks: "Strong performance. Very attentive.",             trend: "up"     },
      { subject: "Computer Science",   marks: 95, outOf: 100, grade: "A+", teacher: "Mr. Singh",    remarks: "Exceptional. Top scorer in class.",               trend: "up"     },
      { subject: "Hindi",              marks: 82, outOf: 100, grade: "A",  teacher: "Mrs. Joshi",   remarks: "Good command of language. Keep it up.",           trend: "stable" },
    ],
  },
  {
    term: "Term 2",
    year: "2025–26",
    rank: 6,
    totalStudents: 42,
    percentage: 90.2,
    subjects: [
      { subject: "Mathematics",        marks: 92, outOf: 100, grade: "A+", teacher: "Mrs. Sharma",  remarks: "Remarkable improvement. Consistent performance.", trend: "up"     },
      { subject: "Science",            marks: 88, outOf: 100, grade: "A",  teacher: "Mr. Patel",    remarks: "Very good. Continue the excellent effort.",       trend: "down"   },
      { subject: "English",            marks: 84, outOf: 100, grade: "A",  teacher: "Ms. Gupta",    remarks: "Noticeable improvement in writing skills.",       trend: "up"     },
      { subject: "Social Studies",     marks: 87, outOf: 100, grade: "A",  teacher: "Mr. Verma",    remarks: "Consistent. Good map work.",                     trend: "up"     },
      { subject: "Computer Science",   marks: 98, outOf: 100, grade: "A+", teacher: "Mr. Singh",    remarks: "Perfect score on coding quiz. Brilliant.",        trend: "up"     },
      { subject: "Hindi",              marks: 82, outOf: 100, grade: "A",  teacher: "Mrs. Joshi",   remarks: "Maintained standard. Good effort.",              trend: "stable" },
    ],
  },
];

const gradeColor: Record<string, { text: string; bg: string }> = {
  "A+": { text: "text-emerald-700", bg: "bg-emerald-50" },
  "A":  { text: "text-indigo-700",  bg: "bg-indigo-50"  },
  "B+": { text: "text-violet-700",  bg: "bg-violet-50"  },
  "B":  { text: "text-amber-700",   bg: "bg-amber-50"   },
  "C":  { text: "text-rose-700",    bg: "bg-rose-50"    },
};

// ── Sub-components ────────────────────────────────────────────────────────────

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up")     return <TrendingUp   className="w-3.5 h-3.5 text-emerald-500" />;
  if (trend === "down")   return <TrendingDown className="w-3.5 h-3.5 text-rose-400"    />;
  return                         <Minus        className="w-3.5 h-3.5 text-slate-400"   />;
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-indigo-600 mt-0.5">{payload[0].value} / {payload[0].payload.outOf}</p>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const Reports = () => {
  const navigate = useNavigate();
  const [selectedTerm, setSelectedTerm] = useState(1); // index into reports[]

  const report   = reports[selectedTerm];
  const radarData = report.subjects.map((s) => ({
    subject: s.subject.replace(" Science", " Sci").replace("Social Studies", "S.St").replace("Computer Science", "Comp").replace("Mathematics", "Math"),
    score: Math.round((s.marks / s.outOf) * 100),
  }));

  const overallPercent = report.percentage;
  const gradeLabel     = overallPercent >= 90 ? "A+" : overallPercent >= 80 ? "A" : overallPercent >= 70 ? "B+" : "B";

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic Reports</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Aryan Sharma · Grade 5 – Section A · {report.year}</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition-all">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>

        {/* Term selector */}
        <div className="flex gap-2">
          {reports.map((r, i) => (
            <button key={r.term} onClick={() => setSelectedTerm(i)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                selectedTerm === i
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
              }`}>
              {r.term}
            </button>
          ))}
        </div>

        {/* Summary banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold opacity-75 uppercase tracking-widest">{report.term} · {report.year}</p>
              <div className="flex items-end gap-3 mt-1">
                <p className="text-5xl font-bold">{overallPercent}%</p>
                <span className="text-white/70 text-sm pb-1">overall</span>
              </div>
              <p className="text-xs opacity-75 mt-1">
                Rank {report.rank} of {report.totalStudents} students
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/10 rounded-2xl p-4 text-center min-w-[80px]">
                <Award className="w-5 h-5 text-yellow-300 mx-auto mb-1" />
                <p className="text-lg font-bold">{gradeLabel}</p>
                <p className="text-[10px] opacity-70">Grade</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center min-w-[80px]">
                <BookOpen className="w-5 h-5 text-indigo-200 mx-auto mb-1" />
                <p className="text-lg font-bold">{report.subjects.length}</p>
                <p className="text-[10px] opacity-70">Subjects</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center min-w-[80px]">
                <TrendingUp className="w-5 h-5 text-emerald-300 mx-auto mb-1" />
                <p className="text-lg font-bold">Top {Math.round((report.rank / report.totalStudents) * 100)}%</p>
                <p className="text-[10px] opacity-70">Rank</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800">Subject scores</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Marks out of 100</p>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={report.subjects} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="repBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="subject"
                    tickFormatter={(v: string) =>
                      v.replace("Mathematics","Math").replace("Social Studies","S.St")
                       .replace("Computer Science","Comp").replace("Science","Sci").replace("Hindi","Hindi")}
                    tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="marks" radius={[6, 6, 0, 0]} fill="url(#repBarGrad)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800">Performance radar</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Subject strengths at a glance</p>
            </div>
            <div className="flex items-center justify-center p-5">
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData} margin={{ top: 4, right: 20, left: 20, bottom: 4 }}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2}
                    dot={{ fill: "#6366f1", r: 3 }} />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Subject table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">Detailed results</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Subject-wise breakdown with teacher remarks</p>
          </div>
          <div className="divide-y divide-slate-50">
            {report.subjects.map((s) => {
              const gc = gradeColor[s.grade] ?? gradeColor["B"];
              const pct = Math.round((s.marks / s.outOf) * 100);
              return (
                <div key={s.subject} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-800">{s.subject}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gc.bg} ${gc.text}`}>
                          {s.grade}
                        </span>
                        <TrendIcon trend={s.trend} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{s.teacher} · "{s.remarks}"</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-indigo-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 shrink-0">{s.marks}/{s.outOf}</span>
                        <span className="text-xs font-bold text-indigo-600 shrink-0">{pct}%</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-200 shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Term comparison */}
        {reports.length > 1 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800">Progress across terms</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Overall percentage comparison</p>
            </div>
            <div className="divide-y divide-slate-50">
              {reports.map((r, i) => (
                <div key={r.term} className={`px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors ${i === selectedTerm ? "bg-indigo-50/50" : ""}`}>
                  <div className="w-16 shrink-0">
                    <p className="text-xs font-semibold text-slate-700">{r.term}</p>
                    <p className="text-[10px] text-slate-400">{r.year}</p>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${r.percentage}%` }} />
                  </div>
                  <span className="text-sm font-bold text-indigo-600 shrink-0 w-12 text-right">{r.percentage}%</span>
                  <span className="text-[11px] text-slate-400 shrink-0">Rank {r.rank}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download CTA */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors">
            <FileText className="w-3.5 h-3.5" /> Download Report Card
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 rounded-xl text-xs font-medium shadow-sm transition-colors">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default Reports;