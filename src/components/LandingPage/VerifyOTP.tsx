import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaEnvelope } from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";
import { ROLE_CONFIGS, type UserRole } from "../constant/roles";
// Adjust this path based on your actual folder structure:
// import { ROLE_CONFIGS, type UserRole } from "../../constant/roles"; 

const TIMEOUT_SECONDS = 60;

type ScreenState = "verify" | "timeout" | "success";

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const stateEmail = (location.state as { email?: string })?.email ?? "";
  const queryEmail = new URLSearchParams(location.search).get("email") ?? "";
  const initialEmail = stateEmail || queryEmail;

  const [email, setEmail]         = useState(initialEmail);
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]         = useState("");
  const [screen, setScreen]       = useState<ScreenState>("verify");
  const [countdown, setCountdown] = useState(TIMEOUT_SECONDS);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer ────────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(TIMEOUT_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setScreen("timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  // ── OTP input ────────────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next  = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    const nextEmpty = next.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  // ── Verify ───────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    setError("");
    const code = otp.join("");
    if (!email) { setError("Email is missing. Go back and register again."); return; }
    if (code.length < 6) { setError("Enter all 6 digits."); return; }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/api/auth/verify-otp", { email, otp: code });

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.data));
      }

      if (timerRef.current) clearInterval(timerRef.current);
      setScreen("success");

      const role = data.data?.role as UserRole | undefined;
      const path = (role && ROLE_CONFIGS[role]) ? ROLE_CONFIGS[role] : "/";
      setTimeout(() => navigate(path), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend ───────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resending) return;
    setError("");
    setResending(true);
    try {
      await axiosInstance.post("/api/auth/resend-otp", { email });
      setOtp(["", "", "", "", "", ""]);
      setScreen("verify");
      startTimer();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleVerify(); };

  // ── Derived ──────────────────────────────────────────────────────────────
  const isExpiringSoon = countdown <= 10 && countdown > 0;
  const progressPct     = (countdown / TIMEOUT_SECONDS) * 100;

  // ══ RENDERING LOGIC ══════════════════════════════════════════════════════
  if (screen === "success") {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
        <div className="text-center">
          <FaCheckCircle className="text-emerald-400 text-6xl mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Email verified!</h2>
          <p className="text-slate-400 text-sm">Logging you in…</p>
        </div>
      </div>
    );
  }

  if (screen === "timeout") {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-8 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/><line x1="15" y1="9" x2="9" y2="15"/>
              </svg>
            </div>
            <h1 className="text-red-400 text-2xl font-bold mb-2">Code expired</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The code sent to <span className="text-slate-200 font-semibold">{email}</span> has expired.
            </p>
            <button onClick={handleResend} disabled={resending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 mb-3">
              {resending ? "Sending…" : "Resend code"}
            </button>
            <button onClick={() => navigate(-1)} className="w-full text-indigo-400 hover:text-indigo-300 py-2 text-sm font-medium border border-indigo-500/30 rounded-xl hover:bg-indigo-500/5 transition-all">
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-4">
              <FaEnvelope className="text-indigo-400 text-2xl" />
            </div>
            <h1 className="text-white text-2xl font-bold">Check your email</h1>
            <p className="text-slate-400 text-sm mt-2">{email && <span className="block text-slate-200 font-semibold">{email}</span>}</p>
          </div>

          {/* Circular Countdown */}
          <div className="flex flex-col items-center mb-5">
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="3"/>
                <circle cx="28" cy="28" r="24" fill="none" stroke={isExpiringSoon ? "#ef4444" : "#6366f1"} strokeWidth="3" strokeLinecap="round" strokeDasharray="150.8" strokeDashoffset={150.8 - (150.8 * progressPct) / 100} style={{ transition: "stroke-dashoffset 1s linear" }}/>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-base font-semibold text-indigo-300">{countdown}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input key={i} ref={(el) => { inputRefs.current[i] = el; }} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 bg-white/5 text-white ${digit ? "border-indigo-500 bg-indigo-500/10" : "border-white/10"}`} />
              ))}
            </div>
            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
            <button type="submit" disabled={loading || otp.join("").length < 6} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50">
              {loading ? "Verifying…" : "Verify email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;