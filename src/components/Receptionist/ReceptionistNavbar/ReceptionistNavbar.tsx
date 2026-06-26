// src/components/Receptionist/ReceptionistNavbar/ReceptionistNavbar.tsx

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell, FaSearch, FaTimes,
  FaChevronDown, FaSignOutAlt, FaUserCircle,
  FaCog, FaShieldAlt, FaCheckCircle, FaClock,
  FaUserFriends, FaCalendarAlt, FaBoxOpen, FaPhoneAlt, FaChevronRight,
} from "react-icons/fa";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "visitor" | "appointment" | "delivery" | "notice";
};

type Receptionist = {
  name: string;
  role: string;
  email: string;
  initials: string;
};

type ResultCategory = "visitor" | "appointment" | "delivery" | "directory";

type SearchResult = {
  id: number;
  category: ResultCategory;
  title: string;
  subtitle: string;
  meta: string;
  badge?: string;
  badgeColor?: string;
  path: string;
};

interface ReceptionistNavbarProps {
  onMenuToggle?: () => void;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const mockReceptionist: Receptionist = {
  name: "Anita Sharma",
  role: "Front Desk Receptionist",
  email: "anita@edusmart.edu.np",
  initials: "AS",
};

const mockNotifications: Notification[] = [
  { id: 1, title: "New Visitor",       message: "Parent of Student 10B waiting at gate", time: "2 min ago",  read: false, type: "visitor"     },
  { id: 2, title: "Appointment Alert", message: "Principal has a meeting at 2 PM",        time: "1 hr ago",   read: false, type: "appointment" },
  { id: 3, title: "Courier Arrival",   message: "Package delivered at front desk",        time: "3 hrs ago",  read: false, type: "delivery"    },
  { id: 4, title: "Notice from Admin", message: "Office hours updated for Summer",        time: "1 day ago",  read: true,  type: "notice"      },
  { id: 5, title: "Visitor Log",       message: "Visitor record for June 7 finalized",    time: "2 days ago", read: true,  type: "visitor"     },
];

const allSearchData: SearchResult[] = [
  { id: 1,  category: "visitor",     title: "Ram Bahadur Shrestha",   subtitle: "Parent of Suman Shrestha, Class 10B",    meta: "Jun 15 · 10:30 AM",  badge: "Checked In",  badgeColor: "emerald", path: "/reception/visitors"     },
  { id: 2,  category: "visitor",     title: "Sunita Tamang",          subtitle: "Guardian of Priya Tamang, Class 8A",     meta: "Jun 14 · 2:15 PM",   badge: "Checked Out", badgeColor: "slate",   path: "/reception/visitors"     },
  { id: 3,  category: "visitor",     title: "Bikash Adhikari",        subtitle: "Vendor – School Supplies",               meta: "Jun 13 · 11:00 AM",  badge: "Pending",     badgeColor: "amber",   path: "/reception/visitors"     },
  { id: 4,  category: "visitor",     title: "Nirmala Gurung",         subtitle: "Parent of Roshan Gurung, Class 6C",      meta: "Jun 12 · 9:45 AM",   badge: "Checked Out", badgeColor: "slate",   path: "/reception/visitors"     },
  { id: 5,  category: "visitor",     title: "Deepak Karki",           subtitle: "Prospective parent – Admissions",        meta: "Jun 11 · 3:00 PM",   badge: "Checked In",  badgeColor: "emerald", path: "/reception/visitors"     },
  { id: 6,  category: "appointment", title: "Principal Meeting",      subtitle: "Dr. Anup Joshi with Board Members",      meta: "Jun 17 · 2:00 PM",   badge: "Upcoming",    badgeColor: "violet",  path: "/reception/appointments" },
  { id: 7,  category: "appointment", title: "Parent-Teacher Meet",    subtitle: "Class 9A Parents with Mr. Sharma",       meta: "Jun 18 · 10:00 AM",  badge: "Scheduled",   badgeColor: "blue",    path: "/reception/appointments" },
  { id: 8,  category: "appointment", title: "Staff Review",           subtitle: "HR with Non-Teaching Staff",             meta: "Jun 16 · 4:00 PM",   badge: "Completed",   badgeColor: "slate",   path: "/reception/appointments" },
  { id: 9,  category: "appointment", title: "Admissions Counselling", subtitle: "Ms. Poudel with New Students",           meta: "Jun 19 · 9:30 AM",   badge: "Upcoming",    badgeColor: "violet",  path: "/reception/appointments" },
  { id: 10, category: "delivery",    title: "DHL Courier #4829",      subtitle: "Science Lab Equipment – Fragile",        meta: "Jun 15 · 8:20 AM",   badge: "Received",    badgeColor: "emerald", path: "/reception/deliveries"   },
  { id: 11, category: "delivery",    title: "Book Shipment",          subtitle: "Oxford Press · 3 cartons",               meta: "Jun 14 · 1:00 PM",   badge: "Dispatched",  badgeColor: "slate",   path: "/reception/deliveries"   },
  { id: 12, category: "delivery",    title: "Stationery Order",       subtitle: "Office Supplies – 5 boxes",              meta: "Jun 13 · 10:45 AM",  badge: "Pending",     badgeColor: "amber",   path: "/reception/deliveries"   },
  { id: 13, category: "directory",   title: "Dr. Anup Joshi",         subtitle: "Principal · Ext. 101",                   meta: "principal@edusmart.edu.np", badge: "Available", badgeColor: "emerald", path: "/reception/Phone-Directory" },
  { id: 14, category: "directory",   title: "Mr. Rajesh Sharma",      subtitle: "Class Teacher 9A · Ext. 214",            meta: "r.sharma@edusmart.edu.np",  badge: "Busy",      badgeColor: "red",     path: "/reception/Phone-Directory" },
  { id: 15, category: "directory",   title: "Ms. Rina Poudel",        subtitle: "Admissions Officer · Ext. 108",          meta: "admissions@edusmart.edu.np",badge: "Available", badgeColor: "emerald", path: "/reception/Phone-Directory" },
];

const CATEGORY_META: Record<ResultCategory, { label: string; icon: React.ReactNode; color: string; dot: string }> = {
  visitor:     { label: "Visitor",     icon: <FaUserFriends size={11} />, color: "text-emerald-600", dot: "bg-emerald-500" },
  appointment: { label: "Appointment", icon: <FaCalendarAlt size={11} />, color: "text-violet-600",  dot: "bg-violet-500"  },
  delivery:    { label: "Delivery",    icon: <FaBoxOpen size={11} />,     color: "text-amber-600",   dot: "bg-amber-500"   },
  directory:   { label: "Directory",   icon: <FaPhoneAlt size={11} />,    color: "text-blue-600",    dot: "bg-blue-500"    },
};

const BADGE_COLORS: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  slate:   "bg-slate-100 text-slate-500",
  amber:   "bg-amber-100 text-amber-700",
  violet:  "bg-violet-100 text-violet-700",
  blue:    "bg-blue-100 text-blue-700",
  red:     "bg-red-100 text-red-700",
};

const QUICK_LINKS = [
  { label: "Visitor Log",     path: "/reception/visitors",      icon: <FaUserFriends size={12} />, color: "text-emerald-600 bg-emerald-50" },
  { label: "Appointments",    path: "/reception/appointments",  icon: <FaCalendarAlt size={12} />, color: "text-violet-600 bg-violet-50"   },
  { label: "Deliveries",      path: "/reception/deliveries",    icon: <FaBoxOpen size={12} />,     color: "text-amber-600 bg-amber-50"     },
  { label: "Phone Directory", path: "/reception/Phone-Directory", icon: <FaPhoneAlt size={12} />, color: "text-blue-600 bg-blue-50"       },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const notifColor = (type: Notification["type"]) => {
  switch (type) {
    case "visitor":     return "bg-emerald-100 text-emerald-600";
    case "appointment": return "bg-violet-100 text-violet-600";
    case "delivery":    return "bg-amber-100 text-amber-600";
    case "notice":      return "bg-blue-100 text-blue-600";
  }
};

const notifIcon = (type: Notification["type"]) => {
  switch (type) {
    case "visitor":     return "👤";
    case "appointment": return "📅";
    case "delivery":    return "📦";
    case "notice":      return "📢";
  }
};

function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-emerald-100 text-emerald-800 rounded px-0.5 not-italic font-semibold">
            {part}
          </mark>
        ) : part
      )}
    </>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const ReceptionistNavbar = ({ onMenuToggle }: ReceptionistNavbarProps) => {
  const navigate = useNavigate();

  // Search state
  const [searchQuery,    setSearchQuery]    = useState("");
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(["Ram Bahadur", "DHL Courier", "Principal Meeting"]);

  // Other UI state
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileOpen,      setProfileOpen]      = useState(false);
  const [notifOpen,        setNotifOpen]        = useState(false);
  const [loginModalOpen,   setLoginModalOpen]   = useState(false);
  const [isLoggedIn,       setIsLoggedIn]       = useState(true);

  // Login
  const [loginForm,    setLoginForm]    = useState({ email: "", password: "" });
  const [loginError,   setLoginError]   = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Refs
  const searchRef  = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current  && !searchRef.current.contains(e.target as Node))  { setSearchOpen(false); }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Search logic ──────────────────────────────────────────────────────────

  const results = searchQuery.trim()
    ? allSearchData.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.meta.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleResultClick = (result: SearchResult) => {
    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
      setRecentSearches((prev) => [searchQuery.trim(), ...prev].slice(0, 5));
    }
    setSearchOpen(false);
    setSearchQuery("");
    navigate(result.path);
  };

  const handleRecentClick = (term: string) => {
    setSearchQuery(term);
    searchInputRef.current?.focus();
  };

  // ── Auth ──────────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    setLoginError("");
    if (!loginForm.email || !loginForm.password) { setLoginError("Please fill in all fields."); return; }
    setLoginLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    if (loginForm.email === "anita@edusmart.edu.np" && loginForm.password === "reception123") {
      setIsLoggedIn(true);
      setLoginModalOpen(false);
      setLoginForm({ email: "", password: "" });
    } else {
      setLoginError("Invalid email or password.");
    }
    setLoginLoading(false);
  };

  const handleLogout = () => { setIsLoggedIn(false); setProfileOpen(false); setLoginModalOpen(true); };

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOneRead = (id: number) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm px-4 md:px-6 h-16 flex items-center justify-between gap-4 w-full">

        {/* Hamburger */}
        <button
          onClick={onMenuToggle}
          type="button"
          aria-label="Toggle Navigation Menu"
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 flex flex-col gap-1 w-9 h-9 items-center justify-center shrink-0 transition-colors"
        >
          <span className="w-5 h-0.5 bg-slate-600 rounded-full" />
          <span className="w-5 h-0.5 bg-slate-600 rounded-full" />
          <span className="w-5 h-0.5 bg-slate-600 rounded-full" />
        </button>

        {/* ── DESKTOP INLINE SEARCH ── */}
        <div className="hidden lg:block relative flex-1 max-w-md" ref={searchRef}>
          <div
            className={`flex items-center bg-slate-50 border rounded-xl px-4 py-2 transition-all ${
              searchOpen
                ? "bg-white border-emerald-500 ring-4 ring-emerald-500/10 rounded-b-none border-b-transparent"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <FaSearch className={`text-sm shrink-0 transition-colors ${searchOpen ? "text-emerald-500" : "text-slate-400"}`} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search visitors, appointments..."
              className="bg-transparent outline-none ml-3 w-full text-sm text-slate-700 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}
                className="ml-2 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              >
                <FaTimes size={13} />
              </button>
            )}
          </div>

          {/* ── DROPDOWN ── */}
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border border-emerald-500 border-t-slate-100 rounded-b-2xl shadow-2xl shadow-slate-200/80 z-50 overflow-hidden">

              {/* Empty state — show quick links + recent */}
              {!searchQuery.trim() && (
                <div className="p-3 space-y-3">
                  {/* Recent searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5 flex items-center gap-1.5">
                        <FaClock size={9} /> Recent
                      </p>
                      <div className="space-y-0.5">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            onMouseDown={() => handleRecentClick(term)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                          >
                            <FaClock size={11} className="text-slate-300 shrink-0" />
                            <span className="text-sm text-slate-600 flex-1">{term}</span>
                            <FaSearch size={10} className="text-slate-300 group-hover:text-slate-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick links */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">Quick Links</p>
                    <div className="grid grid-cols-2 gap-1">
                      {QUICK_LINKS.map((link) => (
                        <button
                          key={link.path}
                          onMouseDown={() => { setSearchOpen(false); navigate(link.path); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
                        >
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${link.color}`}>
                            {link.icon}
                          </span>
                          <span className="text-xs text-slate-600 font-medium">{link.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              {searchQuery.trim() && results.length > 0 && (
                <div className="max-h-80 overflow-y-auto py-2">
                  {results.map((result) => {
                    const meta = CATEGORY_META[result.category];
                    return (
                      <button
                        key={result.id}
                        onMouseDown={() => handleResultClick(result)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group"
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 ${meta.color}`}>
                          {meta.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {highlight(result.title, searchQuery)}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {highlight(result.subtitle, searchQuery)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {result.badge && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${BADGE_COLORS[result.badgeColor ?? "slate"]}`}>
                              {result.badge}
                            </span>
                          )}
                          <FaChevronRight size={10} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* No results */}
              {searchQuery.trim() && results.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm font-medium text-slate-600">No results for "{searchQuery}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try visitors, appointments, or a name</p>
                </div>
              )}

              {/* Footer */}
              {searchQuery.trim() && results.length > 0 && (
                <div className="border-t border-slate-100 px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{results.length} result{results.length !== 1 ? "s" : ""}</span>
                  <span className="text-[10px] text-slate-400">Press Enter to search all</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile title */}
        <div className="lg:hidden block mr-auto">
          <h1 className="font-bold text-slate-800 text-base md:text-lg truncate">Reception Portal</h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Mobile search button */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
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
                    <FaBell className="text-emerald-600 text-sm" />
                    <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-semibold">{unreadCount} new</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1">
                      <FaCheckCircle size={11} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markOneRead(n.id)}
                      className={`flex gap-3 px-4 py-3 cursor-pointer transition hover:bg-slate-50 ${!n.read ? "bg-emerald-50/40" : ""}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${notifColor(n.type)}`}>
                        {notifIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-semibold truncate ${!n.read ? "text-slate-800" : "text-slate-600"}`}>{n.title}</p>
                          {!n.read && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-slate-100 text-center">
                  <button className="text-xs text-emerald-600 hover:text-emerald-800 font-medium">View all notifications →</button>
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
              {isLoggedIn ? (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shrink-0">
                  {mockReceptionist.initials}
                </div>
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                  <FaUserCircle size={18} />
                </div>
              )}
              <div className="hidden md:block text-left min-w-0">
                <p className="text-sm font-semibold text-slate-800 leading-tight truncate">
                  {isLoggedIn ? mockReceptionist.name : "Guest"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {isLoggedIn ? mockReceptionist.role : "Not logged in"}
                </p>
              </div>
              <FaChevronDown className={`hidden md:block text-xs text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-4 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center font-bold text-base shrink-0">
                          {mockReceptionist.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{mockReceptionist.name}</p>
                          <p className="text-xs opacity-85 truncate">{mockReceptionist.role}</p>
                          <p className="text-xs opacity-60 mt-0.5 truncate">{mockReceptionist.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1.5">
                      <button onClick={() => { navigate("/reception/Profile"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left">
                        <FaUserCircle className="text-slate-400" /> My Profile
                      </button>
                      <button onClick={() => { navigate("/reception/Settings"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left">
                        <FaCog className="text-slate-400" /> Settings
                      </button>
                      <button onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left">
                        <FaShieldAlt className="text-slate-400" /> Change Password
                      </button>
                    </div>
                    <div className="border-t border-slate-100 py-1.5">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left font-medium">
                        <FaSignOutAlt /> Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-2">
                    <div className="px-4 py-4 text-center border-b border-slate-100">
                      <FaUserCircle className="text-4xl text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">You are not logged in</p>
                    </div>
                    <button onClick={() => { setLoginModalOpen(true); setProfileOpen(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 transition font-semibold">
                      Sign In to your account →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MOBILE SEARCH OVERLAY ── */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-white z-50 p-4 lg:hidden flex flex-col">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex-1 flex items-center bg-slate-50 border border-emerald-400 ring-2 ring-emerald-400/20 rounded-xl px-4 py-2.5">
              <FaSearch className="text-emerald-500 shrink-0 text-sm" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search visitors, appointments..."
                className="bg-transparent outline-none ml-3 w-full text-sm text-slate-700"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 ml-2">
                  <FaTimes size={13} />
                </button>
              )}
            </div>
            <button
              onClick={() => { setMobileSearchOpen(false); setSearchQuery(""); }}
              className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <FaTimes size={14} />
            </button>
          </div>

          <div className="mt-4 overflow-y-auto flex-1">
            {/* Mobile results */}
            {searchQuery.trim() && results.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
                {results.map((result) => {
                  const meta = CATEGORY_META[result.category];
                  return (
                    <button
                      key={result.id}
                      onClick={() => { handleResultClick(result); setMobileSearchOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-3 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all text-left"
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 ${meta.color}`}>
                        {meta.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{highlight(result.title, searchQuery)}</p>
                        <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
                      </div>
                      {result.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${BADGE_COLORS[result.badgeColor ?? "slate"]}`}>
                          {result.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {searchQuery.trim() && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-3xl mb-3">🔍</p>
                <p className="text-sm font-medium text-slate-600">No results for "{searchQuery}"</p>
                <p className="text-xs text-slate-400 mt-1">Try a name, appointment, or delivery</p>
              </div>
            )}

            {!searchQuery.trim() && (
              <>
                {recentSearches.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FaClock size={9} /> Recent
                    </p>
                    {recentSearches.map((term) => (
                      <button key={term} onClick={() => setSearchQuery(term)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors">
                        <FaClock size={11} className="text-slate-300" />
                        <span className="text-sm text-slate-600">{term}</span>
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Links</p>
                <div className="space-y-1">
                  {QUICK_LINKS.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => { navigate(link.path); setMobileSearchOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition text-left"
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${link.color}`}>{link.icon}</span>
                      <span className="text-sm text-slate-700 font-medium">{link.label}</span>
                      <FaChevronRight size={11} className="text-slate-300 ml-auto" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── SIGN-IN MODAL ── */}
      {loginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-6 py-6 text-white text-center relative">
              <button onClick={() => setLoginModalOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                <FaTimes size={12} />
              </button>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2 text-lg font-bold">AS</div>
              <h2 className="text-base sm:text-lg font-bold">Welcome Back</h2>
              <p className="text-[11px] opacity-75 mt-0.5">Sign in to EduSmart Reception Portal</p>
            </div>
            <div className="px-6 py-5 space-y-3.5">
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">{loginError}</div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address</label>
                <input type="email" placeholder="anita@edusmart.edu.np" value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Password</label>
                <input type="password" placeholder="••••••••" value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
              </div>
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input type="checkbox" className="rounded text-emerald-600" /> Remember me
                </label>
                <button className="text-emerald-600 hover:underline bg-transparent border-none p-0 cursor-pointer">Forgot password?</button>
              </div>
              <button onClick={handleLogin} disabled={loginLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-2 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10">
                {loginLoading ? "Signing in..." : "Sign In"}
              </button>
              <p className="text-center text-[10px] text-slate-400">Demo: anita@edusmart.edu.np / reception123</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReceptionistNavbar;