// src/components/Parent/ParentSidebar/ParentSidebar.tsx

import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  BookOpen,
  Users,
  CreditCard,
  User,
  Settings,
  Shield,
  HelpCircle,
  BookCheck,
  CalendarDays,
  Bell,
  X,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";

interface ParentSidebarProps {
  parent?: {
    name: string;
    role: string;
    avatar: string;
    image?: string;
  };
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/parent/dashboard" },
  { label: "Attendance", icon: ClipboardCheck, path: "/parent/attendance" },
  { label: "Assignments", icon: ClipboardCheck, path: "/parent/assignments" },

  { label: "Academic Reports", icon: BookCheck, path: "/parent/reports" },
  { label: "Notices", icon: Bell, path: "/parent/notices" },
  { label: "Fees & Payment", icon: CreditCard, path: "/parent/fees" },
  { label: "Events", icon: CalendarDays, path: "/parent/events" },
  { label: "Profile", icon: User, path: "/parent/profile" },
  { label: "Settings", icon: Settings, path: "/parent/settings" },
];

const ParentSidebar = ({
  parent = {
    name: "Rajesh Shrestha",
    role: "Parent of Aayush Shrestha",
    avatar: "RS",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  isOpen = false,
  onClose,
}: ParentSidebarProps) => {
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <>
      {/* Mobile Dimmer Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden block"
          onClick={onClose}
        />
      )}

      {/* Sidebar Shell Frame Container */}
      <aside 
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Header Branding Panel Container */}
        <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shrink-0">
              <Shield size={18} className="text-white" />
            </div>

            <div>
              <h2 className="font-bold text-slate-800 text-base leading-tight">
                EduSmart
              </h2>
              <p className="text-[11px] text-slate-500">Parent Portal</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden block transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Parent Profile Card */}
        <div className="px-4 py-3 border-b border-slate-200 shrink-0">
          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
            <img
              src={parent.image}
              alt="Parent Profile Picture"
              className="w-10 h-10 rounded-full object-cover border border-indigo-500 shrink-0"
            />

            <div className="leading-tight min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm truncate">
                {parent.name}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                {parent.role}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-[11px] text-indigo-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Core Panel Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm font-medium"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  <span className="text-sm">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* Need Help Section */}
          <div className="pt-4 border-t border-slate-200 mt-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle size={16} className="text-indigo-600 shrink-0" />
                <h4 className="font-semibold text-slate-800 text-xs">
                  Need Help?
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                Reach out for school assistance.
              </p>
              <button
                onClick={() => setShowSupportModal(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-xs font-medium transition-colors"
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
                <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
                  <HelpCircle size={18} className="text-indigo-600" />
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
              Having trouble with the parent portal? Reach out through either
              option below and the school office will get back to you shortly.
            </p>

            <div className="space-y-2">
              <a
                href="mailto:support@edusmart.com"
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <Mail size={16} className="text-indigo-600" />
                support@edusmart.com
              </a>
              <a
                href="tel:+15552010100"
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <Phone size={16} className="text-indigo-600" />
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

export default ParentSidebar;