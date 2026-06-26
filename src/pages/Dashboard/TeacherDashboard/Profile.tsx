// src/pages/teacher/TeacherProfile.tsx

import { useNavigate } from "react-router-dom";
import {
  User,
  IdCard,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  ChevronRight,
  BookOpen
} from "lucide-react";

const TEACHER_DATA = {
  fullName: "Roshan Shrestha",
  designation: "Associate Professor",
  department: "Department of Computer Science",
  teacherId: "TCH20180042",
  email: "roshan.shrestha@college.edu",
  phone: "+977-9800000000",
  address: "Kathmandu, Nepal",
  dateOfJoining: "15 August 2018",
  qualifications: "MSc in Computer Science",
  subjects: [
    "Data Structures",
    "DBMS",
    "Algorithms",
    "Advanced Programming",
  ],
};

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      
      {/* Top Navbar Header */}
      <header className="bg-white border-b border-slate-200 h-14 flex items-center px-4 sm:px-6 sticky top-0 z-10 w-full">
        <button 
          onClick={() => navigate("/teacher/dashboard")} 
          className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer"
        >
          Dashboard <ChevronRight size={12} />
        </button>
        <span className="text-xs font-semibold text-slate-700">My Profile</span>
      </header>

      {/* Main Container */}
      <div className="p-4 sm:p-6 max-w-[900px] mx-auto w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">

          {/* Banner Header Accent */}
          <div className="bg-slate-900 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0 shadow-sm">
                <User size={32} />
              </div>

              <div className="space-y-1">
                <h1 className="text-lg font-bold tracking-tight">{TEACHER_DATA.fullName}</h1>
                <p className="text-xs font-semibold text-indigo-400">{TEACHER_DATA.designation}</p>
                <p className="text-[11px] text-slate-400 font-medium">{TEACHER_DATA.department}</p>
              </div>
            </div>
          </div>

          {/* Details Content Grid */}
          <div className="p-5 sm:p-6 space-y-6">
            
            {/* Split Grid for Basic Info and Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Basic Details Box */}
              <div className="space-y-4">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
                  Basic Information
                </h2>
                <div className="space-y-3">
                  <InfoItem icon={<IdCard size={14} />} label="Teacher ID" value={TEACHER_DATA.teacherId} />
                  <InfoItem icon={<GraduationCap size={14} />} label="Qualification" value={TEACHER_DATA.qualifications} />
                  <InfoItem icon={<Calendar size={14} />} label="Date of Joining" value={TEACHER_DATA.dateOfJoining} />
                </div>
              </div>

              {/* Contact Details Box */}
              <div className="space-y-4">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
                  Contact Details
                </h2>
                <div className="space-y-3">
                  <InfoItem icon={<Mail size={14} />} label="Email Address" value={TEACHER_DATA.email} />
                  <InfoItem icon={<Phone size={14} />} label="Phone Number" value={TEACHER_DATA.phone} />
                  <InfoItem icon={<MapPin size={14} />} label="Office Address" value={TEACHER_DATA.address} />
                </div>
              </div>

            </div>

            {/* Academic Information Box */}
            <div className="space-y-3 pt-2">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <BookOpen size={12} className="text-slate-400" /> Assigned Teaching Courses
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {TEACHER_DATA.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-bold px-3 py-1 rounded-xl shadow-xs"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

/* Reusable Information Row Component */
const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="text-slate-400 mt-0.5 shrink-0">{icon}</div>
    <div>
      <span className="text-[10px] font-bold text-slate-400 block tracking-wide">{label}</span>
      <span className="text-xs font-semibold text-slate-700 mt-0.5 block">{value}</span>
    </div>
  </div>
);

export default Profile;