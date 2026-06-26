import {
  Award,
  CalendarCheck,
  FileText,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { useEffect, useState } from "react";

const AchievementsCard = () => {
  const badges = [
    {
      id: 1,
      label: "Top Performer",
      icon: Award,
      bg: "bg-amber-50 text-amber-600",
    },
    {
      id: 2,
      label: "100% Attendance",
      icon: CalendarCheck,
      bg: "bg-teal-50 text-teal-600",
    },
    {
      id: 3,
      label: "Assignment Master",
      icon: FileText,
      bg: "bg-pink-50 text-pink-600",
    },
    {
      id: 4,
      label: "Quick Learner",
      icon: Zap,
      bg: "bg-indigo-50 text-indigo-600",
    },
  ];

  const targetScore = 85;
  const [score, setScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += 1;
      if (start >= targetScore) {
        start = targetScore;
        clearInterval(interval);
      }
      setScore(start);
    }, 15);

    return () => clearInterval(interval);
  }, []);

  const radius = 28;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (score / 100) * circumference;

  return (
    <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white/80 backdrop-blur-xl shadow-sm  transition-all duration-300 p-6 mt-3">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">
            Achievement Badges
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Your performance milestones
          </p>
        </div>

        <button className="text-xs font-semibold text-blue-600 flex items-center gap-1 group">
          View All
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* BADGES */}
      <div className="grid grid-cols-4 gap-3 mb-6">

        {badges.map((badge) => {
          const Icon = badge.icon;

          return (
            <div
              key={badge.id}
              className="flex flex-col items-center text-center p-2 rounded-2xl hover:bg-gray-50 transition group cursor-pointer"
            >

              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${badge.bg} shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span className="text-[11px] font-semibold text-gray-700 mt-2 leading-tight">
                {badge.label}
              </span>

            </div>
          );
        })}

      </div>

      {/* SCHOLARSHIP CARD */}
      <div className="relative overflow-hidden rounded-2xl p-4 border border-emerald-100 bg-linear-to-br from-emerald-50/60 to-white flex items-center justify-between">

        {/* LEFT */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Scholarship Eligibility
            </span>
          </div>

          <h4 className="text-sm font-bold text-gray-900">
            You are eligible!
          </h4>

          <p className="text-xs text-gray-500">
            Merit Scholarship Spring 2025
          </p>
        </div>

        {/* RIGHT CIRCLE */}
        <div className="relative w-16 h-16 shrink-0">

          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 70 70"
          >
            <circle
              cx="35"
              cy="35"
              r={radius}
              stroke="#D1FAE5"
              strokeWidth={strokeWidth}
              fill="none"
            />

            <circle
              cx="35"
              cy="35"
              r={radius}
              stroke="#10B981"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 0.5s ease",
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-extrabold text-gray-900">
              {score}%
            </span>
            <span className="text-[9px] text-emerald-600 font-semibold">
              Eligible
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AchievementsCard;