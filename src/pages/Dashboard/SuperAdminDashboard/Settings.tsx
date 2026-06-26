import { useState, useEffect, useCallback, useRef } from "react";
import {
  Shield,
  Save,
  Key,
  User,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

// ─── API BASE ─────────────────────────────
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

// ─── API HELPER ─────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}

// ─── TYPES ─────────────────────────────
interface Profile {
  name: string;
  email: string;
  phone: string;
}

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

// ─── TOAST UI ─────────────────────────────
function ToastList({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`px-4 py-3 rounded-xl border shadow text-sm flex items-center gap-2 cursor-pointer
            ${
              t.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
        >
          {t.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────
const SuperAdminSettings = () => {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // ─── TOAST ─────────────────────────────
  const addToast = useCallback(
    (type: "success" | "error", message: string) => {
      const id = ++toastId.current;
      setToasts((p) => [...p, { id, type, message }]);

      setTimeout(() => {
        setToasts((p) => p.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = (id: number) =>
    setToasts((p) => p.filter((t) => t.id !== id));

  // ─── LOAD PROFILE ─────────────────────────────
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{
        data: { profile: Profile; twoFactorEnabled: boolean };
      }>("/superadmin/profile");

      setProfile(res.data.profile);
      setIs2FAEnabled(res.data.twoFactorEnabled);
    } catch (err: any) {
      addToast("error", err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ─── SAVE PROFILE ─────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true);

    try {
      await apiFetch("/superadmin/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      addToast("success", "Profile updated successfully");
    } catch (err: any) {
      addToast("error", err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // ─── TOGGLE 2FA ─────────────────────────────
  const handleToggle2FA = async () => {
    setTwoFALoading(true);

    const next = !is2FAEnabled;

    try {
      await apiFetch("/superadmin/2fa", {
        method: "POST",
        body: JSON.stringify({ enabled: next }),
      });

      setIs2FAEnabled(next);
      addToast("success", next ? "2FA Enabled" : "2FA Disabled");
    } catch (err: any) {
      addToast("error", err.message || "Failed to update 2FA");
    } finally {
      setTwoFALoading(false);
    }
  };

  // ─── CHANGE PASSWORD ─────────────────────────────
  const handleChangePassword = async () => {
    if (
      !password.current ||
      !password.next ||
      !password.confirm
    ) {
      addToast("error", "Fill all password fields");
      return;
    }

    if (password.next !== password.confirm) {
      addToast("error", "Passwords do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      await apiFetch("/superadmin/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.next,
        }),
      });

      addToast("success", "Password updated successfully");

      setPassword({
        current: "",
        next: "",
        confirm: "",
      });

      setShowPassword(false);
    } catch (err: any) {
      addToast("error", err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ─── UI ─────────────────────────────
  return (
    <>
      <ToastList toasts={toasts} dismiss={dismissToast} />

      <div className="max-w-4xl mx-auto p-6 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-gray-500">
            Manage profile & security settings
          </p>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white border rounded-2xl p-6 space-y-4">

          <div className="flex items-center gap-2 font-semibold">
            <User /> Profile
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" /> Loading...
            </div>
          ) : (
            <>
              <input
                className="w-full border p-3 rounded-lg"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                placeholder="Full name"
              />

              <input
                className="w-full border p-3 rounded-lg bg-gray-100"
                value={profile.email}
                disabled
              />

              <input
                className="w-full border p-3 rounded-lg"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                placeholder="Phone"
              />
            </>
          )}
        </div>

        {/* SECURITY CARD */}
        <div className="bg-white border rounded-2xl p-6 space-y-5">

          <div className="flex items-center gap-2 font-semibold">
            <Shield /> Security
          </div>

          {/* 2FA */}
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
            <div>
              <p className="font-medium">Two Factor Authentication</p>
              <p className="text-sm text-gray-500">
                Extra security for your account
              </p>
            </div>

            <button
              onClick={handleToggle2FA}
              disabled={twoFALoading}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                is2FAEnabled
                  ? "bg-red-600 text-white"
                  : "border text-red-600"
              }`}
            >
              {twoFALoading ? "Loading..." : is2FAEnabled ? "Disable" : "Enable"}
            </button>
          </div>

          {/* PASSWORD */}
          <div>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-red-600 text-sm font-medium"
            >
              <Key className="inline w-4 h-4 mr-1" />
              Change Password
            </button>

            {showPassword && (
              <div className="mt-4 space-y-3">
                <input
                  className="w-full border p-3 rounded-lg"
                  placeholder="Current password"
                  value={password.current}
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      current: e.target.value,
                    })
                  }
                />

                <input
                  className="w-full border p-3 rounded-lg"
                  placeholder="New password"
                  value={password.next}
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      next: e.target.value,
                    })
                  }
                />

                <input
                  className="w-full border p-3 rounded-lg"
                  placeholder="Confirm password"
                  value={password.confirm}
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      confirm: e.target.value,
                    })
                  }
                />

                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="w-full bg-black text-white py-3 rounded-lg"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-red-600 text-white px-6 py-3 rounded-xl"
          >
            {saving ? (
              <>
                <Loader2 className="inline animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="inline mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>

      </div>
    </>
  );
};

export default SuperAdminSettings;