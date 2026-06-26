import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../api/axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanFeatures {
  maxStudents: number;
  maxTeachers: number;
  maxAdmins: number;
  hasQRAttendance: boolean;
  hasOnlinePayment: boolean;
  hasCRM: boolean;
  hasDocumentUpload: boolean;
  hasTimetable: boolean;
  hasNotifications: boolean;
  storageGB: number;
}

interface Plan {
  _id: string;
  name: string;
  price: number;
  features: PlanFeatures;
}

interface School {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Subscription {
  _id: string;
  plan: Plan;
  school?: School;
  status: "pending" | "active" | "rejected" | "cancelled" | "expired";
  months: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  startDate: string;
  endDate: string;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectReason?: string;
  cancelledAt?: string;
  requestingUserEmail?: string;
  requestingUserName?: string;
}

type StatusFilter = "all" | "pending" | "active" | "rejected" | "cancelled" | "expired";
type ModalAction  = "approve" | "reject" | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `Rs ${Number(n).toLocaleString("ne-NP")}`;

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-NP", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "—";

const STATUS_META: Record<string, {
  label: string; dot: string; text: string; bg: string; border: string;
}> = {
  pending:   { label: "Pending",   dot: "bg-amber-400",   text: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/30"   },
  active:    { label: "Active",    dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  rejected:  { label: "Rejected",  dot: "bg-red-400",     text: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/30"     },
  cancelled: { label: "Cancelled", dot: "bg-slate-400",   text: "text-slate-400",   bg: "bg-slate-400/10",   border: "border-slate-400/30"   },
  expired:   { label: "Expired",   dot: "bg-slate-500",   text: "text-slate-500",   bg: "bg-slate-500/10",   border: "border-slate-500/30"   },
};

const PLAN_ACCENT: Record<string, string> = {
  basic:    "text-teal-400",
  standard: "text-amber-400",
  premium:  "text-violet-400",
};

const PLAN_BADGE: Record<string, string> = {
  basic:    "bg-teal-400/10 border-teal-400/30 text-teal-400",
  standard: "bg-amber-400/10 border-amber-400/30 text-amber-400",
  premium:  "bg-violet-400/10 border-violet-400/30 text-violet-400",
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5
      text-[11px] font-semibold tracking-wide ${m.text} ${m.bg} ${m.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

// ─── Action Modal ─────────────────────────────────────────────────────────────

function ActionModal({
  action, subscription, loading, onConfirm, onClose,
}: {
  action:       ModalAction;
  subscription: Subscription | null;
  loading:      boolean;
  onConfirm:    (reason?: string) => void;
  onClose:      () => void;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => { if (action) setReason(""); }, [action]);

  if (!action || !subscription) return null;

  const isApprove = action === "approve";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75
      backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900
        p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="mb-1 flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg
            ${isApprove ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            {isApprove ? "✓" : "✕"}
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            {isApprove ? "Approve Subscription?" : "Reject Subscription?"}
          </h2>
        </div>

        <p className="mb-5 mt-2 text-[13px] text-slate-400 leading-relaxed">
          {isApprove ? (
            <>Activating <strong className="text-slate-200">
              {subscription.plan?.name?.toUpperCase()}
            </strong> plan for <strong className="text-slate-200">
              {subscription.requestingUserEmail}
            </strong>.{" "}
            {!subscription.school &&
              "A new school will be auto-created from their email."
            }</>
          ) : (
            <>Rejecting request from <strong className="text-slate-200">
              {subscription.requestingUserEmail}
            </strong>.</>
          )}
        </p>

        {/* Summary card */}
        <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950
          divide-y divide-slate-800 text-[13px]">
          {[
            { label: "Plan",     value: subscription.plan?.name?.toUpperCase(),
              cls: PLAN_ACCENT[subscription.plan?.name] ?? "text-slate-300" },
            { label: "Duration", value: `${subscription.months} month${subscription.months > 1 ? "s" : ""}`,
              cls: "text-slate-300" },
            { label: "Amount",   value: fmt(subscription.totalAmount),
              cls: "text-slate-300" },
            { label: "Method",   value: subscription.paymentMethod,
              cls: "text-slate-300 capitalize" },
            { label: "Txn ID",   value: subscription.transactionId,
              cls: "font-mono text-slate-300 text-[12px]" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-slate-500">{label}</span>
              <span className={`font-semibold ${cls}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Reject reason */}
        {!isApprove && (
          <textarea
            placeholder="Reason for rejection (optional but recommended)…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mb-5 w-full resize-none rounded-xl border border-slate-800
              bg-slate-950 px-4 py-3 text-[13px] text-slate-200 placeholder-slate-600
              outline-none focus:border-red-600 transition-colors"
          />
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-700 py-2.5 text-[13px]
              font-semibold text-slate-400 hover:border-slate-500 transition-colors
              disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason || undefined)}
            disabled={loading}
            className={[
              "flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-all disabled:opacity-50",
              isApprove
                ? "bg-emerald-500 text-black hover:bg-emerald-400"
                : "bg-red-500 text-white hover:bg-red-400",
            ].join(" ")}
          >
            {loading
              ? (isApprove ? "Approving…" : "Rejecting…")
              : (isApprove ? "✓ Approve" : "✕ Reject")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Item ──────────────────────────────────────────────────────────────

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest
        text-slate-600 mb-0.5">{label}</div>
      <div className="text-[13px] text-slate-300 break-all">{value}</div>
    </div>
  );
}

// ─── Subscription Row ─────────────────────────────────────────────────────────

function SubRow({
  sub, onApprove, onReject,
}: {
  sub:       Subscription;
  onApprove: (s: Subscription) => void;
  onReject:  (s: Subscription) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-slate-800/60 hover:bg-slate-800/20
          transition-colors cursor-pointer group"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Requester */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center
              rounded-full bg-slate-800 text-[12px] font-bold text-slate-400">
              {(sub.requestingUserName ?? sub.requestingUserEmail ?? "?")[0]
                .toUpperCase()}
            </div>
            <div>
              <div className="text-[13px] font-medium text-slate-200 leading-tight">
                {sub.requestingUserName ?? "—"}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {sub.requestingUserEmail ?? "—"}
              </div>
            </div>
          </div>
        </td>

        {/* Plan */}
        <td className="px-4 py-3.5 hidden sm:table-cell">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5
            text-[11px] font-bold uppercase tracking-wide
            ${PLAN_BADGE[sub.plan?.name] ?? "bg-slate-700 border-slate-600 text-slate-300"}`}>
            {sub.plan?.name ?? "—"}
          </span>
          <div className="text-[11px] text-slate-500 mt-1">
            {sub.months}mo · {fmt(sub.totalAmount)}
          </div>
        </td>

        {/* Payment */}
        <td className="px-4 py-3.5 hidden md:table-cell">
          <div className="text-[13px] text-slate-300 capitalize">
            {sub.paymentMethod}
          </div>
          <div className="font-mono text-[11px] text-slate-500 mt-0.5
            truncate max-w-30">
            {sub.transactionId}
          </div>
        </td>

        {/* Requested at */}
        <td className="px-4 py-3.5 hidden lg:table-cell">
          <div className="text-[13px] text-slate-400">
            {fmtDate(sub.requestedAt)}
          </div>
        </td>

        {/* Status */}
        <td className="px-4 py-3.5">
          <StatusBadge status={sub.status} />
        </td>

        {/* Actions */}
        <td className="px-4 py-3.5 text-right"
          onClick={(e) => e.stopPropagation()}>
          {sub.status === "pending" ? (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onApprove(sub)}
                className="rounded-lg bg-emerald-500/10 border border-emerald-500/30
                  px-3 py-1.5 text-[12px] font-bold text-emerald-400
                  hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => onReject(sub)}
                className="rounded-lg bg-red-500/10 border border-red-500/30
                  px-3 py-1.5 text-[12px] font-bold text-red-400
                  hover:bg-red-500/20 hover:border-red-500/50 transition-all"
              >
                Reject
              </button>
            </div>
          ) : (
            <span className="text-[12px] text-slate-700">—</span>
          )}
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="border-b border-slate-800/40 bg-slate-900/60">
          <td colSpan={6} className="px-6 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
              <DetailItem
                label="School"
                value={sub.school?.name ?? "Will be created on approval"}
              />
              <DetailItem
                label="School Email"
                value={sub.school?.email ?? sub.requestingUserEmail ?? "—"}
              />
              <DetailItem label="Start Date"   value={fmtDate(sub.startDate)} />
              <DetailItem label="End Date"     value={fmtDate(sub.endDate)} />
              <DetailItem
                label="Max Students"
                value={
                  sub.plan?.features?.maxStudents >= 99999
                    ? "Unlimited"
                    : String(sub.plan?.features?.maxStudents ?? "—")
                }
              />
              <DetailItem
                label="Storage"
                value={
                  sub.plan?.features?.storageGB
                    ? `${sub.plan.features.storageGB} GB`
                    : "—"
                }
              />
              {sub.approvedAt  && <DetailItem label="Approved At"  value={fmtDate(sub.approvedAt)} />}
              {sub.rejectedAt  && <DetailItem label="Rejected At"  value={fmtDate(sub.rejectedAt)} />}
              {sub.rejectReason&& <DetailItem label="Reject Reason"value={sub.rejectReason} />}
              {sub.cancelledAt && <DetailItem label="Cancelled At" value={fmtDate(sub.cancelledAt)} />}
            </div>

            {/* Feature pills */}
            {sub.plan?.features && (
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { key: "hasQRAttendance",  label: "QR Attendance" },
                  { key: "hasOnlinePayment", label: "Online Payment" },
                  { key: "hasCRM",           label: "CRM" },
                  { key: "hasDocumentUpload",label: "Document Upload" },
                  { key: "hasTimetable",     label: "Timetable" },
                  { key: "hasNotifications", label: "Notifications" },
                ].map(({ key, label }) => {
                  const enabled =
                    sub.plan.features[key as keyof PlanFeatures] as boolean;
                  return (
                    <span
                      key={key}
                      className={[
                        "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        enabled
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-slate-700 bg-slate-800 text-slate-600",
                      ].join(" ")}
                    >
                      {enabled ? "✓" : "✕"} {label}
                    </span>
                  );
                })}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, accent, icon,
}: {
  label: string; value: number; accent: string; icon: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4
      flex items-center gap-4">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest
          text-slate-600 mb-0.5">{label}</div>
        <div className={`text-2xl font-extrabold ${accent}`}>{value}</div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, ok, onDone }: { msg: string; ok: boolean; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={[
      "fixed top-5 left-1/2 z-60 -translate-x-1/2 flex items-center gap-3",
      "rounded-xl border px-5 py-3 text-[13px] font-semibold shadow-2xl",
      "animate-in fade-in slide-in-from-top-2 duration-200",
      ok
        ? "border-emerald-700 bg-emerald-950 text-emerald-300"
        : "border-red-800 bg-red-950 text-red-300",
    ].join(" ")}>
      <span>{ok ? "✅" : "❌"}</span>
      <span>{msg}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SuperAdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>("all");
  const [search,        setSearch]        = useState("");
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [modalSub,    setModalSub]    = useState<Subscription | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs  = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await axiosInstance.get(`/api/subscriptions/all${qs}`);
      setSubscriptions(res.data?.data ?? []);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Failed to load subscriptions.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!modalSub) return;
    setActionLoading(true);
    try {
      await axiosInstance.post(`/api/subscriptions/approve/${modalSub._id}`);
      setToast({ msg: `Subscription approved for ${modalSub.requestingUserEmail}`, ok: true });
      setModalAction(null);
      setModalSub(null);
      fetchSubscriptions();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Approval failed.";
      setToast({ msg, ok: false });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject ─────────────────────────────────────────────────────────────────
  const handleReject = async (reason?: string) => {
    if (!modalSub) return;
    setActionLoading(true);
    try {
      await axiosInstance.post(
        `/api/subscriptions/reject/${modalSub._id}`,
        { reason }
      );
      setToast({ msg: "Subscription rejected.", ok: true });
      setModalAction(null);
      setModalSub(null);
      fetchSubscriptions();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Rejection failed.";
      setToast({ msg, ok: false });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Derived counts ─────────────────────────────────────────────────────────
  const counts = {
    all:       subscriptions.length,
    pending:   subscriptions.filter((s) => s.status === "pending").length,
    active:    subscriptions.filter((s) => s.status === "active").length,
    rejected:  subscriptions.filter((s) => s.status === "rejected").length,
    cancelled: subscriptions.filter((s) => s.status === "cancelled").length,
    expired:   subscriptions.filter((s) => s.status === "expired").length,
  };

  const filtered = subscriptions.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.requestingUserEmail?.toLowerCase().includes(q) ||
      s.requestingUserName?.toLowerCase().includes(q)  ||
      s.plan?.name?.toLowerCase().includes(q)          ||
      s.transactionId?.toLowerCase().includes(q)       ||
      s.school?.name?.toLowerCase().includes(q)
    );
  });

  const FILTERS: { key: StatusFilter; label: string }[] = [
    { key: "all",       label: `All (${counts.all})` },
    { key: "pending",   label: `Pending (${counts.pending})` },
    { key: "active",    label: `Active (${counts.active})` },
    { key: "rejected",  label: `Rejected (${counts.rejected})` },
    { key: "cancelled", label: `Cancelled (${counts.cancelled})` },
    { key: "expired",   label: `Expired (${counts.expired})` },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 pb-24 pt-10
      font-sans text-slate-200">

      {/* Toast */}
      {toast && (
        <Toast
          msg={toast.msg}
          ok={toast.ok}
          onDone={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.15em]
            text-teal-500">
            Superadmin
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-100">
            Subscriptions
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Review requests, approve or reject, and monitor all school plans.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSubscriptions}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-700
            px-4 py-2 text-[13px] text-slate-400 hover:border-slate-500
            hover:text-slate-300 transition-all disabled:opacity-40"
        >
          <span className={loading ? "animate-spin" : ""}>↻</span>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Pending"   value={counts.pending}   accent="text-amber-400"   icon="⏳" />
        <StatCard label="Active"    value={counts.active}    accent="text-emerald-400" icon="✅" />
        <StatCard label="Rejected"  value={counts.rejected}  accent="text-red-400"     icon="❌" />
        <StatCard label="Cancelled" value={counts.cancelled} accent="text-slate-400"   icon="🚫" />
        <StatCard label="Expired"   value={counts.expired}   accent="text-slate-500"   icon="⌛" />
      </div>

      {/* Pending alert banner */}
      {counts.pending > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border
          border-amber-500/30 bg-amber-500/5 px-5 py-3.5">
          <span className="text-amber-400 text-lg">⚠️</span>
          <span className="text-[13px] text-amber-300 font-semibold">
            {counts.pending} subscription request{counts.pending > 1 ? "s" : ""} awaiting your review.
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className="ml-auto text-[12px] text-amber-400 hover:underline font-semibold"
          >
            View pending →
          </button>
        </div>
      )}

      {/* Filters + Search */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={[
                "rounded-lg border px-3.5 py-1.5 text-[12px] font-semibold transition-all",
                statusFilter === key
                  ? "border-teal-500 bg-teal-950 text-teal-400"
                  : "border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-600 hover:text-slate-400",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 rounded-lg border
          border-slate-800 bg-slate-900 px-3.5 py-2 w-full sm:w-64
          focus-within:border-teal-600 transition-colors">
          <span className="text-slate-600 text-[12px]">🔍</span>
          <input
            type="text"
            placeholder="Search email, name, plan, txn…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-[13px] text-slate-200
              placeholder-slate-600 outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-slate-600 hover:text-slate-400 text-[12px]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border
          border-red-900 bg-red-950/40 px-4 py-3 text-[13px] text-red-400">
          <span>⚠️</span>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto text-red-800 hover:text-red-600"
          >✕</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-teal-500
              border-t-transparent animate-spin" />
            <span className="text-slate-600 text-[13px]">
              Loading subscriptions…
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-slate-400 text-[15px] font-semibold mb-1">
              No subscriptions found
            </div>
            <div className="text-slate-600 text-[13px]">
              {search
                ? "Try a different search term."
                : statusFilter !== "all"
                  ? `No ${statusFilter} subscriptions.`
                  : "No subscriptions yet."}
            </div>
            {(search || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => { setSearch(""); setStatusFilter("all"); }}
                className="mt-4 text-[12px] text-teal-500 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-175">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60">
                  {[
                    { label: "Requester", cls: "" },
                    { label: "Plan",      cls: "hidden sm:table-cell" },
                    { label: "Payment",   cls: "hidden md:table-cell" },
                    { label: "Requested", cls: "hidden lg:table-cell" },
                    { label: "Status",    cls: "" },
                    { label: "Actions",   cls: "text-right" },
                  ].map(({ label, cls }) => (
                    <th
                      key={label}
                      className={`px-4 py-3.5 text-left text-[11px] font-bold
                        uppercase tracking-widest text-slate-600 ${cls}`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <SubRow
                    key={sub._id}
                    sub={sub}
                    onApprove={(s) => { setModalSub(s); setModalAction("approve"); }}
                    onReject={(s)  => { setModalSub(s); setModalAction("reject"); }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer */}
        {!loading && filtered.length > 0 && (
          <div className="border-t border-slate-800 px-5 py-3 text-[12px] text-slate-600">
            Showing {filtered.length} of {subscriptions.length} subscription
            {subscriptions.length !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
            {" · "}Click any row to expand details
            {" · "}Actions only available for pending requests
          </div>
        )}
      </div>

      {/* Modal */}
      <ActionModal
        action={modalAction}
        subscription={modalSub}
        loading={actionLoading}
        onClose={() => { setModalAction(null); setModalSub(null); }}
        onConfirm={(reason) => {
          if (modalAction === "approve") handleApprove();
          else handleReject(reason);
        }}
      />
    </div>
  );
}