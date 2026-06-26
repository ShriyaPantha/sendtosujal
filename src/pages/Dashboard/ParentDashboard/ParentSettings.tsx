// src/pages/Dashboard/ParentDashboard/Settings.tsx

import { User, Bell, Shield, ChevronRight } from "lucide-react";

const ParentSettings = () => {
  const settingSections = [
    {
      title: "Account Preferences",
      icon: User,
      options: ["Edit Profile Information", "Manage Linked Students", "Update Contact Details"],
    },
    {
      title: "Notifications",
      icon: Bell,
      options: ["Email Notifications", "Push Notifications", "SMS Alerts"],
    },
    {
      title: "Security & Privacy",
      icon: Shield,
      options: ["Change Password", "Two-Factor Authentication", "Login Activity"],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500">Manage your account preferences and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings List */}
        <div className="lg:col-span-2 space-y-6">
          {settingSections.map((section, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                <section.icon size={20} className="text-indigo-600" />
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.options.map((option, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 text-sm font-medium"
                  >
                    {option}
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="space-y-6">
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
            <h3 className="font-bold text-red-800 mb-2">Danger Zone</h3>
            <p className="text-xs text-red-600 mb-4">Permanently delete your account and all associated data.</p>
            <button className="text-xs font-bold text-red-600 hover:text-red-700 underline">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentSettings;