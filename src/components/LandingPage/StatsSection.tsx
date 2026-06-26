import React from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUsers,
  FaSchool,
  FaBookOpen,
  FaClipboardList,
} from "react-icons/fa";

const stats = [
  { value: "10,000+", label: "Students Enrolled", icon: <FaUserGraduate /> },
  { value: "500+", label: "Expert Teachers", icon: <FaChalkboardTeacher /> },
  { value: "98%", label: "Parent Satisfaction", icon: <FaUsers /> },
  { value: "50+", label: "Courses Available", icon: <FaBookOpen /> },
];

const portals = [
  {
    icon: <FaUserGraduate />,
    role: "Student Portal",
    color: "#4F46E5",
    description:
      "Access assignments, grades, timetables, attendance records, and communicate with teachers — all in one place.",
    features: [
      "Live Class Schedule",
      "Assignment Submission",
      "Grade Tracker",
      "Attendance History",
      "Library Access",
    ],
  },
  {
    icon: <FaChalkboardTeacher />,
    role: "Teacher Portal",
    color: "#0891B2",
    description:
      "Manage classes, track student progress, upload study material, and coordinate with parents efficiently.",
    features: [
      "Class Management",
      "Lesson Planning",
      "Grade Entry",
      "Student Reports",
      "Parent Communication",
    ],
  },
  {
    icon: <FaUsers />,
    role: "Parent Portal",
    color: "#059669",
    description:
      "Stay connected with your child's academic journey — monitor attendance, fees, performance, and teacher feedback.",
    features: [
      "Child Progress Report",
      "Attendance Alerts",
      "Fee Payments",
      "Teacher Chat",
      "Event Calendar",
    ],
  },
  {
    icon: <FaSchool />,
    role: "Admin Portal",
    color: "#D97706",
    description:
      "Oversee school operations, manage enrollments, staff schedules, reports, and institution-wide announcements.",
    features: [
      "Staff Management",
      "Enrollment Control",
      "Fee Management",
      "Reports & Analytics",
      "Announcements",
    ],
  },
];

const StatsSection: React.FC = () => {
  return (
    <div className="bg-[#050814] text-white">
      {/* STATS */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:scale-105 transition"
            >
              <div className="text-3xl text-indigo-400 flex justify-center mb-3">
                {s.icon}
              </div>
              <h2 className="text-3xl font-bold">{s.value}</h2>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PORTALS */}
      <section className="py-24 px-6 bg-[#080c20]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-indigo-400 text-sm font-bold tracking-widest uppercase">
            Four Powerful Portals
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            A Dashboard for Every Role
          </h2>
          <p className="text-gray-400 mt-3 text-sm">
            Each stakeholder gets a dedicated dashboard designed for their needs.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portals.map((p) => (
            <div
              key={p.role}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:-translate-y-2 transition duration-300"
              style={{ borderColor: `${p.color}33` }}
            >
              <div
                className="text-3xl mb-4 p-3 w-fit rounded-xl"
                style={{
                  backgroundColor: `${p.color}20`,
                  color: p.color,
                }}
              >
                {p.icon}
              </div>

              <h3 className="text-lg font-semibold mb-2">{p.role}</h3>

              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {p.description}
              </p>

              <ul className="space-y-2 text-sm text-gray-300">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <FaClipboardList className="text-indigo-400 text-xs" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StatsSection;