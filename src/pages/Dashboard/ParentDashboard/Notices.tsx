// src/pages/Dashboard/ParentDashboard/Notices.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, AlertCircle, Clock, Tag, ChevronDown, ChevronUp, Search } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type NoticeCategory = "general" | "exam" | "event" | "fee" | "urgent";

interface Notice {
  id: number;
  title: string;
  body: string;
  date: string;
  category: NoticeCategory;
  important: boolean;
  read: boolean;
  from: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const allNotices: Notice[] = [
  {
    id: 1,
    title: "Annual Sports Day – June 25, 2026",
    body: "We are pleased to announce that the Annual Sports Day will be held on June 25, 2026. All students are requested to participate. Parents are cordially invited to attend. Students must come in white sports uniform. Refreshments will be provided.",
    date: "Jun 10, 2026",
    category: "event",
    important: true,
    read: false,
    from: "Principal's Office",
  },
  {
    id: 2,
    title: "Fee Reminder – Last date June 20",
    body: "This is a gentle reminder that the last date to pay Term 2 fees is June 20, 2026. A late fine of ₹100/day will be charged after the due date. Please log in to the parent portal to pay online or visit the school accounts department.",
    date: "Jun 9, 2026",
    category: "fee",
    important: true,
    read: false,
    from: "Accounts Department",
  },
  {
    id: 3,
    title: "Unit Test Schedule – Mathematics & Science",
    body: "Unit tests for Mathematics and Science will be conducted on June 17 and June 18 respectively. The syllabus covers chapters 5–8 for Mathematics and chapters 3–6 for Science. Students are advised to revise all exercises and practise problems.",
    date: "Jun 8, 2026",
    category: "exam",
    important: false,
    read: false,
    from: "Academic Department",
  },
  {
    id: 4,
    title: "Parent-Teacher Meeting – June 22",
    body: "A Parent-Teacher Meeting is scheduled for June 22, 2026 from 9:00 AM to 1:00 PM. Parents are requested to confirm their slot via the parent portal by June 18. Each meeting will be approximately 10 minutes long.",
    date: "Jun 7, 2026",
    category: "general",
    important: false,
    read: true,
    from: "Class Teacher",
  },
  {
    id: 5,
    title: "Holiday Notice – June 19 (School Foundation Day)",
    body: "The school will remain closed on June 19, 2026 on account of School Foundation Day. Online classes will not be held on this day. Regular classes will resume on June 20, 2026.",
    date: "Jun 6, 2026",
    category: "general",
    important: false,
    read: true,
    from: "Principal's Office",
  },
  {
    id: 6,
    title: "Science Fair Registrations Open",
    body: "Registrations for the Annual Science Fair (July 10–12) are now open. Students from Grade 4–8 may participate individually or in pairs. Registration forms are available at the school office. Last date for submission is June 28.",
    date: "Jun 5, 2026",
    category: "event",
    important: false,
    read: true,
    from: "Science Department",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

const categoryConfig: Record<NoticeCategory, { label: string; bg: string; text: string }> = {
  general: { label: "General",  bg: "bg-blue-50",    text: "text-blue-600"    },
  exam:    { label: "Exam",     bg: "bg-violet-50",  text: "text-violet-600"  },
  event:   { label: "Event",    bg: "bg-emerald-50", text: "text-emerald-600" },
  fee:     { label: "Fee",      bg: "bg-amber-50",   text: "text-amber-600"   },
  urgent:  { label: "Urgent",   bg: "bg-rose-50",    text: "text-rose-600"    },
};

const NoticeCard = ({ n }: { n: Notice }) => {
  const [expanded, setExpanded] = useState(false);
  const cat = categoryConfig[n.category];

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${n.important ? "border-rose-100" : "border-slate-100"} ${!n.read ? "ring-1 ring-indigo-100" : ""}`}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.important ? "bg-rose-50" : "bg-blue-50"}`}>
            {n.important
              ? <AlertCircle className="w-4 h-4 text-rose-500" />
              : <Bell className="w-4 h-4 text-blue-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-slate-800 leading-snug">{n.title}</p>
                {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
              </div>
              {n.important && (
                <span className="shrink-0 text-[9px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-bold uppercase">Urgent</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
                <Tag className="w-2.5 h-2.5 inline-block mr-0.5 -mt-px" />{cat.label}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" />{n.date}
              </span>
              <span className="text-[11px] text-slate-400">· {n.from}</span>
            </div>
            <p className={`text-[11px] text-slate-500 mt-2 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
              {n.body}
            </p>
            <button onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-700 font-medium mt-1.5 transition-colors">
              {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const Notices = () => {
  const navigate  = useNavigate();
  const [filter, setFilter]   = useState<"all" | NoticeCategory>("all");
  const [search,  setSearch]  = useState("");

  const unread = allNotices.filter((n) => !n.read).length;

  const visible = allNotices.filter((n) => {
    const matchCat    = filter === "all" || n.category === filter;
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                        n.body.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const filters: Array<{ key: "all" | NoticeCategory; label: string }> = [
    { key: "all",     label: "All"     },
    { key: "urgent",  label: "Urgent"  },
    { key: "exam",    label: "Exams"   },
    { key: "event",   label: "Events"  },
    { key: "fee",     label: "Fees"    },
    { key: "general", label: "General" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">School Notices</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">{unread} unread · {allNotices.length} total</p>
          </div>
          {unread > 0 && (
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
              {unread}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notices…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-300 shadow-sm"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                filter === f.key
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Notice list */}
        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">No notices found</p>
            <p className="text-[11px] text-slate-300 mt-1">Try a different filter or search term</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((n) => <NoticeCard key={n.id} n={n} />)}
          </div>
        )}

      </div>
    </div>
  );
};

export default Notices;