import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaEnvelope } from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";

const VerifyOTP: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Email can be passed via router state or query param
  const stateEmail = (location.state as { email?: string })?.email ?? "";
  const queryEmail = new URLSearchParams(location.search).get("email") ?? "";
  const initialEmail = stateEmail || queryEmail;

  const [email,    setEmail]    = useState(initialEmail);
  const [otp,      setOtp]      = useState(["", "", "", "", "", ""]);
  const [loading,  setLoading]  = useState(false);
  const [resending,setResending]= useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [countdown,setCountdown]= useState(60);
  const [canResend,setCanResend]= useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Countdown timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── OTP input handling ───────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    // Allow only digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next  = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");

    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    // Focus the next empty box or last box
    const nextEmpty = next.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  // ── Verify ───────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    setError("");
    const code = otp.join("");
    if (!email)        { setError("Email is missing. Please go back and register again."); return; }
    if (code.length < 6) { setError("Please enter all 6 digits."); return; }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/api/auth/verify-otp", { email, otp: code });

      // Backend returns token + user on successful verify
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user",  JSON.stringify(data.data));
      }

      setSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend || resending) return;
    setError("");
    setResending(true);
    try {
      // Re-register won't work if user already exists — you need a resend endpoint,
      // or just call register again with the same data (backend deletes old OTP first).
      await axiosInstance.post("/api/auth/resend-otp", { email });
      setOtp(["", "", "", "", "", ""]);
      setCountdown(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  // ── Success screen ───────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
        <div className="text-center">
          <FaCheckCircle className="text-emerald-400 text-6xl mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Email Verified!</h2>
          <p className="text-slate-400 text-sm">Redirecting you to the home page…</p>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-8 shadow-2xl">

          {/* Icon + heading */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-4">
              <FaEnvelope className="text-indigo-400 text-2xl" />
            </div>
            <h1 className="text-white text-2xl font-bold">Check your email</h1>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              We sent a 6-digit code to
              {email && (
                <span className="block text-slate-200 font-semibold mt-0.5">{email}</span>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Email field (shown only if not pre-filled) */}
            {!initialEmail && (
              <div className="mb-5">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}

            {/* OTP boxes */}
            <div className="mb-6">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3 text-center">
                Enter verification code
              </label>
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={[
                      "w-11 h-13 text-center text-xl font-bold rounded-xl border-2 bg-white/5 text-white outline-none transition-all",
                      digit
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-white/10 focus:border-indigo-400",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm text-center mb-4">{error}</p>
            )}

            {/* Verify button */}
            <button
              type="submit"
              disabled={loading || otp.join("").length < 6}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Verifying…
                </span>
              ) : "Verify Email"}
            </button>

            {/* Resend */}
            <div className="text-center text-sm text-slate-500">
              Didn't receive the code?{" "}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold disabled:opacity-50"
                >
                  {resending ? "Sending…" : "Resend OTP"}
                </button>
              ) : (
                <span className="text-slate-600">
                  Resend in <span className="text-slate-400 font-mono">{countdown}s</span>
                </span>
              )}
            </div>

          </form>
        </div>

        {/* Back to login */}
        <p className="text-center text-sm text-slate-600 mt-5">
          Wrong email?{" "}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Go back
          </button>
        </p>

      </div>
    </div>
  );
};

export default VerifyOTP;