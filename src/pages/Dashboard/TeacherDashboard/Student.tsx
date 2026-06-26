// src/pages/teacher/TeacherStudents.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, Search, Users, Mail, UserCheck
} from "lucide-react";

const TEACHER_CLASSES = ["BCA 3rd Sem", "CSIT 3rd Sem", "BIT 5th Sem", "BCA 1st Sem"];
const BATCH_FILTERS = ["All", ...TEACHER_CLASSES];

const STUDENTS_DATA = [
  { id: 1014, name: "Aarav Sharma",    roll: "BCA-301", batch: "BCA 3rd Sem",  email: "aarav@edu.np",   gender: "Male" },
  { id: 1022, name: "Anjali KC",       roll: "BCA-306", batch: "BCA 3rd Sem",  email: "anjali@edu.np",  gender: "Female" },
  { id: 1053, name: "Bikash Gurung",   roll: "BIT-301", batch: "BIT 5th Sem",  email: "bikash@edu.np",  gender: "Male" },
  { id: 1094, name: "Dinesh Thapa",    roll: "CST-307", batch: "CSIT 3rd Sem", email: "dinesh@edu.np",  gender: "Male" },
  { id: 1102, name: "Kiran Shrestha",  roll: "BCA-102", batch: "BCA 1st Sem",  email: "kiran@edu.np",   gender: "Male" },
  { id: 1115, name: "Kiran Shoki",     roll: "BCA-109", batch: "BCA 1st Sem",  email: "shoki@edu.np",   gender: "Third Gender" },
  { id: 1125, name: "Manisha Rai",     roll: "BCA-308", batch: "BCA 3rd Sem",  email: "manisha@edu.np", gender: "Female" },
  { id: 1141, name: "Niranjan Thapa",  roll: "BCA-101", batch: "BCA 1st Sem",  email: "niranjan@edu.np",gender: "Male" },
  { id: 1168, name: "Priya Tamang",    roll: "CST-301", batch: "CSIT 3rd Sem", email: "priya@edu.np",   gender: "Female" },
  { id: 1189, name: "Raju Shrestha",   roll: "BCA-305", batch: "BCA 3rd Sem",  email: "raju@edu.np",    gender: "Male" },
  { id: 1201, name: "Ritu Karki",      roll: "CST-310", batch: "CSIT 3rd Sem", email: "ritu@edu.np",    gender: "Female" },
  { id: 1210, name: "Samil Shrestha",  roll: "BIT-502", batch: "BIT 5th Sem",  email: "samil@edu.np",   gender: "Third Gender" },
  { id: 1224, name: "Sita Adhikari",   roll: "BCA-304", batch: "BCA 3rd Sem",  email: "sita@edu.np",    gender: "Female" },
  { id: 1259, name: "Suraj Basnet",    roll: "BIT-309", batch: "BIT 5th Sem",  email: "suraj@edu.np",   gender: "Male" },
];

const avatarBg = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-orange-100 text-orange-700"
];

const Students = () => {
  const navigate = useNavigate();
  const [search, setSearch]             = useState("");
  const [batch, setBatch]               = useState("All");
  const [genderFilter, setGenderFilter] = useState("All"); // "All" | "Male" | "Female" | "Third Gender"

  // 1. Filter dataset pipelines
  const filteredData = STUDENTS_DATA.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.roll.toLowerCase().includes(search.toLowerCase()) ||
                          s.id.toString().includes(search);
    const matchesBatch  = batch === "All" || s.batch === batch;
    const matchesGender = genderFilter === "All" || s.gender === genderFilter;

    return matchesSearch && matchesBatch && matchesGender;
  });

  // 2. Sort results alphabetically (A-Z)
  const sortedStudents = [...filteredData].sort((a, b) => a.name.localeCompare(b.name));

  // Calculated static card numbers from root array context
  const totalStudents     = STUDENTS_DATA.length;
  const totalMales        = STUDENTS_DATA.filter(s => s.gender === "Male").length;
  const totalFemales      = STUDENTS_DATA.filter(s => s.gender === "Female").length;
  const totalThirdGenders = STUDENTS_DATA.filter(s => s.gender === "Third Gender").length;

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      
      {/* Top Breadcrumb Context Header */}
      <header className="bg-white border-b border-slate-200 h-14 flex items-center px-4 sm:px-6 gap-2 sticky top-0 z-10 w-full">
        <button 
          onClick={() => navigate("/teacher/dashboard")} 
          className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 transition-colors bg-transparent border-none outline-none cursor-pointer"
        >
          Dashboard <ChevronRight size={12} />
        </button>
        <span className="text-xs font-semibold text-slate-700">Students Directory</span>
      </header>

      <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-5">
        
        {/* Responsive Interactive KPI Grid Panels */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Combined All Students Card */}
          <div 
            onClick={() => setGenderFilter("All")}
            className={`rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer border transition-all duration-200 ${
              genderFilter === "All" 
                ? "bg-blue-50 border-blue-400 ring-2 ring-blue-400/20 scale-[1.01]" 
                : "bg-white border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div>
              <p className="text-2xl font-bold tracking-tight text-blue-700 sm:text-3xl">{totalStudents}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">Total Students</p>
            </div>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shadow-sm hidden sm:block">
              <Users size={18} />
            </div>
          </div>

          {/* Male Students Filter Card */}
          <div 
            onClick={() => setGenderFilter("Male")}
            className={`rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer border transition-all duration-200 ${
              genderFilter === "Male" 
                ? "bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400/20 scale-[1.01]" 
                : "bg-white border-slate-200/80 hover:border-indigo-200"
            }`}
          >
            <div>
              <p className="text-2xl font-bold tracking-tight text-indigo-700 sm:text-3xl">{totalMales}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">Male Students</p>
            </div>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shadow-sm hidden sm:block">
              <UserCheck size={18} />
            </div>
          </div>

          {/* Female Students Filter Card */}
          <div 
            onClick={() => setGenderFilter("Female")}
            className={`rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer border transition-all duration-200 ${
              genderFilter === "Female" 
                ? "bg-pink-50 border-pink-400 ring-2 ring-pink-400/20 scale-[1.01]" 
                : "bg-white border-slate-200/80 hover:border-pink-200"
            }`}
          >
            <div>
              <p className="text-2xl font-bold tracking-tight text-pink-700 sm:text-3xl">{totalFemales}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">Female Students</p>
            </div>
            <div className="p-2 rounded-xl bg-pink-100 text-pink-700 shadow-sm hidden sm:block">
              <UserCheck size={18} />
            </div>
          </div>

          {/* Third Gender / Other Filter Card */}
          <div 
            onClick={() => setGenderFilter("Third Gender")}
            className={`rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer border transition-all duration-200 ${
              genderFilter === "Third Gender" 
                ? "bg-purple-50 border-purple-400 ring-2 ring-purple-400/20 scale-[1.01]" 
                : "bg-white border-slate-200/80 hover:border-purple-200"
            }`}
          >
            <div>
              <p className="text-2xl font-bold tracking-tight text-purple-700 sm:text-3xl">{totalThirdGenders}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">Other Genders</p>
            </div>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shadow-sm hidden sm:block">
              <UserCheck size={18} />
            </div>
          </div>

        </div>

        {/* Filters and Inputs Selection Row Block */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-white p-3.5 border border-slate-200 rounded-2xl shadow-sm w-full">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 w-full md:w-80 focus-within:bg-white focus-within:border-blue-500 transition-all">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs outline-none w-full placeholder:text-slate-400 text-slate-700"
              placeholder="Search by ID, name, or roll..."
            />
          </div>
          
          <div className="flex gap-1.5 flex-wrap w-full md:w-auto">
            {BATCH_FILTERS.map((b) => (
              <button
                key={b}
                onClick={() => setBatch(b)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                  batch === b 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Master Student Data Grid Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-3.5 w-24">Student ID</th>
                  <th className="px-6 py-3.5">Student Name & Roll</th>
                  <th className="px-6 py-3.5">Assigned Class / Batch</th>
                  <th className="px-6 py-3.5">Official Email Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {sortedStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="px-6 py-4 text-slate-500 font-mono font-semibold tracking-wide tabular-nums">
                      #{student.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm ${avatarBg[index % avatarBg.length]}`}>
                          {student.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{student.name}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">{student.roll}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 border border-slate-200/60 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {student.batch}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span>{student.email}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {sortedStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium">
                      No matching student listings found under this filter query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer Metrics Output */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-[11px] font-medium text-slate-400">
              Showing {sortedStudents.length} entries ({genderFilter === "All" ? "All Genders" : genderFilter})
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Students;