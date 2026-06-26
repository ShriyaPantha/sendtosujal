import { useEffect, useState } from "react";
import { FaUserGraduate, FaCalendarAlt } from "react-icons/fa";
import { FaHandSparkles, FaSchool } from "react-icons/fa6";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { BsClockHistory } from "react-icons/bs";
import man from "../../../../assets/manmmmm(1).png";
import StudentHero from "../StudentHero/StudentHero";
import DashboardFooter from "../StudentPages/DashboardFooter";

// Targeted upcoming examination schedule window
const EXAM_DATE = new Date("2026-06-15T10:00:00");

const pad = (n: number) => String(n).padStart(2, "0");

// Helper to calculate remaining time
const getRemainingTime = () => {
  const diff = EXAM_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    secs: Math.floor((diff % (1000 * 60)) / 1000),
  };
};

const StudentHome = () => {
  // Initialize with actual calculation to avoid a first-frame layout flash of 00:00
  const [countdown, setCountdown] = useState(getRemainingTime);

  useEffect(() => {
    // If exam has already passed on mount, don't even start the interval
    if (EXAM_DATE.getTime() - Date.now() <= 0) return;

    const timer = setInterval(() => {
      const remaining = getRemainingTime();
      setCountdown(remaining);

      if (
        remaining.days === 0 &&
        remaining.hours === 0 &&
        remaining.mins === 0 &&
        remaining.secs === 0
      ) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-4 md:p-6 space-y-6">
        {/* Top Operational Dashboard Metrics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
          
          {/* Welcome Dashboard Profile Banner */}
          <div className="xl:col-span-2 relative overflow-hidden rounded-3xl bg-[#1347a8] text-white shadow-sm border border-blue-800">
            {/* Background Decorative Lighting Circles */}
            <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-blue-500/20 pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-indigo-600/20 pointer-events-none" />

            <div className="relative z-10 p-6 md:p-8 h-full flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <p className="uppercase tracking-wider text-[10px] font-bold text-blue-200 mb-1">
                    Student Dashboard Overview
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                    Welcome Back, Sujal
                    <FaHandSparkles className="text-yellow-300 animate-bounce duration-1000 shrink-0" size={24} />
                  </h1>
                </div>

                <p className="text-blue-100 text-sm max-w-md leading-relaxed font-medium">
                  "The beautiful thing about learning is nobody can take it away from you."
                </p>

                {/* Academic Quick Stat Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-3.5 transition-colors hover:bg-white/15">
                    <FaSchool className="text-yellow-300 text-lg mb-1.5" />
                    <p className="text-[11px] text-blue-200 font-medium">Semester</p>
                    <h3 className="font-semibold text-sm">3rd Semester</h3>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-3.5 transition-colors hover:bg-white/15">
                    <HiOutlineAcademicCap className="text-green-300 text-xl mb-1" />
                    <p className="text-[11px] text-blue-200 font-medium">Department</p>
                    <h3 className="font-semibold text-sm">Computer Science</h3>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-3.5 transition-colors hover:bg-white/15">
                    <FaUserGraduate className="text-cyan-300 text-lg mb-1.5" />
                    <p className="text-[11px] text-blue-200 font-medium">Student ID</p>
                    <h3 className="font-semibold text-sm">CSIT20230125</h3>
                  </div>
                </div>
              </div>

              {/* Graphic Mascot Presentation */}
              <div className="shrink-0 self-end pt-4 md:pt-0">
                <img
                  src={man}
                  alt="Student Mascot Illustration"
                  className="w-44 lg:w-52 object-contain"
                  style={{
                    maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Exam Countdown Interval Module */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/60 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 tracking-tight text-lg">Next Exam Target</h3>
                  <p className="text-xs text-slate-400 font-medium">Upcoming Live Assessment</p>
                </div>

                <button className="bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/40 transition-all">
                  View All
                </button>
              </div>

              {/* Course Title Segment */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center space-y-2">
                <h4 className="font-bold text-slate-800 text-sm tracking-tight">
                  Database Management System
                </h4>

                <div className="flex flex-wrap gap-2 text-xs justify-center items-center">
                  <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs font-medium text-slate-600">
                    <FaCalendarAlt className="text-blue-600 shrink-0" size={12} />
                    June 15, 2026
                  </span>

                  <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs font-medium text-slate-600">
                    <BsClockHistory className="text-blue-600 shrink-0" size={12} />
                    10:00 AM
                  </span>
                </div>
              </div>

              {/* Countdown Digits Matrix */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="bg-blue-50/70 border border-blue-100/50 rounded-xl p-2.5 text-center">
                  <h2 className="font-bold text-blue-700 text-lg tabular-nums">
                    {pad(countdown.days)}
                  </h2>
                  <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Days</p>
                </div>

                <div className="bg-violet-50/70 border border-violet-100/50 rounded-xl p-2.5 text-center">
                  <h2 className="font-bold text-violet-700 text-lg tabular-nums">
                    {pad(countdown.hours)}
                  </h2>
                  <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider">Hrs</p>
                </div>

                <div className="bg-green-50/70 border border-green-100/50 rounded-xl p-2.5 text-center">
                  <h2 className="font-bold text-green-700 text-lg tabular-nums">
                    {pad(countdown.mins)}
                  </h2>
                  <p className="text-[10px] font-semibold text-green-500 uppercase tracking-wider">Mins</p>
                </div>

                <div className="bg-red-50/70 border border-red-100/50 rounded-xl p-2.5 text-center">
                  <h2 className="font-bold text-red-700 text-lg tabular-nums">
                    {pad(countdown.secs)}
                  </h2>
                  <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">Secs</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 bg-[#1347a8] hover:bg-blue-800 active:scale-98 text-white py-3 rounded-2xl text-sm font-semibold transition-all shadow-xs">
              View Exam Schedule →
            </button>
          </div>
        </div>

        {/* Secondary Portal Sections */}
        <StudentHero />
      </div>
      {/* <DashboardFooter /> */}
    </>
  );
};

export default StudentHome;