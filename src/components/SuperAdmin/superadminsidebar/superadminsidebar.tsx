import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaUsers,
  FaUserShield,
  FaCogs,
  FaFileAlt,
  FaQuestionCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaBuilding,
  FaCreditCard,
} from "react-icons/fa";
import { MdSubscriptions } from "react-icons/md";

const menuItems = [
  { name: "Dashboard", path: "/superadmin", icon: <FaHome /> },
  { name: "School", path: "/superadmin/School", icon: <FaBuilding /> },
  { name: "Subscriptions", path: "/superadmin/Subscriptions", icon: <MdSubscriptions />},
  { name: "Users", path: "/superadmin/users", icon: <FaUsers /> },
  { name: "Roles", path: "/superadmin/roles", icon: <FaUserShield /> },
  { name: "Billing", path: "/superadmin/billing", icon: <FaCreditCard /> },
  { name: "Audit Logs", path: "/superadmin/audit-logs", icon: <FaFileAlt /> },
  { name: "Settings", path: "/superadmin/settings", icon: <FaCogs /> },
];

const SuperAdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white px-5 py-4 border-b shadow-sm sticky top-0 z-50">
        <h1 className="font-bold text-lg text-slate-900">Super Admin</h1>

        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="hidden md:flex items-center gap-3 px-6 h-20 border-b">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-600 to-pink-600 flex items-center justify-center text-white font-bold">
            SA
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Super Admin</h2>
            <span className="text-xs text-red-600 font-medium">
              CONTROL PANEL
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="mt-6 px-3 space-y-2">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                    isActive
                      ? "bg-red-50 text-red-700 font-semibold border-l-4 border-red-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* HELP SECTION (same as your original style) */}
          <div className="mt-6 px-3 pb-4">
            <div className="border-t pt-4">
              <div className="bg-red-50 p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <FaQuestionCircle className="text-red-600" size={16} />
                  <p className="text-xs font-semibold">Need Help?</p>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Contact support anytime
                </p>
                <button
                  onClick={() => setShowSupportModal(true)}
                  className="w-full bg-red-600 text-white text-xs py-1.5 rounded-lg"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                  <FaQuestionCircle className="text-red-600" size={18} />
                </div>
                <h2 className="text-base font-bold text-slate-800">Support</h2>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-500">
              Having trouble with the admin console? Reach out anytime and our
              team will assist you.
            </p>

            <div className="space-y-2">
              <a
                href="mailto:support@edusmart.com"
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <FaEnvelope className="text-red-600" size={16} />
                support@edusmart.com
              </a>

              <a
                href="tel:+15552010100"
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <FaPhoneAlt className="text-red-600" size={16} />
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

export default SuperAdminSidebar;