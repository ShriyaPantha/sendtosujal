// src/components/Admin/AdminSidebar/AdminSidebar.tsx

import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Building2,
  ClipboardCheck,
  CreditCard,
  BookOpen,
  Bell,
  BarChart3,
  Settings,
  Shield,
  HelpCircle,
  X,
  Mail,
  Phone,
} from "lucide-react";
import { RiParentFill } from "react-icons/ri";

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    label: "Students",
    icon: GraduationCap,
    path: "/admin/student",
  },
  {
    label: "Parent",
    icon: RiParentFill ,
    path: "/admin/parent",
  },
  {
    label: "Teachers",
    icon: Users,
    path: "/admin/teacher",
  },
  {
    label: "Departments",
    icon: Building2,
    path: "/admin/department",
  },
  {
    label: "Attendance",
    icon: ClipboardCheck,
    path: "/admin/attendance",
  },
  {
    label: "Fees & Payments",
    icon: CreditCard,
    path: "/admin/fee-payment",
  },
  {
    label: "Exams",
    icon: BookOpen,
    path: "/admin/exam",
  },
  {
    label: "Notices",
    icon: Bell,
    path: "/admin/notice",
  },
  {
    label: "Reports",
    icon: BarChart3,
    path: "/admin/reports",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

const AdminSidebar = ({
  isOpen,
  setIsOpen,
}: AdminSidebarProps) => {
  const location = useLocation();
  const [showSupportModal, setShowSupportModal] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  return (
    <>
      {/* BACKDROP */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* HEADER */}
        <div className="h-16 px-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Shield size={18} className="text-white" />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                EduSmart
              </h2>
              <p className="text-xs text-slate-500">
                Admin Portal
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* ADMIN PROFILE */}
        <div className="px-4 py-3 border-b">
          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              A
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Administrator
              </p>
              <p className="text-xs text-slate-500">
                Super Admin
              </p>
              <p className="text-xs text-green-600">
                ● Online
              </p>
            </div>
          </div>
        </div>

        {/* INSTITUTION CARD */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl bg-linear-to-r from-indigo-600 to-blue-600 p-4 text-white shadow-lg">
            <p className="text-xs text-indigo-100">
              Institution Overview
            </p>

            <h3 className="text-3xl font-bold mt-1">
              2,450
            </h3>

            <p className="text-xs text-indigo-100">
              Total Students
            </p>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={18}
                      className={
                        isActive
                          ? "text-white"
                          : "text-slate-500"
                      }
                    />
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* SUPPORT CARD */}
          <div className="mt-6 border-t pt-4">
            <div className="bg-indigo-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle
                  size={16}
                  className="text-indigo-600"
                />
                <p className="text-xs font-semibold">
                  Need Help?
                </p>
              </div>

              <p className="text-xs text-slate-500 mb-3">
                Contact the support team anytime.
              </p>

              <button
                onClick={() => setShowSupportModal(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 rounded-lg transition"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle
                  size={20}
                  className="text-indigo-600"
                />
                <h2 className="font-bold text-slate-800">
                  Support Center
                </h2>
              </div>

              <button
                onClick={() =>
                  setShowSupportModal(false)
                }
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Need assistance with the Admin Portal?
              Contact our support team.
            </p>

            <div className="space-y-3">
              <a
                href="mailto:support@edusmart.com"
                className="flex items-center gap-3 border rounded-xl px-4 py-3 hover:bg-slate-50"
              >
                <Mail
                  size={16}
                  className="text-indigo-600"
                />
                support@edusmart.com
              </a>

              <a
                href="tel:+15552010100"
                className="flex items-center gap-3 border rounded-xl px-4 py-3 hover:bg-slate-50"
              >
                <Phone
                  size={16}
                  className="text-indigo-600"
                />
                +1 555-201-0100
              </a>
            </div>

            <button
              onClick={() =>
                setShowSupportModal(false)
              }
              className="w-full mt-5 text-sm text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;