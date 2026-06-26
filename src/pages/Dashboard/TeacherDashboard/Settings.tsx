    // src/pages/Dashboard/TeacherDashboard/Settings.tsx

    import { useState } from "react";
    import { FaUserCircle, FaBell, FaLock, FaSave } from "react-icons/fa";

    const Settings = () => {
    const [form, setForm] = useState({
        name: "Roshan Shrestha",
        email: "roshan@edusmart.edu.np",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        notifications: true,
    });

    const handleChange = (key: string, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        alert("Settings updated successfully!");
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

        {/* HEADER */}
        <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Settings
            </h1>
            <p className="text-sm text-slate-500">
            Manage your account details and preferences
            </p>
        </div>

        {/* CONTAINER */}
        <div className="max-w-3xl mx-auto space-y-6">

            {/* PROFILE SECTION */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
                <FaUserCircle className="text-blue-600" />
                <h2 className="font-semibold text-slate-800">Profile Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                <label className="text-xs text-slate-500">Full Name</label>
                <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                </div>

                <div>
                <label className="text-xs text-slate-500">Email</label>
                <input
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                </div>

            </div>
            </div>

            {/* PASSWORD SECTION */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">

            <div className="flex items-center gap-2 mb-5">
                <FaLock className="text-blue-600" />
                <h2 className="font-semibold text-slate-800">Change Password</h2>
            </div>

            <div className="space-y-4">

                <div>
                <label className="text-xs text-slate-500">Current Password</label>
                <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) => handleChange("currentPassword", e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter current password"
                />
                </div>

                <div>
                <label className="text-xs text-slate-500">New Password</label>
                <input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => handleChange("newPassword", e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter new password"
                />
                </div>

                <div>
                <label className="text-xs text-slate-500">Confirm Password</label>
                <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Confirm new password"
                />
                </div>

            </div>
            </div>

            {/* NOTIFICATIONS */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">

            <div className="flex items-center gap-2 mb-5">
                <FaBell className="text-blue-600" />
                <h2 className="font-semibold text-slate-800">Notifications</h2>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">

                <div>
                <p className="text-sm font-medium text-slate-700">
                    Enable Notifications
                </p>
                <p className="text-xs text-slate-500">
                    Receive updates about assignments, attendance & exams
                </p>
                </div>

                <input
                type="checkbox"
                checked={form.notifications}
                onChange={() =>
                    handleChange("notifications", !form.notifications)
                }
                className="w-5 h-5 accent-blue-600"
                />
            </div>

            </div>

            {/* SAVE BUTTON */}
            <div className="flex justify-end">
            <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition w-full sm:w-auto justify-center"
            >
                <FaSave />
                Save Changes
            </button>
            </div>

        </div>
        </div>
    );
    };

    export default Settings;