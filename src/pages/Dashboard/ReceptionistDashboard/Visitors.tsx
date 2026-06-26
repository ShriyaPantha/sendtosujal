import { useState } from "react";
import { Search, Plus, LogOut, Clock, X, UserCheck, UserX, Hourglass } from "lucide-react";

type VisitorStatus = "Checked In" | "Checked Out" | "Pending";

interface Visitor {
  id: number;
  name: string;
  company: string;
  purpose: string;
  host: string;
  timeIn: string;
  timeOut: string | null;
  status: VisitorStatus;
}

const initialVisitors: Visitor[] = [
  { id: 1, name: "John Doe", company: "—", purpose: "Parent Meeting", host: "Mrs. Alvarez", timeIn: "10:30 AM", timeOut: null, status: "Checked In" },
  { id: 2, name: "Jane Smith", company: "Swift Courier", purpose: "Delivery", host: "Front Office", timeIn: "11:15 AM", timeOut: null, status: "Pending" },
  { id: 3, name: "Michael Chen", company: "BrightPath Supplies", purpose: "Vendor Drop-off", host: "Mr. Patel", timeIn: "9:05 AM", timeOut: "9:40 AM", status: "Checked Out" },
];

const statusStyles: Record<VisitorStatus, string> = {
  "Checked In": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  "Checked Out": "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

const statusDot: Record<VisitorStatus, string> = {
  "Checked In": "bg-emerald-500",
  Pending: "bg-amber-500",
  "Checked Out": "bg-slate-400",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function currentTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const emptyForm = { name: "", company: "", purpose: "", host: "" };

const Visitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>(initialVisitors);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | VisitorStatus>("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const today = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  const filtered = visitors.filter((v) => {
    const matchesQuery =
      v.name.toLowerCase().includes(query.toLowerCase()) ||
      v.purpose.toLowerCase().includes(query.toLowerCase()) ||
      v.host.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All" || v.status === filter;
    return matchesQuery && matchesFilter;
  });

  const counts = {
    total: visitors.length,
    checkedIn: visitors.filter((v) => v.status === "Checked In").length,
    pending: visitors.filter((v) => v.status === "Pending").length,
  };

  const handleCheckIn = (id: number) => {
    setVisitors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "Checked In", timeIn: currentTime() } : v))
    );
  };

  const handleCheckOut = (id: number) => {
    setVisitors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "Checked Out", timeOut: currentTime() } : v))
    );
  };

  const handleAddVisitor = () => {
    if (!form.name.trim() || !form.purpose.trim()) return;
    const newVisitor: Visitor = {
      id: Date.now(),
      name: form.name.trim(),
      company: form.company.trim() || "—",
      purpose: form.purpose.trim(),
      host: form.host.trim() || "—",
      timeIn: currentTime(),
      timeOut: null,
      status: "Pending",
    };
    setVisitors((prev) => [newVisitor, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Visitor Log</h1>
          <p className="text-sm text-slate-500 mt-1">{today}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Visitor
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Today</p>
            <p className="text-xl font-bold text-slate-800">{counts.total} visitors</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">On site</p>
            <p className="text-xl font-bold text-slate-800">{counts.checkedIn} checked in</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center">
            <Hourglass className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Waiting</p>
            <p className="text-xl font-bold text-slate-800">{counts.pending} pending</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, host, or purpose..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <div className="flex gap-1.5">
          {(["All", "Checked In", "Pending", "Checked Out"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                filter === f ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Visitor</th>
              <th className="px-6 py-4">Purpose</th>
              <th className="px-6 py-4">Host</th>
              <th className="px-6 py-4">Time In</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-700 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                      {initials(v.name)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{v.name}</p>
                      <p className="text-xs text-slate-400">{v.company}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{v.purpose}</td>
                <td className="px-6 py-4 text-slate-600">{v.host}</td>
                <td className="px-6 py-4 text-slate-600">
                  {v.timeIn}
                  {v.timeOut && <span className="text-slate-400"> → {v.timeOut}</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[v.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[v.status]}`} />
                    {v.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {v.status === "Pending" && (
                    <button
                      onClick={() => handleCheckIn(v.id)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Check In
                    </button>
                  )}
                  {v.status === "Checked In" && (
                    <button
                      onClick={() => handleCheckOut(v.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Check Out
                    </button>
                  )}
                  {v.status === "Checked Out" && <span className="text-xs text-slate-300">Complete</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                  No visitors match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add visitor modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Sign In Visitor</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Maria Lopez"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Company / Affiliation</label>
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Purpose of Visit</label>
                <input
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="e.g. Parent Meeting, Delivery, Interview"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Visiting / Host</label>
                <input
                  value={form.host}
                  onChange={(e) => setForm({ ...form, host: e.target.value })}
                  placeholder="Who are they here to see?"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVisitor}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visitors;