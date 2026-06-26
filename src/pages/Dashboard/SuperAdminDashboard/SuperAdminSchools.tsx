import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../api/axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  _id: string;
  name: string;
  price: number;
  features: {
    maxStudents: number;
    maxTeachers: number;
    maxAdmins: number;
    storageGB: number;
    hasQRAttendance: boolean;
    hasOnlinePayment: boolean;
    hasCRM: boolean;
    hasDocumentUpload: boolean;
    hasTimetable: boolean;
    hasNotifications: boolean;
  };
}

interface Subscription {
  _id: string;
  plan: Plan;
  status: string;
  months: number;
  totalAmount: number;
  startDate: string;
  endDate: string;
  paymentMethod: string;
  transactionId: string;
}

interface Admin {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

interface School {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  activePlan?: Plan;
  subscriptionStatus?: string;
  subscriptionEndDate?: string;
  createdAt: string;
  admins?: Admin[];
  subscription?: Subscription;
}

type ModalType = "create_admin" | "view_school" | "edit_school" | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `Rs ${Number(n).toLocaleString("ne-NP")}`;

const fmtDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-NP", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const daysLeft = (end?: string) => {
  if (!end) return null;
  const diff = new Date(end).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const PLAN_BADGE: Record<string, string> = {
  basic: "bg-teal-400/10 border-teal-400/30 text-teal-400",
  standard: "bg-amber-400/10 border-amber-400/30 text-amber-400",
  premium: "bg-violet-400/10 border-violet-400/30 text-violet-400",
};

const SUB_STATUS: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  cancelled: "text-slate-400 bg-slate-400/10 border-slate-400/30",
  expired: "text-red-400 bg-red-400/10 border-red-400/30",
};

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  msg,
  ok,
  onDone,
}: {
  msg: string;
  ok: boolean;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={[
        "fixed top-5 left-1/2 z-70 -translate-x-1/2 flex items-center gap-3",
        "rounded-xl border px-5 py-3 text-[13px] font-semibold shadow-2xl",
        ok
          ? "border-emerald-700 bg-emerald-950 text-emerald-300"
          : "border-red-800 bg-red-950 text-red-300",
      ].join(" ")}
    >
      <span>{ok ? "✅" : "❌"}</span>
      <span>{msg}</span>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div
        className="text-[10px] font-bold uppercase tracking-widest
        text-slate-600 mb-0.5"
      >
        {label}
      </div>
      <div
        className={`text-[13px] text-slate-300 break-all
        ${mono ? "font-mono" : ""}`}
      >
        {value || "—"}
      </div>
    </div>
  );
}

// ─── Create Admin Modal ───────────────────────────────────────────────────────

function CreateAdminModal({
  school,
  loading,
  onSubmit,
  onClose,
}: {
  school: School;
  loading: boolean;
  onSubmit: (data: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
  }) => void;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Min 6 characters";
    if (!phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit({ fullName, email, password, phone });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
      bg-black/75 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-800
        bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="border-b border-slate-800 px-6 py-5 flex items-center
          justify-between"
        >
          <div>
            <h2 className="text-[16px] font-bold text-slate-100">
              Create Admin
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              For{" "}
              <span className="text-slate-300 font-semibold">
                {school.name}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-400 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Subscription limits */}
        {/* Subscription limits */}
        {school.activePlan?.features ? (
          <div
            className="mx-6 mt-4 rounded-xl border border-slate-800
    bg-slate-950 px-4 py-3 text-[12px]"
          >
            <div
              className="text-slate-500 mb-2 font-semibold uppercase
      tracking-widest text-[10px]"
            >
              Plan Limits
            </div>
            <div className="flex gap-6 text-slate-400">
              <span>
                👤 Max admins:{" "}
                <strong className="text-slate-200">
                  {(school.activePlan.features.maxAdmins ?? 0) >= 99999
                    ? "Unlimited"
                    : (school.activePlan.features.maxAdmins ?? "—")}
                </strong>
              </span>
              <span>
                🏫 Plan:{" "}
                <strong
                  className={
                    PLAN_BADGE[school.activePlan.name]
                      ?.split(" ")
                      .find((c) => c.startsWith("text-")) ?? "text-slate-200"
                  }
                >
                  {school.activePlan.name.toUpperCase()}
                </strong>
              </span>
            </div>
          </div>
        ) : (
          <div
            className="mx-6 mt-4 rounded-xl border border-amber-800/30
    bg-amber-950/20 px-4 py-3 text-[12px] text-amber-400"
          >
            ⚠️ No active plan found for this school.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Full name */}
          <div>
            <label
              className="block text-[11px] font-bold uppercase
              tracking-widest text-slate-500 mb-1.5"
            >
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full rounded-xl border bg-slate-950 px-4 py-2.5
                text-[13px] text-slate-200 placeholder-slate-600 outline-none
                transition-colors ${
                  errors.fullName
                    ? "border-red-600"
                    : "border-slate-800 focus:border-teal-600"
                }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-[11px] text-red-400">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              className="block text-[11px] font-bold uppercase
              tracking-widest text-slate-500 mb-1.5"
            >
              Email
            </label>
            <input
              type="email"
              placeholder="admin@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl border bg-slate-950 px-4 py-2.5
                text-[13px] text-slate-200 placeholder-slate-600 outline-none
                transition-colors ${
                  errors.email
                    ? "border-red-600"
                    : "border-slate-800 focus:border-teal-600"
                }`}
            />
            {errors.email && (
              <p className="mt-1 text-[11px] text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              className="block text-[11px] font-bold uppercase
              tracking-widest text-slate-500 mb-1.5"
            >
              Phone
            </label>
            <input
              type="tel"
              placeholder="98XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full rounded-xl border bg-slate-950 px-4 py-2.5
                text-[13px] text-slate-200 placeholder-slate-600 outline-none
                transition-colors ${
                  errors.phone
                    ? "border-red-600"
                    : "border-slate-800 focus:border-teal-600"
                }`}
            />
            {errors.phone && (
              <p className="mt-1 text-[11px] text-red-400">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-[11px] font-bold uppercase
              tracking-widest text-slate-500 mb-1.5"
            >
              Password
            </label>
            <div
              className={`flex items-center rounded-xl border bg-slate-950
              transition-colors ${
                errors.password
                  ? "border-red-600"
                  : "border-slate-800 focus-within:border-teal-600"
              }`}
            >
              <input
                type={showPass ? "text" : "password"}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent px-4 py-2.5 text-[13px]
                  text-slate-200 placeholder-slate-600 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="pr-4 text-slate-600 hover:text-slate-400 text-[13px]"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-[11px] text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-700 py-2.5
                text-[13px] font-semibold text-slate-400 hover:border-slate-500
                transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-teal-500 py-2.5 text-[13px]
                font-bold text-black hover:bg-teal-400 transition-all
                disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit School Modal ────────────────────────────────────────────────────────

function EditSchoolModal({
  school,
  loading,
  onSubmit,
  onClose,
}: {
  school: School;
  loading: boolean;
  onSubmit: (data: { name: string; phone: string; address: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(school.name);
  const [phone, setPhone] = useState(school.phone);
  const [address, setAddress] = useState(school.address);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "School name is required";
    if (!phone.trim()) e.phone = "Phone is required";
    if (!address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit({ name, phone, address });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
      bg-black/75 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-800
        bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="border-b border-slate-800 px-6 py-5 flex items-center
          justify-between"
        >
          <div>
            <h2 className="text-[16px] font-bold text-slate-100">
              Edit School
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Update details for{" "}
              <span className="text-slate-300 font-semibold">
                {school.name}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-400 text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {[
            {
              label: "School Name",
              value: name,
              set: setName,
              key: "name",
              placeholder: "School name",
              type: "text",
            },
            {
              label: "Phone",
              value: phone,
              set: setPhone,
              key: "phone",
              placeholder: "98XXXXXXXX",
              type: "tel",
            },
            {
              label: "Address",
              value: address,
              set: setAddress,
              key: "address",
              placeholder: "City, District",
              type: "text",
            },
          ].map(({ label, value, set, key, placeholder, type }) => (
            <div key={key}>
              <label
                className="block text-[11px] font-bold uppercase
                tracking-widest text-slate-500 mb-1.5"
              >
                {label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => set(e.target.value)}
                className={`w-full rounded-xl border bg-slate-950 px-4 py-2.5
                  text-[13px] text-slate-200 placeholder-slate-600 outline-none
                  transition-colors ${
                    errors[key]
                      ? "border-red-600"
                      : "border-slate-800 focus:border-teal-600"
                  }`}
              />
              {errors[key] && (
                <p className="mt-1 text-[11px] text-red-400">{errors[key]}</p>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-700 py-2.5
                text-[13px] font-semibold text-slate-400 hover:border-slate-500
                transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-teal-500 py-2.5 text-[13px]
                font-bold text-black hover:bg-teal-400 transition-all
                disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── School Detail Modal ──────────────────────────────────────────────────────

function SchoolDetailModal({
  school,
  onClose,
  onCreateAdmin,
  onEditSchool,
  onToggleActive,
  actionLoading,
}: {
  school: School;
  onClose: () => void;
  onCreateAdmin: () => void;
  onEditSchool: () => void;
  onToggleActive: (id: string, current: boolean) => void;
  actionLoading: boolean;
}) {
  const days = daysLeft(school.subscriptionEndDate);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
      bg-black/75 backdrop-blur-sm px-4 py-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-800
        bg-slate-900 shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="border-b border-slate-800 px-6 py-5 flex items-start
          justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl
              bg-teal-500/10 border border-teal-500/20 text-xl font-bold
              text-teal-400"
            >
              {school.name[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-slate-100">
                {school.name}
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                {school.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-400 text-lg shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Subscription status banner */}
          {days !== null && (
            <div
              className={[
                "rounded-xl border px-4 py-3 text-[13px] font-semibold",
                days <= 7
                  ? "border-red-500/30 bg-red-500/5 text-red-400"
                  : days <= 30
                    ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
                    : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
              ].join(" ")}
            >
              {days === 0
                ? "⚠️ Subscription expired today"
                : days <= 7
                  ? `⚠️ Subscription expires in ${days} day${days !== 1 ? "s" : ""}`
                  : days <= 30
                    ? `⏰ Subscription expires in ${days} days`
                    : `✅ Subscription active — ${days} days remaining`}
            </div>
          )}

          {/* School info */}
          <section>
            <h3
              className="text-[11px] font-bold uppercase tracking-widest
              text-slate-600 mb-3"
            >
              School Info
            </h3>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-xl
              border border-slate-800 bg-slate-950 p-4"
            >
              <Field label="Name" value={school.name} />
              <Field label="Email" value={school.email} />
              <Field label="Phone" value={school.phone} />
              <Field label="Address" value={school.address} />
              <Field label="Created" value={fmtDate(school.createdAt)} />
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-widest
                  text-slate-600 mb-0.5"
                >
                  Status
                </div>
                <span
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5",
                    "py-0.5 text-[11px] font-semibold",
                    school.isActive
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400",
                  ].join(" ")}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      school.isActive ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  />
                  {school.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </section>

          {/* Subscription */}
          {school.subscription && (
            <section>
              <h3
                className="text-[11px] font-bold uppercase tracking-widest
                text-slate-600 mb-3"
              >
                Subscription
              </h3>
              <div
                className="rounded-xl border border-slate-800 bg-slate-950
                divide-y divide-slate-800"
              >
                {[
                  {
                    label: "Plan",
                    value: school.subscription.plan?.name?.toUpperCase(),
                    badge: PLAN_BADGE[school.subscription.plan?.name],
                  },
                  {
                    label: "Status",
                    value: school.subscriptionStatus ?? "—",
                    badge: SUB_STATUS[school.subscriptionStatus ?? ""],
                  },
                  {
                    label: "Duration",
                    value: `${school.subscription.months} months`,
                  },
                  {
                    label: "Amount",
                    value: fmt(school.subscription.totalAmount),
                  },
                  {
                    label: "Start",
                    value: fmtDate(school.subscription.startDate),
                  },
                  {
                    label: "Expires",
                    value: fmtDate(school.subscriptionEndDate),
                  },
                  { label: "Method", value: school.subscription.paymentMethod },
                  {
                    label: "Txn ID",
                    value: school.subscription.transactionId,
                    mono: true,
                  },
                ].map(({ label, value, badge, mono }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-4 py-2.5 text-[13px]"
                  >
                    <span className="text-slate-500">{label}</span>
                    {badge ? (
                      <span
                        className={`inline-flex items-center rounded-full border
                        px-2.5 py-0.5 text-[11px] font-bold uppercase ${badge}`}
                      >
                        {value}
                      </span>
                    ) : (
                      <span
                        className={`text-slate-300 font-medium
                        ${mono ? "font-mono text-[12px]" : ""}`}
                      >
                        {value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Plan features */}
          {school.activePlan?.features && (
            <section>
              <h3
                className="text-[11px] font-bold uppercase tracking-widest
                text-slate-600 mb-3"
              >
                Plan Features
              </h3>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl
                border border-slate-800 bg-slate-950 p-4"
              >
                <Field
                  label="Max Students"
                  value={
                    school.activePlan.features.maxStudents >= 99999
                      ? "Unlimited"
                      : String(school.activePlan.features.maxStudents)
                  }
                />
                <Field
                  label="Max Teachers"
                  value={
                    school.activePlan.features.maxTeachers >= 99999
                      ? "Unlimited"
                      : String(school.activePlan.features.maxTeachers)
                  }
                />
                <Field
                  label="Max Admins"
                  value={
                    school.activePlan.features.maxAdmins >= 99999
                      ? "Unlimited"
                      : String(school.activePlan.features.maxAdmins)
                  }
                />
                <Field
                  label="Storage"
                  value={`${school.activePlan.features.storageGB} GB`}
                />
                <div className="col-span-2 sm:col-span-3">
                  <div
                    className="text-[10px] font-bold uppercase tracking-widest
                    text-slate-600 mb-2"
                  >
                    Features
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "hasQRAttendance", label: "QR Attendance" },
                      { key: "hasOnlinePayment", label: "Online Payment" },
                      { key: "hasCRM", label: "CRM" },
                      { key: "hasDocumentUpload", label: "Document Upload" },
                      { key: "hasTimetable", label: "Timetable" },
                      { key: "hasNotifications", label: "Notifications" },
                    ].map(({ key, label }) => {
                      const on = school.activePlan!.features[
                        key as keyof typeof school.activePlan.features
                      ] as boolean;
                      return (
                        <span
                          key={key}
                          className={[
                            "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                            on
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border-slate-700 bg-slate-800 text-slate-600",
                          ].join(" ")}
                        >
                          {on ? "✓" : "✕"} {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Admins */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3
                className="text-[11px] font-bold uppercase tracking-widest
                text-slate-600"
              >
                Admins ({school.admins?.length ?? 0})
              </h3>
              <button
                type="button"
                onClick={onCreateAdmin}
                className="rounded-lg bg-teal-500/10 border border-teal-500/30
                  px-3 py-1.5 text-[12px] font-bold text-teal-400
                  hover:bg-teal-500/20 transition-all"
              >
                + Add Admin
              </button>
            </div>

            {!school.admins?.length ? (
              <div
                className="rounded-xl border border-dashed border-slate-800
                py-8 text-center text-slate-600 text-[13px]"
              >
                No admins yet — add one to get started.
              </div>
            ) : (
              <div
                className="rounded-xl border border-slate-800 bg-slate-950
                divide-y divide-slate-800"
              >
                {school.admins.map((admin) => (
                  <div
                    key={admin._id}
                    className="flex items-center justify-between px-4 py-3 gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center
                        justify-center rounded-full bg-slate-800 text-[12px]
                        font-bold text-slate-400"
                      >
                        {admin.fullName[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-slate-200">
                          {admin.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {admin.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {admin.phone && (
                        <span className="text-[11px] text-slate-500 hidden sm:block">
                          {admin.phone}
                        </span>
                      )}
                      <span
                        className={[
                          "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                          admin.isActive
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-red-500/30 bg-red-500/10 text-red-400",
                        ].join(" ")}
                      >
                        {admin.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Danger zone */}
          <section className="rounded-xl border border-red-900/30 bg-red-950/10 p-4">
            <h3
              className="text-[11px] font-bold uppercase tracking-widest
              text-red-700 mb-3"
            >
              Danger Zone
            </h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-slate-300">
                  {school.isActive ? "Deactivate School" : "Activate School"}
                </div>
                <div className="text-[12px] text-slate-600 mt-0.5">
                  {school.isActive
                    ? "Disables login for all staff and students."
                    : "Re-enables access for this school."}
                </div>
              </div>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onToggleActive(school._id, school.isActive)}
                className={[
                  "rounded-xl border px-4 py-2 text-[12px] font-bold",
                  "transition-all shrink-0 disabled:opacity-50",
                  school.isActive
                    ? "border-red-700 bg-red-950 text-red-400 hover:bg-red-900"
                    : "border-emerald-700 bg-emerald-950 text-emerald-400 hover:bg-emerald-900",
                ].join(" ")}
              >
                {actionLoading
                  ? "Updating…"
                  : school.isActive
                    ? "Deactivate"
                    : "Activate"}
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div
          className="border-t border-slate-800 px-6 py-4 flex justify-between
          items-center gap-3"
        >
          <button
            type="button"
            onClick={onEditSchool}
            className="rounded-xl border border-slate-700 px-4 py-2 text-[13px]
              font-semibold text-slate-400 hover:border-slate-500 transition-colors"
          >
            ✏️ Edit School
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-2
              text-[13px] font-semibold text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── School Card ──────────────────────────────────────────────────────────────

function SchoolCard({
  school,
  onClick,
}: {
  school: School;
  onClick: () => void;
}) {
  const days = daysLeft(school.subscriptionEndDate);

  return (
    <div
      onClick={onClick}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 cursor-pointer
        hover:border-slate-600 hover:bg-slate-800/50 transition-all group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center
            rounded-xl bg-teal-500/10 border border-teal-500/20 text-[15px]
            font-extrabold text-teal-400 group-hover:bg-teal-500/15 transition-colors"
          >
            {school.name[0].toUpperCase()}
          </div>
          <div>
            <div className="text-[14px] font-bold text-slate-100 leading-tight">
              {school.name}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {school.email}
            </div>
          </div>
        </div>

        {/* Plan badge */}
        {school.activePlan && (
          <span
            className={`shrink-0 inline-flex items-center rounded-full border
            px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide
            ${
              PLAN_BADGE[school.activePlan.name] ??
              "bg-slate-700 border-slate-600 text-slate-300"
            }`}
          >
            {school.activePlan.name}
          </span>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2 text-[12px] mb-4">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>📍</span>
          <span className="truncate">{school.address}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>📞</span>
          <span>{school.phone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>👤</span>
          <span>
            {school.admins?.length ?? 0} admin
            {(school.admins?.length ?? 0) !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>📅</span>
          <span>Since {fmtDate(school.createdAt)}</span>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        {/* Sub status */}
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
            "text-[10px] font-semibold",
            school.subscriptionStatus === "active"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : school.subscriptionStatus === "expired"
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-slate-700 bg-slate-800 text-slate-500",
          ].join(" ")}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              school.subscriptionStatus === "active"
                ? "bg-emerald-400"
                : school.subscriptionStatus === "expired"
                  ? "bg-red-400"
                  : "bg-slate-500"
            }`}
          />
          {school.subscriptionStatus ?? "No subscription"}
        </span>

        {/* Days left */}
        {days !== null && (
          <span
            className={`text-[11px] font-semibold ${
              days <= 7
                ? "text-red-400"
                : days <= 30
                  ? "text-amber-400"
                  : "text-slate-500"
            }`}
          >
            {days === 0 ? "Expired" : `${days}d left`}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SuperAdminSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [modal, setModal] = useState<ModalType>(null);

  // ── Fetch schools ──────────────────────────────────────────────────────────
  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/api/schools");
      setSchools(res.data?.data ?? []);
    } catch {
      setError("Failed to load schools.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const showToast = (msg: string, ok: boolean) => setToast({ msg, ok });

  // ── Refresh single school detail ───────────────────────────────────────────
  const refreshSchool = async (id: string) => {
    try {
      const res = await axiosInstance.get(`/api/schools/${id}`);
      const updated = res.data?.data;
      if (updated) {
        setActiveSchool(updated);
        setSchools((prev) => prev.map((s) => (s._id === id ? updated : s)));
      }
    } catch {
      /* silent */
    }
  };

  // ── Create admin ───────────────────────────────────────────────────────────
  const handleCreateAdmin = async (data: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    if (!activeSchool) return;
    setActionLoading(true);
    try {
      await axiosInstance.post("/api/admin", {
        ...data,
        schoolId: activeSchool._id,
      });
      showToast(`Admin "${data.fullName}" created successfully.`, true);
      setModal("view_school");
      await refreshSchool(activeSchool._id);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create admin.";
      showToast(msg, false);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Edit school ────────────────────────────────────────────────────────────
  const handleEditSchool = async (data: {
    name: string;
    phone: string;
    address: string;
  }) => {
    if (!activeSchool) return;
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/schools/${activeSchool._id}`, data);
      showToast("School updated successfully.", true);
      setModal("view_school");
      await refreshSchool(activeSchool._id);
      fetchSchools();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update school.";
      showToast(msg, false);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Toggle active ──────────────────────────────────────────────────────────
  const handleToggleActive = async (id: string, current: boolean) => {
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/schools/${id}`, { isActive: !current });
      showToast(
        `School ${current ? "deactivated" : "activated"} successfully.`,
        true,
      );
      await refreshSchool(id);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update school status.";
      showToast(msg, false);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = schools.filter((s) => {
    const matchSearch =
      !search.trim() ||
      (() => {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q)
        );
      })();

    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && s.isActive) ||
      (filterStatus === "inactive" && !s.isActive);

    return matchSearch && matchStatus;
  });

  const stats = {
    total: schools.length,
    active: schools.filter((s) => s.isActive).length,
    inactive: schools.filter((s) => !s.isActive).length,
    expiring: schools.filter((s) => {
      const d = daysLeft(s.subscriptionEndDate);
      return d !== null && d <= 30 && d > 0;
    }).length,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-[#0a0f1e] px-4 pb-24 pt-10
      font-sans text-slate-200"
    >
      {toast && (
        <Toast msg={toast.msg} ok={toast.ok} onDone={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div
            className="mb-1 text-[11px] font-bold uppercase tracking-[0.15em]
            text-teal-500"
          >
            Superadmin
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-100">
            Schools
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Manage all schools, assign admins, and monitor subscriptions.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSchools}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-700
            px-4 py-2 text-[13px] text-slate-400 hover:border-slate-500
            transition-all disabled:opacity-40"
        >
          <span className={loading ? "animate-spin" : ""}>↻</span>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total",
            value: stats.total,
            icon: "🏫",
            accent: "text-teal-400",
          },
          {
            label: "Active",
            value: stats.active,
            icon: "✅",
            accent: "text-emerald-400",
          },
          {
            label: "Inactive",
            value: stats.inactive,
            icon: "🚫",
            accent: "text-slate-400",
          },
          {
            label: "Expiring Soon",
            value: stats.expiring,
            icon: "⏰",
            accent: "text-amber-400",
          },
        ].map(({ label, value, icon, accent }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-900
              px-5 py-4 flex items-center gap-4"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <div
                className="text-[11px] font-bold uppercase tracking-widest
                text-slate-600 mb-0.5"
              >
                {label}
              </div>
              <div className={`text-2xl font-extrabold ${accent}`}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Expiring alert */}
      {stats.expiring > 0 && (
        <div
          className="mb-5 flex items-center gap-3 rounded-xl border
          border-amber-500/30 bg-amber-500/5 px-5 py-3.5"
        >
          <span className="text-amber-400 text-lg">⏰</span>
          <span className="text-[13px] text-amber-300 font-semibold">
            {stats.expiring} school{stats.expiring > 1 ? "s" : ""} expiring
            within 30 days.
          </span>
        </div>
      )}

      {/* Filters + search */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterStatus(f)}
              className={[
                "rounded-lg border px-3.5 py-1.5 text-[12px] font-semibold",
                "capitalize transition-all",
                filterStatus === f
                  ? "border-teal-500 bg-teal-950 text-teal-400"
                  : "border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-600",
              ].join(" ")}
            >
              {f === "all" ? `All (${stats.total})` : f}
            </button>
          ))}
        </div>

        <div
          className="ml-auto flex items-center gap-2 rounded-lg border
          border-slate-800 bg-slate-900 px-3.5 py-2 w-full sm:w-64
          focus-within:border-teal-600 transition-colors"
        >
          <span className="text-slate-600 text-[12px]">🔍</span>
          <input
            type="text"
            placeholder="Search schools…"
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
        <div
          className="mb-5 flex items-center gap-2.5 rounded-xl border
          border-red-900 bg-red-950/40 px-4 py-3 text-[13px] text-red-400"
        >
          <span>⚠️</span>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto text-red-800 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div
            className="h-8 w-8 rounded-full border-2 border-teal-500
            border-t-transparent animate-spin"
          />
          <span className="text-slate-600 text-[13px]">Loading schools…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🏫</div>
          <div className="text-slate-400 text-[15px] font-semibold mb-1">
            No schools found
          </div>
          <div className="text-slate-600 text-[13px]">
            {search ? "Try a different search term." : "No schools yet."}
          </div>
          {(search || filterStatus !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterStatus("all");
              }}
              className="mt-4 text-[12px] text-teal-500 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((school) => (
              <SchoolCard
                key={school._id}
                school={school}
                onClick={() => {
                  setActiveSchool(school);
                  setModal("view_school");
                }}
              />
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-slate-700">
            Showing {filtered.length} of {schools.length} schools
            {" · "}Click a card to view details and manage admins
          </p>
        </>
      )}

      {/* Modals */}
      {modal === "view_school" && activeSchool && (
        <SchoolDetailModal
          school={activeSchool}
          actionLoading={actionLoading}
          onClose={() => {
            setModal(null);
            setActiveSchool(null);
          }}
          onCreateAdmin={() => setModal("create_admin")}
          onEditSchool={() => setModal("edit_school")}
          onToggleActive={handleToggleActive}
        />
      )}

      {modal === "create_admin" && activeSchool && (
        <CreateAdminModal
          school={activeSchool}
          loading={actionLoading}
          onClose={() => setModal("view_school")}
          onSubmit={handleCreateAdmin}
        />
      )}

      {modal === "edit_school" && activeSchool && (
        <EditSchoolModal
          school={activeSchool}
          loading={actionLoading}
          onClose={() => setModal("view_school")}
          onSubmit={handleEditSchool}
        />
      )}
    </div>
  );
}
