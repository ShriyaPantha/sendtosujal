// src/pages/Dashboard/ParentDashboard/Assignments.tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type AssignmentStatus = "pending" | "in-progress" | "submitted";

interface Assignment {
  id: number;
  title: string;
  subject: string;
  due: string;
  status: AssignmentStatus;
  description: string;
  marks?: number;
  outOf?: number;
  teacher: string;
  priority: "high" | "medium" | "low";
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const assignments: Assignment[] = [
  {
    id: 1,
    title: "Chapter 7 – Fractions Worksheet",
    subject: "Mathematics",
    due: "Jun 12, 2026",
    status: "pending",
    description: "Complete exercises 1–20 on addition and subtraction of fractions from the worksheet provided.",
    teacher: "Mrs. Sharma",
    priority: "high",
  },
  {
    id: 2,
    title: "Plant Cell Diagram",
    subject: "Science",
    due: "Jun 14, 2026",
    status: "in-progress",
    description: "Draw and label all parts of a plant cell. Include the cell wall, nucleus, chloroplast, and vacuole.",
    teacher: "Mr. Patel",
    priority: "medium",
  },
  {
    id: 3,
    title: "Essay – My Favourite Season",
    subject: "English",
    due: "Jun 11, 2026",
    status: "submitted",
    description: "Write a 200-word essay about your favourite season, using descriptive language.",
    marks: 18,
    outOf: 20,
    teacher: "Ms. Gupta",
    priority: "low",
  },
  {
    id: 4,
    title: "Map Work – Indian States",
    subject: "Social Studies",
    due: "Jun 18, 2026",
    status: "pending",
    description: "Mark and label all 28 Indian states on the provided outline map.",
    teacher: "Mr. Verma",
    priority: "medium",
  },
  {
    id: 5,
    title: "Python Quiz – Loops",
    subject: "Computer Science",
    due: "Jun 16, 2026",
    status: "submitted",
    description: "Complete the online quiz on for loops and while loops in Python on the school portal.",
    marks: 20,
    outOf: 20,
    teacher: "Mr. Singh",
    priority: "low",
  },
  {
    id: 6,
    title: "Poem Recitation Prep",
    subject: "English",
    due: "Jun 20, 2026",
    status: "in-progress",
    description: "Learn and practise reciting 'The Road Not Taken' by Robert Frost for the class presentation.",
    teacher: "Ms. Gupta",
    priority: "medium",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

const statusConfig: Record<AssignmentStatus, { label: string; bg: string; text: string; border: string }> = {
  pending:     { label: "Pending",     bg: "bg-rose-50",   text: "text-rose-600",   border: "border-rose-100"   },
  "in-progress": { label: "In Progress", bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-100"  },
  submitted:   { label: "Submitted",   bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
};

const priorityDot: Record<string, string> = {
  high:   "bg-rose-400",
  medium: "bg-amber-400",
  low:    "bg-slate-300",
};

const subjectColor: Record<string, { bg: string; text: string }> = {
  Mathematics:       { bg: "bg-indigo-50",  text: "text-indigo-600"  },
  Science:           { bg: "bg-emerald-50", text: "text-emerald-600" },
  English:           { bg: "bg-violet-50",  text: "text-violet-600"  },
  "Social Studies":  { bg: "bg-amber-50",   text: "text-amber-600"   },
  "Computer Science":{ bg: "bg-blue-50",    text: "text-blue-600"    },
};

const AssignmentCard = ({ a }: { a: Assignment }) => {
  const sc  = statusConfig[a.status];
  const sub = subjectColor[a.subject] ?? { bg: "bg-slate-50", text: "text-slate-600" };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-slate-200 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${priorityDot[a.priority]}`} />
          <p className="text-sm font-semibold text-slate-800 leading-snug">{a.title}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
          {sc.label}
        </span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{a.description}</p>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sub.bg} ${sub.text}`}>{a.subject}</span>
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="w-3 h-3" /> Due {a.due}
        </span>
        <span className="text-[11px] text-slate-400">· {a.teacher}</span>
      </div>
      {a.status === "submitted" && a.marks != null && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs font-semibold text-slate-700">Score: {a.marks}/{a.outOf}</span>
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(a.marks! / a.outOf!) * 100}%` }} />
          </div>
          <span className="text-xs font-bold text-emerald-600">{Math.round((a.marks! / a.outOf!) * 100)}%</span>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const Assignments = () => {
  const navigate = useNavigate();

  const pending    = assignments.filter((a) => a.status === "pending");
  const inProgress = assignments.filter((a) => a.status === "in-progress");
  const submitted  = assignments.filter((a) => a.status === "submitted");

  const summaryStats = [
    { label: "Pending",     count: pending.length,    color: "text-rose-600",    bg: "bg-rose-50",    icon: AlertCircle  },
    { label: "In Progress", count: inProgress.length, color: "text-amber-600",   bg: "bg-amber-50",   icon: Clock        },
    { label: "Submitted",   count: submitted.length,  color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
    { label: "Total",       count: assignments.length, color: "text-indigo-600",  bg: "bg-indigo-50",  icon: BookOpen     },
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
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Assignments</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Aryan Sharma · Grade 5 – Section A</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryStats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-[11px] text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Due soon alert */}
        {pending.some((a) => a.priority === "high") && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-rose-700">Action required</p>
              <p className="text-[11px] text-rose-500 mt-0.5">
                {pending.filter((a) => a.priority === "high").length} high-priority assignment(s) are pending and due soon.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-400" />
          </div>
        )}

        {/* Sections */}
        {[
          { title: "Pending",     sub: "Need to be completed",     items: pending,    emptyMsg: "No pending assignments." },
          { title: "In Progress", sub: "Currently being worked on", items: inProgress, emptyMsg: "Nothing in progress."     },
          { title: "Submitted",   sub: "Completed & handed in",    items: submitted,  emptyMsg: "Nothing submitted yet."   },
        ].map((section) => (
          <div key={section.title}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{section.title}</p>
                <p className="text-[11px] text-slate-400">{section.sub}</p>
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {section.items.length}
              </span>
            </div>
            {section.items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
                <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">{section.emptyMsg}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {section.items.map((a) => <AssignmentCard key={a.id} a={a} />)}
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  );
};

export default Assignments;