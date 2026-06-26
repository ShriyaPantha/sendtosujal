import React, { useState, useEffect, useRef } from "react";
import {
  FaEye, FaEyeSlash, FaTimes, FaUser,
  FaEnvelope, FaLock, FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance"; 

type Mode = "login" | "signup" | "forgot";
type UserRole = "student" | "teacher" | "parent" | "admin" | "superadmin" | "user";

const ROLE_PATHS: Record<string, string> = {
  teacher:    "/teacher/dashboard",
  student:    "/student/dashboard",
  parent:     "/parent/dashboard",
  admin:      "/admin/dashboard",
  superadmin: "/superadmin/dashboard",
  user:       "/",
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole, path: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const navigate = useNavigate();

  const [mode, setMode]                       = useState<Mode>("login");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [fullName, setFullName]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass]               = useState(false);
  const [error, setError]                     = useState("");
  const [loading, setLoading]                 = useState(false);
  const [success, setSuccess]                 = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setMode("login");
    setEmail(""); setPassword(""); setFullName(""); setConfirmPassword("");
    setError(""); setSuccess(false); setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Email and password are required"); return; }

    setLoading(true);
    try {
      // axiosInstance uses VITE_API_URL as baseURL + attaches token header automatically
      const { data } = await axiosInstance.post("/api/auth/login", { email, password });

      // Backend shape: { success, token, role, data: { _id, fullName, email, role, ... } }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.data)); // ← was data.user ❌

      const role = data.data.role as UserRole;
      const path = ROLE_PATHS[role] || "/";

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        onLoginSuccess(role, path);
        onClose();
        navigate(path);
      }, 900);

    } catch (err: any) {
      setLoading(false);
      // axiosInstance already logs status/url/message in the interceptor
      const msg = err.response?.data?.message;
      setError(msg || "Cannot connect to server. Check that the backend is running.");
    }
  };

  // ── SIGNUP ────────────────────────────────────────────────────────────────
  const handleSignup = async () => {
    setError("");
    if (!fullName || !email || !password || !confirmPassword) {
      setError("All fields are required"); return;
    }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      await axiosInstance.post("/api/auth/register", { fullName, email, password });

      setLoading(false);
      setSuccess(true);
      // After OTP is sent the user needs to verify — redirect to login so they can proceed
      setTimeout(() => { setMode("login"); setSuccess(false); }, 1200);

    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || "Cannot connect to server.");
    }
  };

  // ── FORGOT PASSWORD ───────────────────────────────────────────────────────
  const handleForgot = async () => {
    setError("");
    if (!email) { setError("Enter your email"); return; }

    setLoading(true);
    try {
      await axiosInstance.post("/api/auth/forgot-password", { email });
    } catch {
      // swallow — show success regardless to prevent email enumeration
    } finally {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => { setMode("login"); setSuccess(false); }, 1200);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login")  return handleLogin();
    if (mode === "signup") return handleSignup();
    if (mode === "forgot") return handleForgot();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#0f172a] w-full max-w-md rounded-2xl p-6 border border-white/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute top-3 right-3 text-white" onClick={onClose}>
          <FaTimes />
        </button>

        {success ? (
          <div className="text-center py-10">
            <FaCheckCircle className="text-green-400 text-4xl mx-auto" />
            <p className="text-white mt-3">
              {mode === "forgot"  ? "If that email exists, a reset link has been sent." :
               mode === "signup"  ? "OTP sent! Check your email to verify." :
               "Login successful! Redirecting..."}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-white text-xl font-bold text-center mb-5">
              {mode === "login" ? "Login" : mode === "signup" ? "Create Account" : "Forgot Password"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <div className="flex items-center bg-white/5 px-3 rounded-lg">
                  <FaUser className="text-gray-400" />
                  <input
                    ref={inputRef}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-transparent p-2 text-white outline-none"
                  />
                </div>
              )}

              <div className="flex items-center bg-white/5 px-3 rounded-lg">
                <FaEnvelope className="text-gray-400" />
                <input
                  ref={mode === "login" ? inputRef : undefined}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  type="email"
                  className="w-full bg-transparent p-2 text-white outline-none"
                />
              </div>

              {mode !== "forgot" && (
                <div className="flex items-center bg-white/5 px-3 rounded-lg">
                  <FaLock className="text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-transparent p-2 text-white outline-none"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400">
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              )}

              {mode === "signup" && (
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-white/5 p-2 rounded-lg text-white outline-none"
                />
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold disabled:opacity-60"
              >
                {loading ? "Processing..." :
                 mode === "login"  ? "Login" :
                 mode === "signup" ? "Sign Up" : "Send Reset Link"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-4">
              {mode === "login" && (
                <>Don't have an account?{" "}
                  <button onClick={() => { setMode("signup"); setError(""); }} className="text-indigo-400">Sign Up</button>
                </>
              )}
              {mode === "signup" && (
                <>Already have an account?{" "}
                  <button onClick={() => { setMode("login"); setError(""); }} className="text-indigo-400">Login</button>
                </>
              )}
              {mode === "forgot" && (
                <button onClick={() => { setMode("login"); setError(""); }} className="text-indigo-400">Back to Login</button>
              )}
            </p>

            {mode === "login" && (
              <p className="text-center text-xs text-gray-500 mt-2">
                <button onClick={() => { setMode("forgot"); setError(""); }} className="text-indigo-400">
                  Forgot password?
                </button>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;