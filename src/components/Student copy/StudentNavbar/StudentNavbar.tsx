// src/components/Student/StudentNavbar/StudentNavbar.tsx

import { useState, useRef, useEffect, useMemo, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell, FaSearch, FaTimes, FaChevronDown,
  FaSignOutAlt, FaUserCircle, FaCog, FaCheckCircle,
  FaBookOpen, FaClipboardList, FaFileAlt, FaCalendarAlt,
} from "react-icons/fa";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "assignment" | "result" | "notice" | "attendance";
};

type SearchResult = {
  id: string;
  category: "subject" | "assignment" | "exam" | "schedule";
  title: string;
  subtitle: string;
  path: string;
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const mockStudent = {
  name: "Aarav Gurung",
  role: "Grade 10B · Roll No. 12",
  email: "aarav@edusmart.edu.np",
  initials: "AG",
};

const mockNotifications: Notification[] = [
  { id: 1, title: "Assignment Due Tomorrow",  message: "DBMS Assignment 3 is due June 19",       time: "1 hr ago",  read: false, type: "assignment" },
  { id: 2, title: "Result Published",         message: "Mid-term results are now available",      time: "3 hrs ago", read: false, type: "result"     },
  { id: 3, title: "Attendance Warning",       message: "Your attendance dropped below 80%",       time: "1 day ago", read: false, type: "attendance" },
  { id: 4, title: "Notice from Principal",    message: "School closed on June 20 (holiday)",      time: "2 days ago",read: true,  type: "notice"     },
];

const allSearchData: SearchResult[] = [
  { id: "SUB-1", category: "subject",    title: "Computer Science",       subtitle: "Mr. Roshan · Room 204",      path: "/student/subjects/1"    },
  { id: "SUB-2", category: "subject",    title: "Mathematics",            subtitle: "Mrs. Pande · Room 101",      path: "/student/subjects/2"    },
  { id: "SUB-3", category: "subject",    title: "English",                subtitle: "Ms. Thapa · Room 108",       path: "/student/subjects/3"    },
  { id: "ASG-1", category: "assignment", title: "DBMS Assignment 3",      subtitle: "Due Jun 19 · CS",            path: "/student/assignments/1" },
  { id: "ASG-2", category: "assignment", title: "Algebra Problem Set",    subtitle: "Due Jun 22 · Math",          path: "/student/assignments/2" },
  { id: "EXM-1", category: "exam",       title: "Final Exam — CS",        subtitle: "Jun 20 · Room 204",          path: "/student/exams/1"       },
  { id: "EXM-2", category: "exam",       title: "Math Final",             subtitle: "Jun 23 · Room 101",          path: "/student/exams/2"       },
  { id: "SCH-1", category: "schedule",   title: "Monday Timetable",       subtitle: "CS · Math · English",        path: "/student/schedule"      },
];

const CATEGORY_ORDER: SearchResult["category"][] = ["subject", "assignment", "exam", "schedule"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const notifMeta: Record<Notification["type"], { icon: string; color: string }> = {
  assignment: { icon: "📋", color: "bg-violet-100 text-violet-600" },
  result:     { icon: "📊", color: "bg-emerald-100 text-emerald-600" },
  attendance: { icon: "✅", color: "bg-red-100 text-red-600" },
  notice:     { icon: "📢", color: "bg-blue-100 text-blue-600" },
};

const catMeta: Record<SearchResult["category"], { icon: JSX.Element; label: string; badge: string }> = {
  subject:    { icon: <FaBookOpen size={11} />,     label: "Subjects",    badge: "bg-violet-50 text-violet-700 border border-violet-100"  },
  assignment: { icon: <FaClipboardList size={11} />,label: "Assignments", badge: "bg-emerald-50 text-emerald-700 border border-emerald-100"},
  exam:       { icon: <FaFileAlt size={11} />,      label: "Exams",       badge: "bg-amber-50 text-amber-700 border border-amber-100"     },
  schedule:   { icon: <FaCalendarAlt size={11} />,  label: "Schedule",    badge: "bg-blue-50 text-blue-700 border border-blue-100"        },
};

const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-violet-100 text-violet-700 rounded font-semibold px-0.5 not-italic">
        {text.slice(i, i + query.trim().length)}
      </mark>
      {text.slice(i + query.trim().length)}
    </>
  );
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface StudentNavbarProps {
  onMenuToggle?: () => void;
}

const StudentNavbar = ({ onMenuToggle }: StudentNavbarProps) => {
  const navigate = useNavigate();

  const [query, setQuery]               = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const searchRef  = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef   = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Click-outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
      if (!notifRef.current?.contains(e.target as Node))   setNotifOpen(false);
      if (!searchRef.current?.contains(e.target as Node))  setSearchFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allSearchData.filter(
      (r) => r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map: Partial<Record<SearchResult["category"], SearchResult[]>> = {};
    results.forEach((r) => { (map[r.category] ??= []).push(r); });
    return map;
  }, [results]);

  const showDropdown = searchFocused && query.trim().length > 0;

  const handleResult = (path: string) => {
    navigate(path);
    setQuery("");
    setSearchFocused(false);
    setMobileSearch(false);
  };

  const markAllRead  = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const markOneRead  = (id: number) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));

  // ── SEARCH DROPDOWN (shared between desktop + mobile) ─────────────────────
  const SearchResults = () =>
    results.length === 0 ? (
      <div className="px-5 py-8 text-center">
        <p className="text-2xl mb-2">🔍</p>
        <p className="text-sm font-semibold text-slate-700">No results for "{query}"</p>
        <p className="text-xs text-slate-400 mt-1">Try a subject, assignment, or exam</p>
      </div>
    ) : (
      <>
        <div className="px-4 pt-3 pb-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="max-h-[360p] overflow-y-auto pb-2">
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat];
            if (!items?.length) return null;
            const { icon, label, badge } = catMeta[cat];
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 px-4 py-1.5 mt-1">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}>
                    {icon} {label}
                  </span>
                  <span className="flex-1 h-px bg-slate-100" />
                </div>
                {items.map((item) => (
                  <button
                    key={item.id}
                    onMouseDown={() => handleResult(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${badge}`}>{icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-violet-700 transition-colors">
                        <Highlight text={item.title} query={query} />
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        <Highlight text={item.subtitle} query={query} />
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
        <div className="border-t border-slate-100 px-4 py-2 flex justify-between bg-slate-50/60">
          <span className="text-[10px] text-slate-400">Click to navigate</span>
          <span className="text-[10px] text-slate-400">Esc to close</span>
        </div>
      </>
    );

  return (
    <>
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm px-4 md:px-6 h-16 flex items-center justify-between gap-4 w-full">

        {/* Hamburger */}
        <button
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 flex flex-col gap-1 w-9 h-9 items-center justify-center shrink-0"
        >
          {[0,1,2].map((i) => <span key={i} className="w-5 h-0.5 bg-slate-600 rounded-full" />)}
        </button>

        {/* Desktop Search */}
        <div className="hidden lg:block relative flex-1 max-w-md" ref={searchRef}>
          <div className={`flex items-center bg-slate-50 border rounded-xl px-4 py-2 transition-all ${searchFocused ? "bg-white border-sky-500 ring-4 ring-sky-500/10" : "border-slate-200"}`}>
            <FaSearch className="text-slate-400 text-sm shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(e) => e.key === "Escape" && setSearchFocused(false)}
              placeholder="Search subjects, assignments, exams..."
              className="bg-transparent outline-none ml-3 w-full text-sm text-slate-700 placeholder:text-slate-400"
            />
            {query && (
              <button onMouseDown={(e) => { e.preventDefault(); setQuery(""); }} className="ml-2 text-slate-400 hover:text-slate-600">
                <FaTimes size={12} />
              </button>
            )}
          </div>
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
              <SearchResults />
            </div>
          )}
        </div>

        {/* Mobile brand */}
        <div className="lg:hidden mr-auto">
          <h1 className="font-bold text-slate-800 text-base truncate">Student Portal</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Mobile search trigger */}
          <button onClick={() => setMobileSearch(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600">
            <FaSearch size={16} />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
              className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <FaBell className="text-base sm:text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <FaBell className="text-sky-600 text-sm" />
                    <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full font-semibold">{unreadCount} new</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-sky-600 hover:text-sky-800 font-medium flex items-center gap-1">
                      <FaCheckCircle size={11} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markOneRead(n.id)}
                      className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition ${!n.read ? "bg-sky-50/40" : ""}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${notifMeta[n.type].color}`}>
                        {notifMeta[n.type].icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-semibold truncate ${!n.read ? "text-slate-800" : "text-slate-600"}`}>{n.title}</p>
                          {!n.read && <span className="w-2 h-2 bg-sky-500 rounded-full shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-slate-100 text-center">
                  <button className="text-xs text-sky-600 hover:text-sky-800 font-medium">View all notifications →</button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-200" />

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
              className="flex items-center gap-2 hover:bg-slate-100 rounded-xl px-1.5 sm:px-2 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shrink-0">
                {mockStudent.initials}
              </div>
              <div className="hidden md:block text-left min-w-0">
                <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{mockStudent.name}</p>
                <p className="text-xs text-slate-500 truncate">{mockStudent.role}</p>
              </div>
              <FaChevronDown className={`hidden md:block text-xs text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                <div className="px-4 py-4 bg-gradient-to-br from-sky-500 to-indigo-500 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm shrink-0">
                      {mockStudent.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{mockStudent.name}</p>
                      <p className="text-xs opacity-80 truncate">{mockStudent.role}</p>
                      <p className="text-xs opacity-60 mt-0.5 truncate">{mockStudent.email}</p>
                    </div>
                  </div>
                </div>

                <div className="py-1.5">
                  {[
                    { icon: <FaUserCircle className="text-slate-400" />, label: "My Profile",  path: "/student/profile"  },
                    { icon: <FaCog className="text-slate-400" />,        label: "Settings",     path: "/student/settings" },
                  ].map(({ icon, label, path }) => (
                    <button
                      key={label}
                      onClick={() => { navigate(path); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left"
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 py-1.5">
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left font-medium"
                  >
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MOBILE SEARCH OVERLAY ─────────────────────────────────────────── */}
      {mobileSearch && (
        <div className="fixed inset-0 bg-white z-50 p-4 lg:hidden flex flex-col">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 gap-3">
              <FaSearch className="text-slate-400 shrink-0 text-sm" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search subjects, assignments, exams..."
                className="bg-transparent outline-none w-full text-sm text-slate-700"
              />
              {query && <button onClick={() => setQuery("")}><FaTimes size={12} className="text-slate-400" /></button>}
            </div>
            <button onClick={() => setMobileSearch(false)} className="p-3 bg-slate-100 rounded-xl text-slate-600">
              <FaTimes size={14} />
            </button>
          </div>

          <div className="mt-4 overflow-y-auto flex-1">
            {query.trim() === "" ? (
              <>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Links</h3>
                <div className="space-y-1">
                  {[
                    { label: "My Assignments", path: "/student/assignments" },
                    { label: "Exam Schedule",  path: "/student/exams"       },
                    { label: "Attendance",     path: "/student/attendance"  },
                    { label: "Results",        path: "/student/results"     },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { navigate(item.path); setMobileSearch(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition text-left"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                      <span className="text-sm text-slate-700 font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <SearchResults />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StudentNavbar;