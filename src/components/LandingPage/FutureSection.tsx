import React from "react";
import {
  FaLock,
  FaChartBar,
  FaComments,
  FaCalendarAlt,
  FaCreditCard,
  FaMobileAlt,
  FaRocket,
} from "react-icons/fa";

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    icon: <FaLock />,
    title: "Role-Based Access",
    desc: "Smart login auto-detects your role and routes you to the right dashboard — student, teacher, parent, admin, or super admin.",
  },
  {
    icon: <FaChartBar />,
    title: "Real-Time Analytics",
    desc: "Live dashboards show attendance, grades, fee status, and performance trends updated in real time.",
  },
  {
    icon: <FaComments />,
    title: "Integrated Messaging",
    desc: "Built-in chat and notification system connects teachers, students, and parents seamlessly.",
  },
  {
    icon: <FaCalendarAlt />,
    title: "Smart Scheduling",
    desc: "Automated timetable generation, exam scheduling, and calendar integration for all stakeholders.",
  },
  {
    icon: <FaCreditCard />,
    title: "Fee Management",
    desc: "Online fee collection, payment tracking, invoicing, and automated reminders built right in.",
  },
  {
    icon: <FaMobileAlt />,
    title: "Mobile Responsive",
    desc: "Fully responsive design ensures a seamless experience across all devices — desktop, tablet, and mobile.",
  },
];

const FeaturesSection: React.FC = () => (
  <section
    className="bg-gradient-to-b from-[#080c20] to-[#050814] py-24 px-6"
    id="features"
  >
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-16">
        <span className="inline-block text-violet-400 text-xs font-bold tracking-widest uppercase mb-4 bg-violet-400/10 px-4 py-1.5 rounded-full border border-violet-400/20">
          Platform Features
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
          Everything Your School Needs
        </h2>
        <p className="text-slate-500 text-base leading-relaxed">
          From smart role-based routing to real-time analytics, EduSphere
          covers every corner of school management.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f: Feature) => (
          <div
            key={f.title}
            className="group flex gap-5 items-start bg-white/[0.025] border border-white/[0.07] rounded-2xl p-8 transition-all duration-300 hover:bg-indigo-500/[0.07] hover:border-indigo-500/25 hover:-translate-y-1"
          >
            {/* Icon */}
            <div className="flex-shrink-0 w-13 h-13 flex items-center justify-center bg-indigo-500/10 rounded-xl text-indigo-400 text-2xl p-3">
              {f.icon}
            </div>

            {/* Text */}
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1.5">
                {f.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="relative mt-20 bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border border-indigo-500/25 rounded-3xl px-8 py-14 text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.08] blur-3xl" />
        </div>

        <h3 className="relative text-2xl md:text-4xl font-extrabold text-white mb-3">
          Ready to Transform Your School?
        </h3>
        <p className="relative text-slate-400 text-base mb-8">
          Join thousands of schools already using EduSphere to streamline education.
        </p>
        <button className="relative inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-base px-10 py-3.5 rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 transition-all duration-300 border-none cursor-pointer">
          <FaRocket />
          Get Started Today
        </button>
      </div>

    </div>
  </section>
);

export default FeaturesSection;