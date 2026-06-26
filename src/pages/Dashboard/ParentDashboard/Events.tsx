// src/pages/Dashboard/ParentDashboard/Events.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, Users, Award, TrendingUp,
  Clock, MapPin, ChevronRight, CalendarDays,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type EventType = "meeting" | "holiday" | "event" | "exam" | "activity";

interface SchoolEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  type: EventType;
  location: string;
  description: string;
  month: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const events: SchoolEvent[] = [
  {
    id: 1,
    title: "Parent-Teacher Meeting",
    date: "Jun 22, 2026",
    time: "9:00 AM – 1:00 PM",
    type: "meeting",
    location: "School Auditorium",
    description: "Discuss student progress with class teachers. Book your 10-minute slot via the portal.",
    month: "June",
  },
  {
    id: 2,
    title: "Annual Sports Day",
    date: "Jun 25, 2026",
    time: "8:00 AM – 3:00 PM",
    type: "event",
    location: "School Grounds",
    description: "Track & field events, team sports, and prize distribution. White sports uniform required.",
    month: "June",
  },
  {
    id: 3,
    title: "Unit Tests – Maths & Science",
    date: "Jun 17–18, 2026",
    time: "9:00 AM – 11:00 AM",
    type: "exam",
    location: "Respective Classrooms",
    description: "Mathematics on Jun 17, Science on Jun 18. Chapters 5–8 and 3–6 respectively.",
    month: "June",
  },
  {
    id: 4,
    title: "School Foundation Day Holiday",
    date: "Jun 19, 2026",
    time: "All day",
    type: "holiday",
    location: "—",
    description: "School remains closed. No online classes.",
    month: "June",
  },
  {
    id: 5,
    title: "Science Fair",
    date: "Jul 10–12, 2026",
    time: "10:00 AM – 4:00 PM",
    type: "activity",
    location: "Science Block",
    description: "Annual science fair open to Grade 4–8. Individual or pair entries welcome.",
    month: "July",
  },
  {
    id: 6,
    title: "Independence Day Celebration",
    date: "Aug 15, 2026",
    time: "8:00 AM",
    type: "event",
    location: "School Grounds",
    description: "Flag hoisting ceremony followed by cultural performances. All students must attend.",
    month: "August",
  },
  {
    id: 7,
    title: "Term 2 Exams Begin",
    date: "Jul 25, 2026",
    time: "9:00 AM – 12:00 PM",
    type: "exam",
    location: "Examination Hall",
    description: "Term 2 final examinations across all subjects. Timetable to be shared separately.",
    month: "July",
  },
  {
    id: 8,
    title: "Art & Craft Exhibition",
    date: "Jul 5, 2026",
    time: "11:00 AM – 2:00 PM",
    type: "activity",
    location: "School Gallery",
    description: "Students showcase creative projects. Parents invited to attend.",
    month: "July",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

const typeConfig: Record<EventType, { bg: string; text: string; border: string; icon: React.FC<any> }> = {
  meeting:  { bg: "bg-indigo-50",  text: "text-indigo-500",  border: "border-indigo-100",  icon: Users       },
  holiday:  { bg: "bg-emerald-50", text: "text-emerald-500", border: "border-emerald-100", icon: TrendingUp  },
  event:    { bg: "bg-violet-50",  text: "text-violet-500",  border: "border-violet-100",  icon: Award       },
  exam:     { bg: "bg-rose-50",    text: "text-rose-500",    border: "border-rose-100",    icon: Calendar    },
  activity: { bg: "bg-amber-50",   text: "text-amber-500",   border: "border-amber-100",   icon: CalendarDays },
};

const typeLabel: Record<EventType, string> = {
  meeting: "Meeting", holiday: "Holiday", event: "Event", exam: "Exam", activity: "Activity",
};

const EventCard = ({ e }: { e: SchoolEvent }) => {
  const cfg = typeConfig[e.type];
  const Icon = cfg.icon;
  return (
    <div className={`bg-white rounded-2xl border ${cfg.border} shadow-sm p-5 hover:shadow-md transition-all`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
          <Icon className={`w-5 h-5 ${cfg.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800 leading-snug">{e.title}</p>
            <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
              {typeLabel[e.type]}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5">{e.description}</p>
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <CalendarDays className="w-3 h-3" /> {e.date}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="w-3 h-3" /> {e.time}
            </span>
            {e.location !== "—" && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="w-3 h-3" /> {e.location}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-200 shrink-0 mt-1" />
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const Events = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | EventType>("all");

  const months = [...new Set(events.map((e) => e.month))];

  const visible = events.filter((e) => filter === "all" || e.type === filter);

  const grouped = months.reduce<Record<string, SchoolEvent[]>>((acc, m) => {
    acc[m] = visible.filter((e) => e.month === m);
    return acc;
  }, {});

  const filterOptions: Array<{ key: "all" | EventType; label: string }> = [
    { key: "all",      label: "All"        },
    { key: "exam",     label: "Exams"      },
    { key: "event",    label: "Events"     },
    { key: "meeting",  label: "Meetings"   },
    { key: "holiday",  label: "Holidays"   },
    { key: "activity", label: "Activities" },
  ];

  const upcomingCount = visible.filter((e) => {
    // All events in our mock are upcoming
    return true;
  }).length;

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">School Calendar</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">{upcomingCount} upcoming events</p>
          </div>
        </div>

        {/* Quick counts */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(["exam", "event", "meeting", "holiday", "activity"] as EventType[]).map((t) => {
            const cfg = typeConfig[t];
            const Icon = cfg.icon;
            const count = events.filter((e) => e.type === t).length;
            return (
              <div key={t} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`w-4 h-4 ${cfg.text}`} />
                </div>
                <p className={`text-lg font-bold ${cfg.text}`}>{count}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{typeLabel[t]}s</p>
              </div>
            );
          })}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map((f) => (
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

        {/* Events by month */}
        {months.map((month) => {
          const monthEvents = grouped[month];
          if (!monthEvents?.length) return null;
          return (
            <div key={month}>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">{month}</p>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[11px] text-slate-400">{monthEvents.length} events</span>
              </div>
              <div className="space-y-3">
                {monthEvents.map((e) => <EventCard key={e.id} e={e} />)}
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <CalendarDays className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">No events for this filter</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Events;