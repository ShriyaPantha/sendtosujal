// src/components/Teacher/TeacherSidebar/TeacherSidebar.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  BookOpen,
  Users,
  DollarSign,
  User,
  Settings,
  Shield,
  HelpCircle,
  BookCheck,
  CalendarDays,
  CalendarX,
  Calendar,
  X,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";

interface TeacherSidebarProps {
  teacher?: {
    name: string;
    role: string;
    avatar: string;
    image?: string;
  };
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/teacher/dashboard" },
  { label: "Students", icon: Users, path: "/teacher/students" },
  { label: "Attendance", icon: ClipboardCheck, path: "/teacher/attendance" },
  { label: "Assignments", icon: BookOpen, path: "/teacher/assignments" },

  { label: "Exams & Marks", icon: BookCheck, path: "/teacher/exams" },
  { label: "Events", icon: Calendar, path: "/teacher/events" },

  { label: "Timetable", icon: CalendarDays, path: "/teacher/timetable" },
  { label: "Leave Management", icon: CalendarX, path: "/teacher/leavemanagement" },

  { label: "Salary", icon: DollarSign, path: "/teacher/salary" },
  { label: "Profile", icon: User, path: "/teacher/profile" },
  { label: "Settings", icon: Settings, path: "/teacher/settings" },
];

const TeacherSidebar = ({
  teacher = {
    name: "Roshan Shrestha",
    role: "Computer Science Teacher",
    avatar: "RS",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  isOpen = false,
  onClose,
}: TeacherSidebarProps) => {
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <>
      {/* BACKDROP */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* HEADER */}
        <div className="h-16 px-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">EduSmart</h2>
              <p className="text-xs text-slate-500">Teacher Portal</p>
            </div>
          </div>

          <button onClick={onClose} className="lg:hidden">
            <X size={18} />
          </button>
        </div>

        {/* PROFILE */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
            <img
              src={teacher.image}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold">{teacher.name}</p>
              <p className="text-xs text-slate-500">{teacher.role}</p>
              <p className="text-xs text-green-600">● Online</p>
            </div>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className={isActive ? "text-white" : "text-slate-500"}
                  />
                  <span className="text-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* HELP */}
          <div className="mt-6 border-t pt-4">
            <div className="bg-blue-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle size={16} className="text-blue-600" />
                <p className="text-xs font-semibold">Need Help?</p>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                Contact support anytime
              </p>
              <button
                onClick={() => setShowSupportModal(true)}
                className="w-full bg-blue-600 text-white text-xs py-1.5 rounded-lg"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                  <HelpCircle size={18} className="text-blue-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Support</h2>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-500">
              Having trouble with the teacher portal? Reach out through either
              option below and the IT desk will get back to you shortly.
            </p>

            <div className="space-y-2">
              <a
                href="mailto:support@edusmart.com"
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <Mail size={16} className="text-blue-600" />
                support@edusmart.com
              </a>
              <a
                href="tel:+15552010100"
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <Phone size={16} className="text-blue-600" />
                +1 555-201-0100
              </a>
              
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 pt-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherSidebar;