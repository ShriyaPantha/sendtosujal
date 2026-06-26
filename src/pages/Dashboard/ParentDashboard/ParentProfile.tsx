// src/pages/Dashboard/ParentDashboard/Profile.tsx

import { User, Mail, Phone, MapPin, BookOpen, Hash, Users } from "lucide-react";

const ParentProfile = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500">Manage your personal information and student details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Parent Details Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col items-center text-center mb-6">
            <img 
              src="https://randomuser.me/api/portraits/men/45.jpg" 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50 shadow-md mb-4"
            />
            <h2 className="text-xl font-bold text-slate-800">Rajesh Shrestha</h2>
            <p className="text-indigo-600 font-medium">Primary Guardian</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={18} className="text-slate-400" />
              <span className="text-sm">rajesh.shrestha@email.com</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone size={18} className="text-slate-400" />
              <span className="text-sm">+977 9800000000</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <MapPin size={18} className="text-slate-400" />
              <span className="text-sm">Kathmandu, Nepal</span>
            </div>
          </div>
          
          <button className="w-full mt-6 bg-slate-900 text-white py-2 rounded-xl font-medium hover:bg-slate-800 transition">
            Edit Profile
          </button>
        </div>

        {/* Student Academic Info Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users className="text-indigo-600" size={20} /> Student Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Student Name</p>
              <p className="font-semibold text-slate-800">Aayush Shrestha</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Student ID</p>
              <p className="font-semibold text-slate-800">EDU-2026-8842</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Class / Grade</p>
              <p className="font-semibold text-slate-800">Grade 10 - Section B</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Academic Year</p>
              <p className="font-semibold text-slate-800">2026 / 2027</p>
            </div>
          </div>

          <h3 className="font-bold text-slate-800 mt-8 mb-4 flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={20} /> Subjects Enrolled
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Mathematics", "Science", "Computer Science", "English", "History", "Physical Education"].map((subject) => (
              <span key={subject} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg">
                {subject}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ParentProfile;