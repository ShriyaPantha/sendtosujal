import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell, FaSearch, FaTimes,
  FaChevronDown, FaSignOutAlt, FaUserCircle,
  FaCog, FaShieldAlt, FaCheckCircle,
  FaUserGraduate, FaChalkboardTeacher, FaBuilding, FaMoneyBillWave,
  FaEye, FaEyeSlash,
} from "react-icons/fa";
import axiosInstance from "../../../api/axiosInstance"; // adjust path as needed

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "fee" | "attendance" | "notice" | "exam";
};

type AdminUser = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  schoolId?: { name: string; email: string };
  isActive?: boolean;
};

type SearchResult = {
  id: string;
  category: "student" | "teacher" | "department" | "fee";
  title: string;
  subtitle: string;
  meta: string;
  path: string;
};

interface AdminNavbarProps {
  onMenuToggle?: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const mockNotifications: Notification[] = [
  { id: 1, title: "Fee Payment Received",    message: "Aarav Gurung paid Rs. 15,000 tuition fee",    time: "5 min ago",  read: false, type: "fee"        },
  { id: 2, title: "Low Attendance Alert",    message: "Grade 9A attendance dropped below 75% today", time: "1 hr ago",   read: false, type: "attendance" },
  { id: 3, title: "Exam Schedule Published", message: "Final exams scheduled for June 20–30",        time: "3 hrs ago",  read: false, type: "exam"       },
  { id: 4, title: "Notice from Principal",   message: "Staff meeting on June 8 at 11 AM",            time: "1 day ago",  read: true,  type: "notice"     },
  { id: 5, title: "Fee Overdue",             message: "12 students have overdue fee payments",       time: "2 days ago", read: true,  type: "fee"        },
];

const allSearchData: SearchResult[] = [
  { id: "STU-1001", category: "student",    title: "Aarav Gurung",          subtitle: "Grade 10B · Roll No. 12",     meta: "ID: 1001 · Active",         path: "/admin/student/1001"     },
  { id: "STU-1002", category: "student",    title: "Sneha Maharjan",        subtitle: "Grade 10B · Roll No. 7",      meta: "ID: 1002 · Active",         path: "/admin/student/1002"     },
  { id: "STU-1003", category: "student",    title: "Bibek Lama",            subtitle: "Grade 9A · Roll No. 21",      meta: "ID: 1003 · Active",         path: "/admin/student/1003"     },
  { id: "STU-1004", category: "student",    title: "Kriti Adhikari",        subtitle: "Grade 9A · Roll No. 3",       meta: "ID: 1004 · Low Attendance", path: "/admin/student/1004"     },
  { id: "TCH-2001", category: "teacher",    title: "Roshan Shrestha",       subtitle: "Computer Science · Room 204", meta: "ID: 2001 · Active",         path: "/admin/teacher/2001"     },
  { id: "TCH-2002", category: "teacher",    title: "Sita Karki",            subtitle: "Mathematics · Room 110",      meta: "ID: 2002 · Active",         path: "/admin/teacher/2002"     },
  { id: "TCH-2003", category: "teacher",    title: "Ram Adhikari",          subtitle: "Physics · Room 301",          meta: "ID: 2003 · Active",         path: "/admin/teacher/2003"     },
  { id: "DEP-3001", category: "department", title: "Computer Science Dept", subtitle: "3 teachers · 84 students",    meta: "DEP: 3001",                 path: "/admin/department/3001"  },
  { id: "DEP-3002", category: "department", title: "Mathematics Dept",      subtitle: "5 teachers · 120 students",   meta: "DEP: 3002",                 path: "/admin/department/3002"  },
  { id: "FEE-4001", category: "fee",        title: "Aarav Gurung — Fee",    subtitle: "Rs. 15,000 · Paid · Jun 10",  meta: "FEE: 4001",                 path: "/admin/fee-payment/4001" },
  { id: "FEE-4002", category: "fee",        title: "Kriti Adhikari — Fee",  subtitle: "Rs. 15,000 · Overdue",        meta: "FEE: 4002 · Overdue",       path: "/admin/fee-payment/4002" },
];

const CATEGORY_ORDER: SearchResult["category"][] = ["student", "teacher", "department", "fee"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const notifColor = (type: Notification["type"]) => {
  switch (type) {
    case "fee":        return "bg-emerald-100 text-emerald-600";
    case "attendance": return "bg-red-100 text-red-600";
    case "exam":       return "bg-amber-100 text-amber-600";
    case "notice":     return "bg-blue-100 text-blue-600";
  }
};

const notifIcon = (type: Notification["type"]) => {
  switch (type) {
    case "fee":        return "💰";
    case "attendance": return "✅";
    case "exam":       return "📝";
    case "notice":     return "📢";
  }
};

const catIcon = (cat: SearchResult["category"]) => {
  switch (cat) {
    case "student":    return <FaUserGraduate     size={11} />;
    case "teacher":    return <FaChalkboardTeacher size={11} />;
    case "department": return <FaBuilding          size={11} />;
    case "fee":        return <FaMoneyBillWave     size={11} />;
  }
};

const catLabel = (cat: SearchResult["category"]) => {
  switch (cat) {
    case "student":    return "Students";
    case "teacher":    return "Teachers";
    case "department": return "Departments";
    case "fee":        return "Fee Payments";
  }
};

const catBadge = (cat: SearchResult["category"]) => {
  switch (cat) {
    case "student":    return "bg-indigo-50 text-indigo-700 border border-indigo-100";
    case "teacher":    return "bg-blue-50 text-blue-700 border border-blue-100";
    case "department": return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    case "fee":        return "bg-amber-50 text-amber-700 border border-amber-100";
  }
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-indigo-100 text-indigo-700 rounded not-italic font-semibold px-0.5">
        {text.slice(i, i + query.trim().length)}
      </mark>
      {text.slice(i + query.trim().length)}
    </>
  );
};

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────

const getStoredUser = (): AdminUser | null => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => localStorage.getItem("token");

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const AdminNavbar = ({ onMenuToggle, searchValue, onSearchChange }: AdminNavbarProps) => {
  const navigate = useNavigate();

  // ── Auth state from localStorage ──
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(getStoredUser);
  const isLoggedIn = !!currentUser && !!getStoredToken();

  // ── Search ──
  const [internalQuery, setInternalQuery] = useState("");
  const query = searchValue !== undefined ? searchValue : internalQuery;
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── UI panels ──
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileOpen,      setProfileOpen]       = useState(false);
  const [notifOpen,        setNotifOpen]          = useState(false);

  // ── Login modal ──
  const [loginModalOpen, setLoginModalOpen] = useState(!isLoggedIn);
  const [loginForm,      setLoginForm]      = useState({ email: "", password: "" });
  const [loginError,     setLoginError]     = useState("");
  const [loginLoading,   setLoginLoading]   = useState(false);
  const [showPassword,   setShowPassword]   = useState(false);

  // ── Notifications ──
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef   = useRef<HTMLDivElement>(null);

  // ─── Sync auth state if token changes externally ───────────────────────────
  useEffect(() => {
    const syncAuth = () => setCurrentUser(getStoredUser());
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  // ─── Search logic ──────────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allSearchData.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.meta.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map: Partial<Record<SearchResult["category"], SearchResult[]>> = {};
    searchResults.forEach((r) => { (map[r.category] ??= []).push(r); });
    return map;
  }, [searchResults]);

  const showDropdown = searchFocused && query.trim().length > 0;

  const handleQueryChange = (val: string) => {
    setInternalQuery(val);
    onSearchChange?.(val);
  };

  const handleResultClick = (path: string) => {
    navigate(path);
    handleQueryChange("");
    setSearchFocused(false);
  };

  // ─── Close dropdowns on outside click ─────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
      if (searchRef.current  && !searchRef.current.contains(e.target as Node))  setSearchFocused(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ─── REAL LOGIN ───────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoginError("");
    if (!loginForm.email || !loginForm.password) {
      setLoginError("Please fill in all fields.");
      return;
    }
    setLoginLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/login", {
        email: loginForm.email,
        password: loginForm.password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.data));
      setCurrentUser(data.data);
      setLoginModalOpen(false);
      setLoginForm({ email: "", password: "" });

      // Route based on role
      const role = data.role;
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "teacher") navigate("/teacher/dashboard");
      else if (role === "student") navigate("/student/dashboard");
      else navigate("/dashboard");

    } catch (err: any) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setProfileOpen(false);
    setLoginModalOpen(true);
    navigate("/login");
  };

  // ─── Notifications ────────────────────────────────────────────────────────
  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markOneRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  // ─── Derived display values ───────────────────────────────────────────────
  const displayName = currentUser?.fullName ?? "Guest";
  const displayRole = currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : "Not logged in";
  const displayEmail    = currentUser?.email ?? "";
  const displayInitials = currentUser ? getInitials(currentUser.fullName) : "?";

  return (
    <>
      {/* ─── Header Bar ─────────────────────────────────────────────────────── */}
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

        {/* Desktop Search */}
        <div className="hidden lg:block relative flex-1 max-w-md" ref={searchRef}>
          <div className={`flex items-center bg-slate-50 border rounded-xl px-4 py-2 transition-all ${searchFocused ? "bg-white border-indigo-500 ring-4 ring-indigo-500/10" : "border-slate-200"}`}>
            <FaSearch className="text-slate-400 text-sm shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(e) => e.key === "Escape" && setSearchFocused(false)}
              placeholder="Search students, teachers, departments..."
              className="bg-transparent outline-none ml-3 w-full text-sm text-slate-700 placeholder:text-slate-400"
            />
            {query && (
              <button
                onMouseDown={(e) => { e.preventDefault(); handleQueryChange(""); }}
                className="ml-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
              {searchResults.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm font-semibold text-slate-700">No results for "{query}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try a student name, teacher, or department</p>
                </div>
              ) : (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="max-h-95 overflow-y-auto pb-2">
                    {CATEGORY_ORDER.map((cat) => {
                      const items = grouped[cat];
                      if (!items?.length) return null;
                      return (
                        <div key={cat}>
                          <div className="flex items-center gap-2 px-4 py-1.5 mt-1">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${catBadge(cat)}`}>
                              {catIcon(cat)} {catLabel(cat)}
                            </span>
                            <span className="flex-1 h-px bg-slate-100" />
                          </div>
                          {items.map((item) => (
                            <button
                              key={item.id}
                              onMouseDown={() => handleResultClick(item.path)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group"
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${catBadge(cat)}`}>
                                {catIcon(cat)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                                  <Highlight text={item.title} query={query} />
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  <Highlight text={item.subtitle} query={query} />
                                </p>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                <Highlight text={item.meta} query={query} />
                              </span>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/60">
                    <span className="text-[10px] text-slate-400">Click a result to navigate</span>
                    <span className="text-[10px] text-slate-400">Esc to close</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Brand */}
        <div className="lg:hidden block mr-auto">
          <h1 className="font-bold text-slate-800 text-base md:text-lg truncate">Admin Panel</h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Mobile Search */}
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
                <span className="absolute -top-0.5 -right-0.5 bg-indigo-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <FaBell className="text-indigo-600 text-sm" />
                    <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      <FaCheckCircle size={11} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markOneRead(n.id)}
                      className={`flex gap-3 px-4 py-3 cursor-pointer transition hover:bg-slate-50 ${!n.read ? "bg-indigo-50/40" : ""}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${notifColor(n.type)}`}>
                        {notifIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-semibold truncate ${!n.read ? "text-slate-800" : "text-slate-600"}`}>
                            {n.title}
                          </p>
                          {!n.read && <span className="w-2 h-2 bg-indigo-500 rounded-full shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-slate-100 text-center">
                  <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-200" />

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
              className="flex items-center gap-2 hover:bg-slate-100 rounded-xl px-1.5 sm:px-2 py-1.5 transition-colors"
            >
              {isLoggedIn ? (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shrink-0">
                  {displayInitials}
                </div>
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                  <FaUserCircle size={18} />
                </div>
              )}
              <div className="hidden md:block text-left min-w-0">
                <p className="text-sm font-semibold text-slate-800 leading-tight truncate">
                  {isLoggedIn ? displayName : "Guest"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {isLoggedIn ? displayRole : "Not logged in"}
                </p>
              </div>
              <FaChevronDown className={`hidden md:block text-xs text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-4 bg-linear-to-br from-indigo-600 to-blue-600 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center font-bold text-base shrink-0">
                          {displayInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{displayName}</p>
                          <p className="text-xs opacity-85 truncate">{displayRole}</p>
                          <p className="text-xs opacity-60 mt-0.5 truncate">{displayEmail}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1.5">
                      <button
                        onClick={() => { navigate("/admin/profile"); setProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left"
                      >
                        <FaUserCircle className="text-slate-400" /> My Profile
                      </button>
                      <button
                        onClick={() => { navigate("/admin/settings"); setProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left"
                      >
                        <FaCog className="text-slate-400" /> Settings
                      </button>
                      <button
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left"
                      >
                        <FaShieldAlt className="text-slate-400" /> Change Password
                      </button>
                    </div>

                    <div className="border-t border-slate-100 py-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left font-medium"
                      >
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
                    <button
                      onClick={() => { setLoginModalOpen(true); setProfileOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-indigo-600 hover:bg-indigo-50 transition font-semibold"
                    >
                      Sign In to your account →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Mobile Search Modal ─────────────────────────────────────────────── */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-white z-50 p-4 lg:hidden flex flex-col">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 gap-3">
              <FaSearch className="text-slate-400 shrink-0 text-sm" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search students, teachers, departments..."
                className="bg-transparent outline-none w-full text-sm text-slate-700"
              />
              {query && (
                <button onClick={() => handleQueryChange("")} className="text-slate-400">
                  <FaTimes size={12} />
                </button>
              )}
            </div>
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <FaTimes size={14} />
            </button>
          </div>

          <div className="mt-4 overflow-y-auto flex-1">
            {query.trim() === "" ? (
              <>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Links</h3>
                <div className="space-y-1">
                  {[
                    { label: "Student Management",  path: "/admin/student"     },
                    { label: "Teacher Management",  path: "/admin/teacher"     },
                    { label: "Fee Payments",        path: "/admin/fee-payment" },
                    { label: "Attendance Overview", path: "/admin/attendance"  },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { navigate(item.path); setMobileSearchOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition text-left"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span className="text-sm text-slate-700 font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : searchResults.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-3xl mb-2">🔍</p>
                <p className="text-sm font-semibold text-slate-700">No results for "{query}"</p>
                <p className="text-xs text-slate-400 mt-1">Try a student name, teacher, or department</p>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-3">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                </p>
                {CATEGORY_ORDER.map((cat) => {
                  const items = grouped[cat];
                  if (!items?.length) return null;
                  return (
                    <div key={cat} className="mb-4">
                      <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${catBadge(cat)}`}>
                        {catIcon(cat)} {catLabel(cat)}
                      </div>
                      <div className="space-y-1">
                        {items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => { handleResultClick(item.path); setMobileSearchOpen(false); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition text-left"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${catBadge(cat)}`}>
                              {catIcon(cat)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                <Highlight text={item.title} query={query} />
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                <Highlight text={item.meta} query={query} />
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Login Modal ─────────────────────────────────────────────────────── */}
      {loginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-linear-to-br from-indigo-600 to-blue-600 px-6 py-6 text-white text-center relative">
              {/* Only allow closing if already logged in */}
              {isLoggedIn && (
                <button
                  onClick={() => setLoginModalOpen(false)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <FaTimes size={12} />
                </button>
              )}
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2 text-lg font-bold shadow-inner">
                🏫
              </div>
              <h2 className="text-base sm:text-lg font-bold">Welcome Back</h2>
              <p className="text-[11px] opacity-75 mt-0.5">Sign in to EduSmart Admin Panel</p>
            </div>

            <div className="px-6 py-5 space-y-3.5">
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-lg flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="you@school.edu.np"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-400" /> Remember me
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-indigo-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loginLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-1 shadow-md shadow-indigo-600/10"
              >
                {loginLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              <p className="text-center text-xs text-slate-500 pt-1">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setLoginModalOpen(false); navigate("/register"); }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Register
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;