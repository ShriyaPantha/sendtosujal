import { useState } from "react";
import { Plus, Search, Package, PackageCheck, PackageX, Bell, X } from "lucide-react";

type DeliveryStatus = "Awaiting Pickup" | "Notified" | "Picked Up" | "Returned";

interface Delivery {
  id: number;
  courier: string;
  trackingId: string;
  recipient: string;
  department: string;
  description: string;
  timeReceived: string;
  status: DeliveryStatus;
}

const initialDeliveries: Delivery[] = [
  { id: 1, courier: "FedEx", trackingId: "FX-88213", recipient: "Mr. Patel", department: "Administration", description: "Sealed envelope - contracts", timeReceived: "9:10 AM", status: "Awaiting Pickup" },
  { id: 2, courier: "UPS", trackingId: "UPS-44290", recipient: "IT Department", department: "IT", description: "Box - replacement monitors (2)", timeReceived: "9:45 AM", status: "Notified" },
  { id: 3, courier: "In-house Courier", trackingId: "—", recipient: "Lily Chen", department: "Academics", description: "Stack of textbooks", timeReceived: "10:20 AM", status: "Picked Up" },
  { id: 4, courier: "DHL", trackingId: "DHL-10072", recipient: "Finance Office", department: "Finance", description: "Document pouch - audit papers", timeReceived: "8:30 AM", status: "Returned" },
];

const statusStyles: Record<DeliveryStatus, string> = {
  "Awaiting Pickup": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Notified: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  "Picked Up": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Returned: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

const statusDot: Record<DeliveryStatus, string> = {
  "Awaiting Pickup": "bg-amber-500",
  Notified: "bg-sky-500",
  "Picked Up": "bg-emerald-500",
  Returned: "bg-slate-400",
};

function currentTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const emptyForm = { courier: "", trackingId: "", recipient: "", department: "", description: "" };

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | DeliveryStatus>("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const today = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  const filtered = deliveries.filter((d) => {
    const matchesQuery =
      d.recipient.toLowerCase().includes(query.toLowerCase()) ||
      d.courier.toLowerCase().includes(query.toLowerCase()) ||
      d.description.toLowerCase().includes(query.toLowerCase()) ||
      d.trackingId.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All" || d.status === filter;
    return matchesQuery && matchesFilter;
  });

  const counts = {
    total: deliveries.length,
    awaiting: deliveries.filter((d) => d.status === "Awaiting Pickup" || d.status === "Notified").length,
    pickedUp: deliveries.filter((d) => d.status === "Picked Up").length,
  };

  const handleNotify = (id: number) => {
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: "Notified" } : d)));
  };

  const handlePickedUp = (id: number) => {
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: "Picked Up" } : d)));
  };

  const handleAddDelivery = () => {
    if (!form.recipient.trim() || !form.description.trim()) return;
    const newDelivery: Delivery = {
      id: Date.now(),
      courier: form.courier.trim() || "Unknown Courier",
      trackingId: form.trackingId.trim() || "—",
      recipient: form.recipient.trim(),
      department: form.department.trim() || "—",
      description: form.description.trim(),
      timeReceived: currentTime(),
      status: "Awaiting Pickup",
    };
    setDeliveries((prev) => [newDelivery, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Deliveries</h1>
          <p className="text-sm text-slate-500 mt-1">{today}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition"
        >
          <Plus className="w-4 h-4" />
          Log Delivery
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Today</p>
            <p className="text-xl font-bold text-slate-800">{counts.total} deliveries</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Waiting</p>
            <p className="text-xl font-bold text-slate-800">{counts.awaiting} for pickup</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Resolved</p>
            <p className="text-xl font-bold text-slate-800">{counts.pickedUp} picked up</p>
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
            placeholder="Search by recipient, courier, or tracking ID..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {(["All", "Awaiting Pickup", "Notified", "Picked Up", "Returned"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
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
              <th className="px-6 py-4">Package</th>
              <th className="px-6 py-4">Recipient</th>
              <th className="px-6 py-4">Courier</th>
              <th className="px-6 py-4">Received</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-700">{d.description}</p>
                  <p className="text-xs text-slate-400">Tracking: {d.trackingId}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-700">{d.recipient}</p>
                  <p className="text-xs text-slate-400">{d.department}</p>
                </td>
                <td className="px-6 py-4 text-slate-600">{d.courier}</td>
                <td className="px-6 py-4 text-slate-600">{d.timeReceived}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[d.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[d.status]}`} />
                    {d.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {d.status === "Awaiting Pickup" && (
                    <button
                      onClick={() => handleNotify(d.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      Notify
                    </button>
                  )}
                  {d.status === "Notified" && (
                    <button
                      onClick={() => handlePickedUp(d.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      Mark Picked Up
                    </button>
                  )}
                  {d.status === "Picked Up" && <span className="text-xs text-slate-300">Complete</span>}
                  {d.status === "Returned" && <span className="text-xs text-slate-300 inline-flex items-center gap-1"><PackageX className="w-3.5 h-3.5" />Returned</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                  No deliveries match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Log delivery modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Log Incoming Delivery</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Package Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Box - office supplies"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Recipient</label>
                <input
                  value={form.recipient}
                  onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                  placeholder="Who is this for?"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Department</label>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Courier</label>
                  <input
                    value={form.courier}
                    onChange={(e) => setForm({ ...form, courier: e.target.value })}
                    placeholder="e.g. FedEx"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Tracking ID</label>
                  <input
                    value={form.trackingId}
                    onChange={(e) => setForm({ ...form, trackingId: e.target.value })}
                    placeholder="Optional"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
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
                onClick={handleAddDelivery}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700"
              >
                Log It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;