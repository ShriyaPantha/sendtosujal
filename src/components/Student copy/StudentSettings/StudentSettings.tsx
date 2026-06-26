import { useState } from "react";
import {
  User,
  Lock,
  Bell,
  Shield,
  Globe,
  Moon,
  Smartphone,
  LogOut,
  Trash2,
  Save,
  Camera,
  ChevronRight,
  Languages,
  Clock
} from "lucide-react";

// Explicit Type Definition for the Custom Toggle Component Props
interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

// Fixed Implicit Any Types by providing ToggleProps interface validation
const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
      checked ? "bg-blue-600" : "bg-slate-200"
    }`}
  >
    <div
      className={`bg-white w-5 h-5 rounded-full shadow-xs transform transition-transform duration-300 ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

// Fixed: Moved SaveButton above StudentSetting to prevent "Used before initialization" errors
const SaveButton = () => (
  <button className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-xs shadow-blue-100 transition-all ml-auto">
    <Save size={15} />
    Save Modifications
  </button>
);

const StudentSetting = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("Profile");

  // Settings State variables
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [emailNotification, setEmailNotification] = useState<boolean>(true);
  const [attendanceAlert, setAttendanceAlert] = useState<boolean>(true);
  const [examReminder, setExamReminder] = useState<boolean>(true);
  const [profileVisible, setProfileVisible] = useState<boolean>(true);
  const [twoFactor, setTwoFactor] = useState<boolean>(false);

  // Tab definitions mapping to rendering handlers
  const tabs = [
    { id: "Profile", label: "Profile Information", icon: User, color: "text-blue-500 bg-blue-50" },
    { id: "Security", label: "Security & Access", icon: Lock, color: "text-emerald-500 bg-emerald-50" },
    { id: "Notifications", label: "Notifications", icon: Bell, color: "text-orange-500 bg-orange-50" },
    { id: "Preferences", label: "System Preferences", icon: Globe, color: "text-purple-500 bg-purple-50" },
    { id: "Privacy", label: "Privacy Settings", icon: Shield, color: "text-rose-500 bg-rose-50" },
    { id: "Integrations", label: "Connected Accounts", icon: Smartphone, color: "text-indigo-500 bg-indigo-50" },
  ];

  return (
    <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen font-sans">
      {/* Structural Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your student identity profile, verification tools, security keys, and UI configurations.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar Controls */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-50/80 text-blue-600 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`p-1.5 rounded-lg ${isSelected ? "bg-white shadow-xs" : "bg-slate-50 text-slate-400"}`}>
                    <Icon size={16} className={isSelected ? "text-blue-600" : ""} />
                  </span>
                  {tab.id}
                </div>
                <ChevronRight size={14} className={`opacity-40 transition-transform ${isSelected ? "translate-x-0.5 opacity-100 text-blue-600" : ""}`} />
              </button>
            );
          })}
        </div>

        {/* Dynamic Display Panels */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* PROFILE TAB */}
          {activeTab === "Profile" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">Profile Information</h2>
                  <p className="text-xs text-slate-400">Update your primary avatar identity metrics and student record tags.</p>
                </div>
              </div>

              <div className="flex items-center gap-5 mb-6">
                <div className="h-20 w-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 relative group overflow-hidden">
                  <span className="font-bold text-xl text-slate-700">JD</span>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-98 transition-all">
                  <Camera size={15} />
                  Change Photo
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input placeholder="Full Name" defaultValue="John Doe" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student ID</label>
                  <input placeholder="Student ID" defaultValue="STU-2026-001" disabled className="w-full border border-slate-100 bg-slate-50/50 text-slate-400 rounded-xl p-3 text-sm cursor-not-allowed" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input type="email" placeholder="Email" defaultValue="john@example.com" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Number</label>
                  <input type="tel" placeholder="Phone Number" defaultValue="+977 98XXXXXXXX" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>
              <SaveButton />
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "Security" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Lock size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">Security & Authentication</h2>
                  <p className="text-xs text-slate-400">Configure continuous authorization systems and sign-on protection tokens.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-800">Master Password Change</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Keep credentials cycle protected by changing your security phrase regularly.</p>
                  </div>
                  <button className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shrink-0">
                    Update Password
                  </button>
                </div>

                <div className="flex justify-between items-center px-1">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-800">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Secure your portal check-ins by generating time-based secondary pin tokens.</p>
                  </div>
                  <Toggle checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-800">Track System Sessions</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Review a catalog of hardware signatures currently holding active site authorization keys.</p>
                  </div>
                  <button className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shrink-0">
                    Review Active Devices
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "Notifications" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">Notification Hub</h2>
                  <p className="text-xs text-slate-400">Manage real-time push events and automated academic progress relays.</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="flex justify-between items-center py-4 first:pt-0">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-800">System Digest & Newsletters</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Receive non-urgent summaries concerning general campus updates.</p>
                  </div>
                  <Toggle checked={emailNotification} onChange={() => setEmailNotification(!emailNotification)} />
                </div>
                <div className="flex justify-between items-center py-4">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-800">Attendance Monitoring Alerts</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Instant alerts when an absolute roll-call update or metric shift drops on your timeline.</p>
                  </div>
                  <Toggle checked={attendanceAlert} onChange={() => setAttendanceAlert(!attendanceAlert)} />
                </div>
                <div className="flex justify-between items-center py-4 last:pb-0">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-800">Academic Examination Reminders</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Countdown signals informing you of imminent test dates, syllabi notes, or seat assignments.</p>
                  </div>
                  <Toggle checked={examReminder} onChange={() => setExamReminder(!examReminder)} />
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === "Preferences" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Moon size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">System Preferences</h2>
                  <p className="text-xs text-slate-400">Configure localization overrides and local layout rendering targets.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-800">Dark Interface View</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Dim UI backlight to ease ocular stress during late night reviews.</p>
                  </div>
                  <Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                      <Languages size={14} /> Base Language
                    </label>
                    <select className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-colors">
                      <option>English (US)</option>
                      <option>Nepali (नेपाली)</option>
                      <option>Hindi (हिन्दी)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                      <Clock size={14} /> Regional Zone Timezone Coordinates
                    </label>
                    <select className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-colors">
                      <option>Asia/Kathmandu (GMT+5:45)</option>
                      <option>Coordinated Universal Time (UTC)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === "Privacy" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">Privacy Control Matrix</h2>
                  <p className="text-xs text-slate-400">Limit peer visibility data indices and data processing connections.</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-sm text-slate-800">Public Classmate Index Visibility</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Let registered directory students view standard badge metrics and contact listings.</p>
                </div>
                <Toggle checked={profileVisible} onChange={() => setProfileVisible(!profileVisible)} />
              </div>
            </div>
          )}

          {/* INTEGRATIONS TAB */}
          {activeTab === "Integrations" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">Connected SSO Integrations</h2>
                  <p className="text-xs text-slate-400">Link directory hubs to simplify third-party authentications.</p>
                </div>
              </div>

              <div className="space-y-3">
                {["Google Workspace", "Microsoft 365", "GitHub Campus"].map((provider) => (
                  <div key={provider} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <span className="text-sm font-medium text-slate-700">{provider}</span>
                    <button className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 active:scale-98 transition-all text-slate-600">
                      Link Hub
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GENERAL DANGER ZONE & PERSISTENCE CARD */}
          <div className="bg-rose-50/40 border border-rose-100/70 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-rose-700 uppercase tracking-wide">Terminal System Danger Zone</h3>
              <p className="text-xs text-rose-500 mt-0.5">Irreversible modifications regarding global authentication validity.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="bg-white border border-rose-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-100/50 transition-colors flex items-center gap-2 shadow-xs">
                <LogOut size={14} />
                Terminate All Other Sessions
              </button>
              <button className="bg-rose-600 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors flex items-center gap-2 shadow-xs shadow-rose-100">
                <Trash2 size={14} />
                Purge Account Registry
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentSetting;