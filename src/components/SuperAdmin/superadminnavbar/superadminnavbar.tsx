// src/components/SuperAdmin/SuperAdminNavbar/SuperAdminNavbar.tsx
// Industry-grade: real JWT login/logout, persisted auth state, live user profile

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell, FaSearch, FaTimes,
  FaChevronDown, FaSignOutAlt, FaUserCircle,
  FaCog, FaShieldAlt, FaCheckCircle,
  FaSchool, FaUser, FaCreditCard, FaChartBar,
  FaEye, FaEyeSlash, FaExclamationCircle,
} from "react-icons/fa";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type ApiNotification,
} from "../../../services/notificationApi";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Notification = ApiNotification;

/** Shape returned by /api/auth/login → data field */
interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isVerified?: boolean;
  schoolId?: { _id: string; name: string; email: string } | string | null;
  isActive?: boolean;
}

type SearchResult = {
  id: string;
  category: "school" | "admin" | "transaction" | "report";
  title: string;
  subtitle: string;
  meta: string;
  path: string;
};

interface SuperAdminNavbarProps {
  onMenuToggle?: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────

const TOKEN_KEY  = "sa_token";
const USER_KEY   = "sa_user";
const ROLE_KEY   = "sa_role";

const auth = {
  getToken: (): string => localStorage.getItem(TOKEN_KEY) ?? "",
  getUser:  (): AuthUser | null => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) ?? "null"); } catch { return null; }
  },
  getRole: (): string => localStorage.getItem(ROLE_KEY) ?? "",
  set: (token: string, user: AuthUser, role: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(ROLE_KEY, role);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
  },
};

// ── Resolve API base: use env var if set and not the literal string "undefined",
//    otherwise fall back to your local Express server port.
const _envBase = import.meta.env.VITE_API_BASE_URL;
const API_BASE =
  _envBase && _envBase !== "undefined" ? _envBase : "http://localhost:4000";

async function apiLogin(email: string, password: string) {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error(`Cannot reach server at ${API_BASE}. Is your backend running?`);
  }

  // Guard: some 404/5xx responses may not be valid JSON
  const text = await res.text();
  let data: { message?: string; success?: boolean; token?: string; role?: string; data?: AuthUser };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server error (${res.status}): ${text.slice(0, 120) || "Empty response"}`);
  }

  if (!res.ok) throw new Error(data.message ?? `Login failed (${res.status})`);
  return data as { success: boolean; token: string; role: string; data: AuthUser };
}

// ─── MOCK SEARCH DATA (replace with real API later) ──────────────────────────

const allSearchData: SearchResult[] = [
  { id: "SCH-1001", category: "school",      title: "Greenwood International School", subtitle: "Kathmandu, Bagmati",       meta: "ID: 1001 · 1,240 students", path: "/superadmin/schools/1001" },
  { id: "SCH-1002", category: "school",      title: "Riverside Academy",              subtitle: "Pokhara, Gandaki",         meta: "ID: 1002 · 870 students",   path: "/superadmin/schools/1002" },
  { id: "SCH-1003", category: "school",      title: "Sunrise Public School",          subtitle: "Lalitpur, Bagmati",        meta: "ID: 1003 · 432 students",   path: "/superadmin/schools/1003" },
  { id: "USR-2011", category: "admin",       title: "Anil Shrestha",                  subtitle: "School Admin · Greenwood", meta: "ID: 2011 · Active",         path: "/superadmin/users/2011"   },
  { id: "USR-2022", category: "admin",       title: "Priya Thapa",                    subtitle: "School Admin · Riverside", meta: "ID: 2022 · Active",         path: "/superadmin/users/2022"   },
  { id: "TXN-3001", category: "transaction", title: "Annual Plan — Greenwood",        subtitle: "Paid via eSewa",           meta: "TXN: 3001 · NPR 45,000",   path: "/superadmin/billing/3001" },
  { id: "TXN-3002", category: "transaction", title: "Monthly Plan — Riverside",       subtitle: "Paid via Khalti",          meta: "TXN: 3002 · NPR 4,500",    path: "/superadmin/billing/3002" },
  { id: "RPT-4001", category: "report",      title: "Q1 2025 Revenue Report",         subtitle: "Finance · Apr 2025",       meta: "RPT: 4001",                 path: "/superadmin/reports/4001" },
  { id: "RPT-4002", category: "report",      title: "Enrollment Summary — 2024",      subtitle: "Academic · Jan 2025",      meta: "RPT: 4002",                 path: "/superadmin/reports/4002" },
];

const CATEGORY_ORDER: SearchResult["category"][] = ["school", "admin", "transaction", "report"];

// ─── SMALL HELPERS ────────────────────────────────────────────────────────────

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const roleLabel = (role: string) => {
  switch (role) {
    case "superadmin": return "Super Administrator";
    case "admin":      return "School Administrator";
    case "teacher":    return "Teacher";
    case "student":    return "Student";
    default:           return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

const notifColor = (type: Notification["type"]) => {
  switch (type) {
    case "fee":        return "bg-amber-100 text-amber-600";
    case "attendance": return "bg-blue-100 text-blue-600";
    case "assignment": return "bg-emerald-100 text-emerald-600";
    case "general":    return "bg-violet-100 text-violet-600";
  }
};
const notifIcon = (type: Notification["type"]) => {
  switch (type) {
    case "fee":        return "💳";
    case "attendance": return "🗓️";
    case "assignment": return "📝";
    case "general":    return "📢";
  }
};
const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const catIcon = (cat: SearchResult["category"]) => {
  switch (cat) {
    case "school":      return <FaSchool     size={11} />;
    case "admin":       return <FaUser       size={11} />;
    case "transaction": return <FaCreditCard size={11} />;
    case "report":      return <FaChartBar   size={11} />;
  }
};
const catLabel = (cat: SearchResult["category"]) => {
  switch (cat) {
    case "school":      return "Schools";
    case "admin":       return "Users";
    case "transaction": return "Transactions";
    case "report":      return "Reports";
  }
};
const catBadge = (cat: SearchResult["category"]) => {
  switch (cat) {
    case "school":      return "bg-violet-50 text-violet-700 border border-violet-100";
    case "admin":       return "bg-blue-50 text-blue-700 border border-blue-100";
    case "transaction": return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    case "report":      return "bg-amber-50 text-amber-700 border border-amber-100";
  }
};

const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-violet-100 text-violet-700 rounded not-italic font-semibold px-0.5">
        {text.slice(i, i + query.trim().length)}
      </mark>
      {text.slice(i + query.trim().length)}
    </>
  );
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const SuperAdminNavbar = ({ onMenuToggle, searchValue, onSearchChange }: SuperAdminNavbarProps) => {
  const navigate = useNavigate();

  // ── Auth state (hydrated from localStorage on mount) ─────────────────────
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(auth.getUser);
  const [isLoggedIn,  setIsLoggedIn]  = useState(() => !!auth.getToken() && !!auth.getUser());

  // ── Search ────────────────────────────────────────────────────────────────
  const [internalQuery, setInternalQuery] = useState("");
  const query = searchValue !== undefined ? searchValue : internalQuery;
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Panel toggles ─────────────────────────────────────────────────────────
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileOpen,      setProfileOpen]       = useState(false);
  const [notifOpen,        setNotifOpen]          = useState(false);
  const [loginModalOpen,   setLoginModalOpen]     = useState(false);

  // ── Login form state ──────────────────────────────────────────────────────
  const [loginForm,    setLoginForm]    = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError,   setLoginError]   = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // ── Logout state ──────────────────────────────────────────────────────────
  const [logoutLoading, setLogoutLoading] = useState(false);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [notifLoading,  setNotifLoading]  = useState(false);
  const [notifError,    setNotifError]    = useState("");

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef   = useRef<HTMLDivElement>(null);
  const emailRef   = useRef<HTMLInputElement>(null);

  // ── Focus email on modal open ─────────────────────────────────────────────
  useEffect(() => {
    if (loginModalOpen) {
      setTimeout(() => emailRef.current?.focus(), 80);
    }
  }, [loginModalOpen]);

  // ── Open modal automatically if not logged in ─────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) setLoginModalOpen(true);
  }, [isLoggedIn]);

  // ── Notifications fetch ───────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    const token = auth.getToken();
    if (!token) return;
    setNotifLoading(true);
    setNotifError("");
    try {
      const res = await getMyNotifications(token);
      setNotifications(res.data);
      setUnreadCount(res.unreadCount);
    } catch {
      setNotifError("Couldn't load notifications");
    } finally {
      setNotifLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // ── Click-outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
      if (searchRef.current  && !searchRef.current.contains(e.target as Node))  setSearchFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoginError("");
    if (!loginForm.email.trim() || !loginForm.password) {
      setLoginError("Please enter your email and password.");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await apiLogin(loginForm.email.trim(), loginForm.password);
      auth.set(res.token, res.data, res.role);
      setCurrentUser(res.data);
      setIsLoggedIn(true);
      setLoginSuccess(true);
      // brief success flash, then close
      setTimeout(() => {
        setLoginModalOpen(false);
        setLoginSuccess(false);
        setLoginForm({ email: "", password: "" });
      }, 900);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLogoutLoading(true);
    // Optional: call server-side logout endpoint here
    // await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${auth.getToken()}` } });
    await new Promise((r) => setTimeout(r, 500)); // brief UX pause
    auth.clear();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setProfileOpen(false);
    setNotifications([]);
    setUnreadCount(0);
    setLogoutLoading(false);
    navigate("/login");
  };

  // ── Notification actions ──────────────────────────────────────────────────
  const markAllRead = async () => {
    const prev = { notifications, unreadCount };
    setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try { await markAllNotificationsRead(auth.getToken()); }
    catch { setNotifications(prev.notifications); setUnreadCount(prev.unreadCount); }
  };

  const markOneRead = async (id: string) => {
    const target = notifications.find((n) => n._id === id);
    if (!target || target.isRead) return;
    setNotifications((p) => p.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
    try { await markNotificationRead(id, auth.getToken()); }
    catch {
      setNotifications((p) => p.map((n) => n._id === id ? { ...n, isRead: false } : n));
      setUnreadCount((c) => c + 1);
    }
  };

  // ── Search results ────────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allSearchData.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.meta.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q),
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

  // ── Derived display values ─────────────────────────────────────────────────
  const userInitials = currentUser ? initials(currentUser.fullName) : "?";
  const displayName  = currentUser?.fullName ?? "Guest";
  const displayRole  = currentUser ? roleLabel(currentUser.role) : "Not signed in";
  const displayEmail = currentUser?.email ?? "";

  const schoolName =
    currentUser?.schoolId && typeof currentUser.schoolId === "object"
      ? (currentUser.schoolId as { name: string }).name
      : null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm px-4 md:px-6 h-16 flex items-center justify-between gap-4 w-full">

        {/* Hamburger */}
        <button
          onClick={onMenuToggle}
          type="button"
          aria-label="Toggle Navigation Menu"
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 flex flex-col gap-1.5 w-9 h-9 items-center justify-center shrink-0 transition-colors"
        >
          <span className="w-5 h-0.5 bg-slate-600 rounded-full" />
          <span className="w-4 h-0.5 bg-slate-400 rounded-full" />
          <span className="w-5 h-0.5 bg-slate-600 rounded-full" />
        </button>

        {/* ── DESKTOP SEARCH ──────────────────────────────────────────── */}
        <div className="hidden lg:block relative flex-1 max-w-md" ref={searchRef}>
          <div className={`flex items-center bg-slate-50 border rounded-xl px-4 py-2.5 transition-all duration-150 ${searchFocused ? "bg-white border-violet-500 ring-4 ring-violet-500/10 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}>
            <FaSearch className="text-slate-400 text-sm shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(e) => e.key === "Escape" && setSearchFocused(false)}
              placeholder="Search schools, admins, transactions…"
              className="bg-transparent outline-none ml-3 w-full text-sm text-slate-700 placeholder:text-slate-400"
            />
            {query && (
              <button
                onMouseDown={(e) => { e.preventDefault(); handleQueryChange(""); }}
                className="ml-2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <FaTimes size={11} />
              </button>
            )}
          </div>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
              {searchResults.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm font-semibold text-slate-700">No results for "{query}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try a name, ID, or amount</p>
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
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${catBadge(cat)}`}>{catIcon(cat)}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-violet-700 transition-colors">
                                  <Highlight text={item.title} query={query} />
                                </p>
                                <p className="text-xs text-slate-500 truncate"><Highlight text={item.subtitle} query={query} /></p>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0"><Highlight text={item.meta} query={query} /></span>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/60">
                    <span className="text-[10px] text-slate-400">Click to navigate</span>
                    <span className="text-[10px] text-slate-400 font-mono">Esc to close</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile branding */}
        <div className="lg:hidden block mr-auto">
          <h1 className="font-bold text-slate-800 text-base truncate">Admin Portal</h1>
        </div>

        {/* ── ACTIONS ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile search */}
          <button onClick={() => setMobileSearchOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
            <FaSearch size={16} />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen((v) => { if (!v) fetchNotifications(); return !v; }); setProfileOpen(false); }}
              className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Notifications"
            >
              <FaBell className="text-base sm:text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-auto mt-0 sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
                  <div className="flex items-center gap-2">
                    <FaBell className="text-violet-600 text-sm" />
                    <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-violet-100 text-violet-700 text-xs px-2 py-0.5 rounded-full font-semibold">{unreadCount} new</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1 transition-colors">
                      <FaCheckCircle size={10} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {notifLoading ? (
                    <div className="px-4 py-8 text-center">
                      <div className="w-5 h-5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-slate-400 mt-2">Loading…</p>
                    </div>
                  ) : notifError ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-red-500 font-medium">{notifError}</p>
                      <button onClick={fetchNotifications} className="text-xs text-violet-600 hover:underline mt-2">Try again</button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <p className="text-2xl mb-2">🎉</p>
                      <p className="text-sm text-slate-500 font-medium">All caught up!</p>
                      <p className="text-xs text-slate-400 mt-1">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => markOneRead(n._id)}
                        className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? "bg-violet-50/50" : ""}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${notifColor(n.type)}`}>{notifIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-xs font-semibold truncate ${!n.isRead ? "text-slate-800" : "text-slate-600"}`}>{n.title}</p>
                            {!n.isRead && <span className="w-2 h-2 bg-violet-500 rounded-full shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2.5 border-t border-slate-100 text-center bg-slate-50/50">
                  <button
                    onClick={() => { navigate("/superadmin/notifications"); setNotifOpen(false); }}
                    className="text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
                  >
                    View all notifications →
                  </button>
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
              aria-label="Profile menu"
            >
              {isLoggedIn ? (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shrink-0">
                  {userInitials}
                </div>
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                  <FaUserCircle size={18} />
                </div>
              )}
              <div className="hidden md:block text-left min-w-0">
                <p className="text-sm font-semibold text-slate-800 leading-tight truncate max-w-30">
                  {isLoggedIn ? displayName : "Guest"}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-30">
                  {isLoggedIn ? displayRole : "Not signed in"}
                </p>
              </div>
              <FaChevronDown className={`hidden md:block text-xs text-slate-400 transition-transform duration-200 shrink-0 ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-auto mt-0 sm:mt-2 w-auto sm:w-72 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                {isLoggedIn ? (
                  <>
                    {/* User card */}
                    <div className="px-4 py-4 bg-linear-to-br from-violet-600 to-indigo-600 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-base shrink-0 border border-white/30">
                          {userInitials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{displayName}</p>
                          <p className="text-xs opacity-85 truncate">{displayRole}</p>
                          <p className="text-xs opacity-60 mt-0.5 truncate">{displayEmail}</p>
                          {schoolName && (
                            <span className="inline-flex items-center gap-1 mt-1.5 bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                              <FaSchool size={8} /> {schoolName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="py-1">
                      <button onClick={() => { navigate("/superadmin/profile"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><FaUserCircle className="text-slate-500" size={12} /></div>
                        <div>
                          <p className="text-sm font-medium">My Profile</p>
                          <p className="text-[10px] text-slate-400">View & edit your details</p>
                        </div>
                      </button>
                      <button onClick={() => { navigate("/superadmin/settings"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><FaCog className="text-slate-500" size={12} /></div>
                        <div>
                          <p className="text-sm font-medium">Settings</p>
                          <p className="text-[10px] text-slate-400">System preferences</p>
                        </div>
                      </button>
                      <button onClick={() => { navigate("/superadmin/change-password"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><FaShieldAlt className="text-slate-500" size={12} /></div>
                        <div>
                          <p className="text-sm font-medium">Change Password</p>
                          <p className="text-[10px] text-slate-400">Security & access</p>
                        </div>
                      </button>
                    </div>

                    {/* Session info */}
                    <div className="px-4 py-2 bg-slate-50/70 border-t border-b border-slate-100">
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        Session: {auth.getToken().slice(0, 20)}…
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Role: <span className="font-semibold text-slate-600">{auth.getRole() || currentUser?.role}</span></p>
                    </div>

                    {/* Logout */}
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium disabled:opacity-60"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                          {logoutLoading ? (
                            <div className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <FaSignOutAlt className="text-red-500" size={11} />
                          )}
                        </div>
                        <span>{logoutLoading ? "Signing out…" : "Sign Out"}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-2">
                    <div className="px-4 py-5 text-center border-b border-slate-100">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <FaUserCircle className="text-3xl text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Not signed in</p>
                      <p className="text-xs text-slate-400 mt-1">Sign in to access your account</p>
                    </div>
                    <button
                      onClick={() => { setLoginModalOpen(true); setProfileOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-violet-600 hover:bg-violet-50 transition-colors font-semibold"
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

      {/* ── MOBILE SEARCH ───────────────────────────────────────────────────── */}
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
                placeholder="Search schools, admins, transactions…"
                className="bg-transparent outline-none w-full text-sm text-slate-700"
              />
              {query && <button onClick={() => handleQueryChange("")} className="text-slate-400"><FaTimes size={12} /></button>}
            </div>
            <button onClick={() => setMobileSearchOpen(false)} className="p-3 bg-slate-100 rounded-xl text-slate-600">
              <FaTimes size={14} />
            </button>
          </div>

          <div className="mt-4 overflow-y-auto flex-1">
            {query.trim() === "" ? (
              <>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Links</p>
                <div className="space-y-1">
                  {[
                    { label: "Schools Management",      path: "/superadmin/schools"  },
                    { label: "User & Role Management",  path: "/superadmin/users"    },
                    { label: "Billing & Subscriptions", path: "/superadmin/billing"  },
                    { label: "Reports & Analytics",     path: "/superadmin/reports"  },
                  ].map((item) => (
                    <button key={item.label} onClick={() => { navigate(item.path); setMobileSearchOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                      <span className="text-sm text-slate-700 font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : searchResults.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-3xl mb-2">🔍</p>
                <p className="text-sm font-semibold text-slate-700">No results for "{query}"</p>
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
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${catBadge(cat)}`}>{catIcon(cat)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate"><Highlight text={item.title} query={query} /></p>
                              <p className="text-xs text-slate-500 truncate"><Highlight text={item.meta} query={query} /></p>
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

      {/* ── LOGIN MODAL ──────────────────────────────────────────────────────── */}
      {loginModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget && isLoggedIn) setLoginModalOpen(false); }}
        >
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-[fadeInUp_0.2s_ease]">

            {/* Header */}
            <div className="relative bg-linear-to-br from-violet-600 via-violet-700 to-indigo-700 px-6 pt-8 pb-6 text-white text-center">
              {isLoggedIn && (
                <button
                  onClick={() => setLoginModalOpen(false)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                >
                  <FaTimes size={12} />
                </button>
              )}
              <div className="w-14 h-14 bg-white/15 border border-white/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <FaShieldAlt size={22} className="text-white" />
              </div>
              <h2 className="text-lg font-bold tracking-tight">Welcome back</h2>
              <p className="text-xs text-white/65 mt-1">Sign in to EduSmart Admin Portal</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Error banner */}
              {loginError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-xl">
                  <FaExclamationCircle className="mt-0.5 shrink-0 text-red-500" size={13} />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Success flash */}
              {loginSuccess && (
                <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-2.5 rounded-xl">
                  <FaCheckCircle className="shrink-0 text-emerald-500" size={13} />
                  <span>Signed in successfully! Redirecting…</span>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Email Address</label>
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="you@edusmart.edu.np"
                  value={loginForm.email}
                  onChange={(e) => { setLoginForm({ ...loginForm, email: e.target.value }); setLoginError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoComplete="email"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow placeholder:text-slate-400"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => { setLoginForm({ ...loginForm, password: e.target.value }); setLoginError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    autoComplete="current-password"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded text-violet-600 focus:ring-violet-400 border-slate-300" />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-violet-600 hover:text-violet-800 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loginLoading || loginSuccess}
                className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-500/20"
              >
                {loginLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : loginSuccess ? (
                  <><FaCheckCircle /> Signed in!</>
                ) : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
      `}</style>
    </>
  );
};

export default SuperAdminNavbar;