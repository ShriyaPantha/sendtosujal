import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

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
  description: string;
  features: PlanFeatures;
  isActive: boolean;
  isFallback?: boolean;
}

interface PaymentMethod {
  id: string;
  label: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  textColorClass: string;
  logo: string;
  paymentId: string;
  merchantQRImageUrl: string;
  instructions: string[];
}

// ─── Fallback plans ───────────────────────────────────────────────────────────

const FALLBACK_PLANS: Plan[] = [
  {
    _id: "000000000000000000000001",
    name: "basic",
    price: 2000,
    description: "Perfect for small schools",
    isActive: true,
    isFallback: true,
    features: {
      maxStudents: 200, maxTeachers: 15, maxAdmins: 1,
      hasQRAttendance: false, hasOnlinePayment: false, hasCRM: false,
      hasDocumentUpload: false, hasTimetable: true, hasNotifications: true,
      storageGB: 2,
    },
  },
  {
    _id: "000000000000000000000002",
    name: "standard",
    price: 5000,
    description: "For growing schools",
    isActive: true,
    isFallback: true,
    features: {
      maxStudents: 500, maxTeachers: 40, maxAdmins: 3,
      hasQRAttendance: true, hasOnlinePayment: true, hasCRM: false,
      hasDocumentUpload: true, hasTimetable: true, hasNotifications: true,
      storageGB: 10,
    },
  },
  {
    _id: "000000000000000000000003",
    name: "premium",
    price: 10000,
    description: "Full featured for large schools",
    isActive: true,
    isFallback: true,
    features: {
      maxStudents: 99999, maxTeachers: 99999, maxAdmins: 99999,
      hasQRAttendance: true, hasOnlinePayment: true, hasCRM: true,
      hasDocumentUpload: true, hasTimetable: true, hasNotifications: true,
      storageGB: 100,
    },
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "esewa",
    label: "eSewa",
    colorClass: "text-green-400",
    borderClass: "border-green-500",
    bgClass: "bg-green-500/10",
    textColorClass: "text-green-400",
    logo: "💚",
    paymentId: "9711111111",
    merchantQRImageUrl: "https://yourdomain.com/qr/esewa-merchant-qr.png",
    instructions: [
      "Open eSewa app → tap the QR scanner icon",
      "Scan the QR above — enter the exact amount shown",
      "Copy the **Transaction Code** from the receipt",
    ],
  },
];

const MONTH_OPTIONS = [1, 3, 6, 12];

// ─── Utilities ────────────────────────────────────────────────────────────────

const fmt = (n: number) => `Rs ${Number(n).toLocaleString("ne-NP")}`;

const PLAN_META: Record<string, { accent: string; gradient: string; ring: string }> = {
  basic:    { accent: "text-teal-400",   gradient: "from-teal-950 to-slate-950",   ring: "ring-teal-500" },
  standard: { accent: "text-amber-400",  gradient: "from-amber-950 to-slate-950",  ring: "ring-amber-500" },
  premium:  { accent: "text-violet-400", gradient: "from-violet-950 to-slate-950", ring: "ring-violet-500" },
};

const getPlanMeta = (name: string) =>
  PLAN_META[name] ?? { accent: "text-slate-400", gradient: "from-slate-800 to-slate-950", ring: "ring-slate-500" };

// ─── QR Code ─────────────────────────────────────────────────────────────────

function QRCode({ data, size = 140, label }: { data: string; size?: number; label?: string }) {
  const encoded = encodeURIComponent(data);
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=0a0f1e&color=e2e8f0&margin=8`;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-xl border border-slate-800 bg-[#0a0f1e] p-1 shadow-xl shadow-black/40">
        <img src={url} alt={`QR for ${label ?? "payment"}`} width={size} height={size} className="rounded-lg block" />
      </div>
      {label && <span className="text-[11px] text-slate-500 tracking-wide">{label}</span>}
    </div>
  );
}

// ─── FeatureRow ───────────────────────────────────────────────────────────────

function FeatureRow({ label, value }: { label: string; value: boolean | number | string }) {
  const text =
    typeof value === "boolean" ? null
    : typeof value === "number" && value >= 99999 ? "Unlimited"
    : typeof value === "number" ? value.toLocaleString()
    : value;

  const isOff = value === false;

  return (
    <div className="flex items-center gap-2 py-1 text-[13px]">
      <span className={`text-sm min-w-4.5 ${isOff ? "text-red-500" : "text-green-500"}`}>
        {isOff ? "✗" : "✓"}
      </span>
      <span className={`flex-1 ${isOff ? "text-slate-600" : "text-slate-300"}`}>{label}</span>
      {text && <span className="text-slate-400 tabular-nums">{text}</span>}
    </div>
  );
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan, selected, onSelect, months,
}: {
  plan: Plan; selected: boolean; onSelect: (p: Plan) => void; months: number;
}) {
  const meta = getPlanMeta(plan.name);
  const isPopular = plan.name === "standard";
  const total = plan.price * months;

  return (
    <button
      type="button"
      onClick={() => onSelect(plan)}
      className={[
        "relative flex flex-col gap-4 rounded-2xl bg-linear-to-br p-7 text-left transition-all duration-200 w-full font-sans",
        meta.gradient,
        selected
          ? `ring-2 ${meta.ring} -translate-y-1 shadow-2xl`
          : "ring-1 ring-slate-800 hover:-translate-y-0.5 hover:ring-slate-600",
      ].join(" ")}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-3.5 py-0.5 text-[11px] font-black tracking-widest text-black pointer-events-none">
          MOST POPULAR
        </div>
      )}

      {/* Price row */}
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-[11px] font-bold tracking-[0.12em] uppercase mb-1 ${meta.accent}`}>
            {plan.name}
          </div>
          <div className="text-[26px] font-extrabold text-slate-100 tracking-tight">
            {fmt(plan.price)}
            <span className="text-[13px] font-normal text-slate-400">/mo</span>
          </div>
          {months > 1 && (
            <div className="text-xs text-slate-400 mt-0.5">
              {fmt(total)} total for {months} months
            </div>
          )}
        </div>

        {/* Radio circle */}
        <div
          className={[
            "h-9 w-9 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-200 pointer-events-none",
            selected ? `border-current bg-current ${meta.accent}` : "border-slate-700 bg-transparent",
          ].join(" ")}
        >
          {selected && <span className="text-black text-sm font-bold">✓</span>}
        </div>
      </div>

      <p className="text-[13px] text-slate-400 m-0">{plan.description}</p>

      {/* Features */}
      <div className="border-t border-slate-800 pt-3.5 flex flex-col gap-0.5">
        <FeatureRow label="Students"        value={plan.features.maxStudents} />
        <FeatureRow label="Teachers"        value={plan.features.maxTeachers} />
        <FeatureRow label="Admins"          value={plan.features.maxAdmins} />
        <FeatureRow label="QR Attendance"   value={plan.features.hasQRAttendance} />
        <FeatureRow label="Online Payment"  value={plan.features.hasOnlinePayment} />
        <FeatureRow label="CRM"             value={plan.features.hasCRM} />
        <FeatureRow label="Document Upload" value={plan.features.hasDocumentUpload} />
        <FeatureRow label="Timetable"       value={plan.features.hasTimetable} />
        <FeatureRow label="Notifications"   value={plan.features.hasNotifications} />
        <FeatureRow label="Storage"         value={`${plan.features.storageGB} GB`} />
      </div>
    </button>
  );
}

// ─── PayMethodBtn ─────────────────────────────────────────────────────────────

function PayMethodBtn({
  method, selected, onClick,
}: {
  method: PaymentMethod; selected: boolean; onClick: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(method.id)}
      className={[
        "flex flex-1 min-w-25 items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] transition-all duration-200 font-sans",
        selected
          ? `${method.bgClass} ${method.borderClass} ${method.textColorClass} font-semibold`
          : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600",
      ].join(" ")}
    >
      <span className="text-lg">{method.logo}</span>
      {method.label}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlanSubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [months, setMonths] = useState(1);
  const [payMethod, setPayMethod] = useState("esewa");
  const [txnId, setTxnId] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [apiError, setApiError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const usingFallback = plans.length > 0 && plans[0].isFallback === true;

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/api/subscriptions/plans");
        const payload = res.data;
        const list: Plan[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data) ? payload.data : [];
        setPlans(list.length > 0 ? list : FALLBACK_PLANS);
        if (list.length === 0) {
          setApiError("Could not load plans from server — showing default plans. Contact support to subscribe.");
        }
      } catch (err: unknown) {
        setPlans(FALLBACK_PLANS);
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          ?? "Could not reach server — showing default plans.";
        setApiError(`${msg} Contact support to subscribe.`);
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setSubmitError("");
    if (selectedPlan?.isFallback) {
      setSubmitError("Plans could not be loaded from the server. Please refresh or contact support.");
      return;
    }
    if (!txnId.trim()) {
      setSubmitError("Please enter your transaction / reference ID.");
      return;
    }
    setLoading(true);
    try {
      // schoolId is now derived server-side from the authenticated user's email
      await axiosInstance.post("/api/subscriptions/request", {
        planId: selectedPlan!._id,
        months,
        paymentMethod: payMethod,
        transactionId: txnId.trim(),
      });
      setSuccess(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Submission failed. Try again.";
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const total = selectedPlan ? selectedPlan.price * months : 0;
  const meta = selectedPlan ? getPlanMeta(selectedPlan.name) : getPlanMeta("basic");
  const activeMethod = PAYMENT_METHODS.find((m) => m.id === payMethod) ?? PAYMENT_METHODS[0];

  // ── Success ──────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] px-5 py-20 font-sans text-slate-200 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-14 text-center">
          <div className="text-6xl mb-5">✅</div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3">Request Submitted!</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            Your <strong className="text-slate-100">{selectedPlan?.name?.toUpperCase()}</strong> plan
            request for <strong className="text-slate-100">{months} month{months > 1 ? "s" : ""}</strong>{" "}
            has been sent to the superadmin for review. You'll receive an email once it's approved.
          </p>
          <button
            type="button"
            onClick={() => { setSuccess(false); setStep(1); setTxnId(""); }}
            className="w-full rounded-xl bg-teal-500 py-3.5 text-[15px] font-bold text-black hover:bg-teal-400 transition-colors"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-slate-500 text-[15px]">Loading plans…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] px-5 pb-20 pt-12 font-sans text-slate-200">

      {/* ── Header ── */}
      <div className="mb-10 text-center">
        <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-teal-500">
          School Management Platform
        </div>
        <h1 className="mb-2.5 text-[32px] font-extrabold tracking-tight text-slate-100">
          {step === 1 ? "Choose your plan" : "Complete payment"}
        </h1>
        <p className="text-[14px] text-slate-500">
          {step === 1
            ? "Select the plan that fits your school. You can upgrade anytime."
            : "Scan the QR or use the ID below, then enter your transaction reference."}
        </p>

        {/* Step indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {([1, 2] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={[
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  step >= s ? "bg-teal-500 text-black" : "bg-slate-800 text-slate-500",
                ].join(" ")}
              >
                {s}
              </div>
              <span className={`text-xs ${step === s ? "text-slate-200" : "text-slate-600"}`}>
                {s === 1 ? "Select Plan" : "Payment"}
              </span>
              {s < 2 && (
                <div className={`h-px w-10 ${step > s ? "bg-teal-500" : "bg-slate-800"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── API warning ── */}
      {apiError && (
        <div className="mx-auto mb-6 flex max-w-2xl items-center gap-2.5 rounded-xl border border-amber-900 bg-amber-950/40 px-4 py-2.5 text-[13px] text-amber-400">
          <span>⚠️</span>
          <span className="flex-1">{apiError}</span>
          <button
            type="button"
            onClick={() => setApiError("")}
            className="ml-auto text-amber-800 hover:text-amber-600 text-base leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Step 1 ── */}
      {step === 1 && (
        <>
          {/* Duration tabs */}
          <div className="mb-9 flex justify-center gap-2 flex-wrap">
            {MONTH_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonths(m)}
                className={[
                  "relative rounded-lg border px-5 py-1.5 text-[13px] transition-all duration-150 font-sans",
                  months === m
                    ? "border-teal-500 bg-teal-950 text-teal-400 font-bold"
                    : "border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-600",
                ].join(" ")}
              >
                {m} mo{m > 1 ? "s" : ""}
                {m >= 6 && (
                  <span className="absolute -top-2 -right-1 rounded-md bg-amber-400 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-black pointer-events-none">
                    SAVE
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Plan grid */}
          <div className="mx-auto grid max-w-5xl gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => (
              <PlanCard
                key={p._id}
                plan={p}
                selected={selectedPlan?._id === p._id}
                onSelect={setSelectedPlan}
                months={months}
              />
            ))}
          </div>

          {/* Selected plan banner */}
          {selectedPlan ? (
            <div className={`mx-auto mt-5 max-w-5xl flex items-center justify-between rounded-xl border bg-emerald-950/40 px-5 py-3 text-sm ${meta.ring.replace("ring", "border")}`}>
              <span className="text-slate-400">
                Selected:{" "}
                <strong className={meta.accent}>{selectedPlan.name.toUpperCase()}</strong>
                {" · "}{months} month{months > 1 ? "s" : ""}
                {" · "}<strong className="text-slate-100">{fmt(total)}</strong>
              </span>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`rounded-lg px-6 py-2 text-sm font-bold text-black transition-opacity hover:opacity-90 bg-teal-400`}
              >
                Continue →
              </button>
            </div>
          ) : (
            <p className="mt-6 text-center text-[13px] text-slate-600">
              👆 Click a plan card above to select it
            </p>
          )}
        </>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && selectedPlan && (
        <div className="mx-auto flex max-w-lg flex-col gap-5">

          {/* Fallback warning */}
          {usingFallback && (
            <div className="flex items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3.5 text-[13px] text-red-300">
              <span className="text-lg">🚫</span>
              <div>
                <strong className="mb-1 block text-red-400">Server plans unavailable</strong>
                Plans were loaded from a local fallback and don't have valid IDs. Please refresh the page to retry, or contact support.
              </div>
            </div>
          )}

          {/* Summary card */}
          <div className={`rounded-2xl bg-linear-to-br ${meta.gradient} border ${meta.ring.replace("ring", "border")} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-[11px] font-bold uppercase tracking-[0.12em] mb-1 ${meta.accent}`}>
                  {selectedPlan.name} plan · {months} month{months > 1 ? "s" : ""}
                </div>
                <div className="text-[28px] font-extrabold tracking-tight text-slate-100">{fmt(total)}</div>
                <div className="mt-0.5 text-xs text-slate-400">{fmt(selectedPlan.price)}/month × {months}</div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-500 transition-colors"
              >
                ← Change plan
              </button>
            </div>
          </div>

          {/* Payment method */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <span className="mb-3.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Payment method
            </span>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((m) => (
                <PayMethodBtn key={m.id} method={m} selected={payMethod === m.id} onClick={setPayMethod} />
              ))}
            </div>
          </div>

          {/* QR panel */}
          <div className="rounded-2xl border border-green-900/40 bg-slate-900/80 p-6">
            <span className="mb-4 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Scan to pay · {activeMethod.label}
            </span>
            <div className="mb-5 flex flex-wrap items-start gap-6">
              <QRCode data={`${activeMethod.merchantQRImageUrl}${total}`} size={140} label="Scan with app" />
              <div className="flex flex-1 min-w-40 flex-col gap-4">
                <div>
                  <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Merchant / ID
                  </div>
                  <div className="rounded-lg border border-green-900/40 bg-green-500/5 px-3.5 py-2.5 font-mono text-[15px] font-bold text-green-400 tracking-wide break-all">
                    {activeMethod.paymentId}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Amount to pay
                  </div>
                  <div className="font-mono text-[22px] font-extrabold tracking-tight text-slate-100">
                    {fmt(total)}
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="border-t border-slate-800 pt-4">
              <div className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                How to pay
              </div>
              <ol className="list-decimal pl-5 text-[13px] text-slate-400 leading-8 space-y-0.5">
                {activeMethod.instructions.map((instr, i) => (
                  <li
                    key={i}
                    dangerouslySetInnerHTML={{
                      __html: instr.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>'),
                    }}
                  />
                ))}
              </ol>
            </div>
          </div>

          {/* Transaction ID */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <label className="mb-3.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Transaction / Reference ID
            </label>
            <input
              type="text"
              placeholder="e.g. 0062ABC789"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              disabled={usingFallback}
              className="w-full rounded-lg border border-slate-800 bg-[#0a0f1e] px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-teal-600 transition-colors disabled:opacity-40"
            />
            <p className="mt-2 text-xs text-slate-600">
              Your request goes to the superadmin for review. You'll be notified by email once approved.
            </p>
          </div>

          {submitError && (
            <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-2.5 text-center text-[13px] text-red-400">
              {submitError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || usingFallback}
            className={[
              "w-full rounded-xl py-3.5 text-[15px] font-bold tracking-wide transition-all",
              loading || usingFallback
                ? "cursor-not-allowed bg-slate-800 text-slate-600"
                : "cursor-pointer bg-teal-400 text-black hover:bg-teal-300",
            ].join(" ")}
          >
            {loading
              ? "Submitting…"
              : usingFallback
              ? "Server unavailable — cannot submit"
              : `Submit request — ${fmt(total)}`}
          </button>
        </div>
      )}

      <p className="mt-12 text-center text-xs text-slate-700">
        Plans auto-renew. Cancel anytime from settings. All prices in Nepali Rupees (NPR).
      </p>
    </div>
  );
}