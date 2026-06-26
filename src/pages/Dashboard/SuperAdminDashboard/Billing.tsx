import { useEffect, useState, useCallback } from "react";
import {
  FaUsers, FaMoneyBillWave, FaChartLine, FaDownload,
  FaRotateRight, FaTriangleExclamation, FaXmark, FaBan,
} from "react-icons/fa6";
import axiosInstance from "../../../api/axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  _id: string;
  name: "basic" | "standard" | "premium";
  price: number;
  features: {
    maxStudents: number;
    maxTeachers: number;
    maxAdmins: number;
    storageGB: number;
  };
}

interface School {
  _id: string;
  name: string;
  email: string;
}

interface Subscription {
  _id: string;
  school:         School | null;
  plan:           Plan   | null;
  status:         "active" | "expired" | "cancelled" | "pending" | "rejected";
  months:         number;
  totalAmount:    number;
  startDate:      string;
  endDate:        string;
  paymentMethod:  string;
  transactionId:  string;
  requestingUserName:  string;
  requestingUserEmail: string;
  approvedAt?:    string;
  createdAt:      string;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const PLAN_STYLES: Record<string, string> = {
  basic:    "bg-sky-100 text-sky-700",
  standard: "bg-violet-100 text-violet-700",
  premium:  "bg-amber-100 text-amber-700",
};

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-emerald-100 text-emerald-700",
  expired:   "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-200 text-slate-600",
  pending:   "bg-amber-100 text-amber-700",
  rejected:  "bg-red-100 text-red-700",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt      = (iso?: string) => iso ? new Date(iso).toLocaleDateString() : "—";
const fmtMoney = (n: number)    => `Rs ${Number(n).toLocaleString("ne-NP")}`;

const daysLeft = (end: string) =>
  Math.ceil((new Date(end).getTime() - Date.now()) / 86_400_000);

function resolveError(err: unknown): string {
  const e = err as { response?: { status?: number; data?: { message?: string } } };
  if (e?.response?.status === 401) return "Not authorized. Please log in as superadmin.";
  if (e?.response?.status === 403) return "Forbidden. Superadmin access required.";
  if (!e?.response)                return "Can't reach the server. Check your connection.";
  return e?.response?.data?.message ?? "Something went wrong.";
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon, iconBg, label, value, loading,
}: {
  icon: React.ReactNode; iconBg: string;
  label: string; value: string; loading: boolean;
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200
      flex items-center gap-4">
      <div className={`p-3 rounded-lg ${iconBg}`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        {loading
          ? <div className="h-6 w-20 bg-slate-100 rounded animate-pulse mt-1" />
          : <h2 className="text-xl font-bold text-slate-800">{value}</h2>}
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function SubDetailModal({
  sub, onClose,
}: {
  sub: Subscription; onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
        bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800">
              {sub.school?.name ?? sub.requestingUserName ?? "—"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Subscription details</p>
          </div>
          <button onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors">
            <FaXmark className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3 text-sm">
          {[
            { label: "Plan",         value: sub.plan?.name?.toUpperCase() ?? "—" },
            { label: "Status",       value: sub.status },
            { label: "Duration",     value: `${sub.months} month${sub.months !== 1 ? "s" : ""}` },
            { label: "Total Amount", value: fmtMoney(sub.totalAmount) },
            { label: "Start Date",   value: fmt(sub.startDate) },
            { label: "End Date",     value: fmt(sub.endDate) },
            { label: "Payment",      value: sub.paymentMethod?.toUpperCase() ?? "—" },
            { label: "Txn ID",       value: sub.transactionId ?? "—", mono: true },
            { label: "Requested by", value: sub.requestingUserName ?? "—" },
            { label: "Email",        value: sub.requestingUserEmail ?? "—" },
            { label: "Approved at",  value: fmt(sub.approvedAt) },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <span className="text-slate-500 shrink-0">{label}</span>
              <span className={`text-slate-800 font-medium text-right break-all
                ${mono ? "font-mono text-xs" : ""}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Billing() {
  const [data,         setData]         = useState<Subscription[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [detailModal,  setDetailModal]  = useState<Subscription | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchBilling = useCallback(async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/api/subscriptions/all", {
        params: status ? { status } : undefined,
      });
      setData(res.data?.data ?? []);
    } catch (err) {
      setError(resolveError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBilling(statusFilter); }, [fetchBilling, statusFilter]);

  // ── Cancel ─────────────────────────────────────────────────────────────────
  const handleCancel = async (sub: Subscription) => {
    const schoolId = sub.school?._id;
    if (!schoolId) return;
    if (!window.confirm(`Cancel subscription for "${sub.school?.name}"?`)) return;

    setCancellingId(sub._id);
    try {
      await axiosInstance.put(`/api/subscriptions/cancel/${schoolId}`);
      setData((prev) =>
        prev.map((s) => s._id === sub._id ? { ...s, status: "cancelled" } : s)
      );
    } catch (err) {
      alert(resolveError(err));
    } finally {
      setCancellingId(null);
    }
  };

  // ── CSV Export ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ["School", "Email", "Plan", "Status", "Months", "Amount", "Start", "End", "Payment", "Txn ID"],
      ...data.map((d) => [
        d.school?.name             ?? d.requestingUserName  ?? "—",
        d.school?.email            ?? d.requestingUserEmail ?? "—",
        d.plan?.name               ?? "—",
        d.status,
        String(d.months),
        fmtMoney(d.totalAmount),
        fmt(d.startDate),
        fmt(d.endDate),
        d.paymentMethod            ?? "—",
        d.transactionId            ?? "—",
      ]),
    ];
    const csv  = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = "subscriptions-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalRevenue    = data
    .filter((d) => d.status === "active")
    .reduce((sum, d) => sum + d.totalAmount, 0);

  const activeCount     = data.filter((d) => d.status === "active").length;

  const expiringSoon    = data.filter((d) =>
    d.status === "active" && daysLeft(d.endDate) <= 7 && daysLeft(d.endDate) >= 0
  ).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Billing & Subscriptions</h1>
          <p className="text-sm text-slate-500">Manage subscription plans for every school</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-600 px-3 py-2
              rounded-lg text-sm"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={() => fetchBilling(statusFilter)}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200
              text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50
              disabled:opacity-50"
          >
            <FaRotateRight className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={exportCSV}
            disabled={!data.length}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2
              rounded-lg text-sm shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-3 bg-rose-50 border
          border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2">
            <FaTriangleExclamation />{error}
          </div>
          <button onClick={() => fetchBilling(statusFilter)}
            className="font-medium underline hover:no-underline shrink-0">
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FaMoneyBillWave className="text-emerald-600 text-xl" />}
          iconBg="bg-emerald-50" label="Active Revenue"
          value={fmtMoney(totalRevenue)} loading={loading}
        />
        <StatCard
          icon={<FaUsers className="text-sky-600 text-xl" />}
          iconBg="bg-sky-50" label="Total Subscriptions"
          value={String(data.length)} loading={loading}
        />
        <StatCard
          icon={<FaChartLine className="text-violet-600 text-xl" />}
          iconBg="bg-violet-50" label="Active Plans"
          value={String(activeCount)} loading={loading}
        />
        <StatCard
          icon={<FaTriangleExclamation className="text-amber-600 text-xl" />}
          iconBg="bg-amber-50" label="Expiring ≤ 7 Days"
          value={String(expiringSoon)} loading={loading}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="p-3 text-left">School / Requester</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Duration</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Expires</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Skeleton */}
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-t border-slate-100 animate-pulse">
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="p-3">
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}

            {/* Rows */}
            {!loading && data.map((item) => {
              const dl           = daysLeft(item.endDate);
              const isCancelling = cancellingId === item._id;

              return (
                <tr key={item._id}
                  className="border-t border-slate-100 hover:bg-slate-50/60
                    transition-colors">

                  {/* School */}
                  <td className="p-3">
                    <div className="font-medium text-slate-700">
                      {item.school?.name ?? item.requestingUserName ?? "—"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {item.school?.email ?? item.requestingUserEmail ?? ""}
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize
                      font-medium ${PLAN_STYLES[item.plan?.name ?? ""] ??
                      "bg-slate-100 text-slate-600"}`}>
                      {item.plan?.name ?? "—"}
                    </span>
                    {item.plan?.price != null && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        {fmtMoney(item.plan.price)}/mo
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize
                      font-medium ${STATUS_STYLES[item.status] ??
                      "bg-slate-100 text-slate-600"}`}>
                      {item.status}
                    </span>
                    {item.status === "active" && dl <= 7 && dl >= 0 && (
                      <span className="ml-2 text-xs text-amber-600 font-medium">
                        {dl}d left
                      </span>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="p-3 text-slate-500">
                    {item.months} mo
                  </td>

                  {/* Amount */}
                  <td className="p-3 text-slate-500">
                    {fmtMoney(item.totalAmount)}
                    <div className="text-xs text-slate-400">
                      {item.paymentMethod?.toUpperCase()}
                    </div>
                  </td>

                  {/* Expires */}
                  <td className="p-3 text-slate-500">{fmt(item.endDate)}</td>

                  {/* Actions */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailModal(item)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium
                          text-indigo-600 bg-indigo-50 hover:bg-indigo-100
                          transition-colors"
                      >
                        Details
                      </button>

                      {item.status === "active" && (
                        <button
                          onClick={() => handleCancel(item)}
                          disabled={isCancelling}
                          title="Cancel subscription"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600
                            hover:bg-rose-50 transition-colors disabled:opacity-40"
                        >
                          {isCancelling
                            ? <FaRotateRight className="text-xs animate-spin" />
                            : <FaBan className="text-xs" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Empty */}
            {!loading && !error && data.length === 0 && (
              <tr>
                <td className="p-10 text-center text-slate-400" colSpan={7}>
                  No subscriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {detailModal && (
        <SubDetailModal
          sub={detailModal}
          onClose={() => setDetailModal(null)}
        />
      )}
    </div>
  );
}