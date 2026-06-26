import { useState } from "react";
import { Shield, Save, Key, User, CheckCircle2 } from "lucide-react";

const SSettings = () => {
  const [profile, setProfile] = useState({
    name: "Anita Sharma",
    email: "anita.s@edusmart.edu",
    phone: "+977 9800000000",
  });

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Simulated Save Function
  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  // Change Password Handler
  const handleChangePassword = () => {
    const currentPassword = window.prompt("Enter your current password:");
    if (!currentPassword) return;

    const newPassword = window.prompt("Enter your new password:");
    if (!newPassword) return;

    const confirmPassword = window.prompt("Confirm your new password:");
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    alert("Password changed successfully!");
  };

  return (
    <div className="space-y-8 max-w-4xl pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-slate-500">Manage your profile, security, and credentials.</p>
      </div>

      {/* Personal Info Section */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
          <User size={20} className="text-emerald-600" /> Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
            <input 
              value={profile.name} 
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
            <input value={profile.email} disabled className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Contact Number</label>
            <input 
              value={profile.phone} 
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
          <Shield size={20} className="text-emerald-600" /> Security
        </h2>
        
        {/* 2FA Toggle */}
        <div className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50 rounded-xl mb-4">
          <div>
            <p className="font-medium text-slate-800">Two-Factor Authentication</p>
            <p className="text-sm text-slate-500">Secure your account with an extra verification step.</p>
          </div>
          <button 
            onClick={() => setIs2FAEnabled(!is2FAEnabled)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${is2FAEnabled ? 'bg-emerald-600 text-white' : 'bg-white border text-emerald-600'}`}
          >
            {is2FAEnabled ? "Enabled" : "Enable 2FA"}
          </button>
        </div>

        {/* Change Password */}
        <button onClick={handleChangePassword} className="flex items-center gap-2 text-emerald-600 font-medium text-sm hover:underline">
          <Key size={16} /> Change Password
        </button>
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {isSaving ? "Saving..." : <><Save size={18} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
};

export default SSettings;