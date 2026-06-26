// src/pages/teacher/ClassStudentList.tsx

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaPlus, FaTrash, FaArrowLeft } from "react-icons/fa";
import { useDataStore } from "./DataStore";
// import { useDataStore } from "../../context/dataStore";

const ClassStudentList = () => {
  const { classId } = useParams<{ classId: string }>();
  const { classes, getStudentsByClass, addStudent, deleteStudent } = useDataStore();

  const classInfo = classes.find((c) => c.id === classId);
  const students  = getStudentsByClass(classId ?? "");

  const [showForm, setShowForm] = useState(false);
  const [name, setName]         = useState("");

  const handleAdd = () => {
    if (!name.trim() || !classId) return;
    addStudent({ name: name.trim(), classId, status: "Present" });
    setName("");
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* Back + Header */}
      <div>
        <Link
          to="/teacher/students"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <FaArrowLeft size={12} /> Back to Classes
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {classInfo?.className ?? classId}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {students.length} student{students.length !== 1 ? "s" : ""} enrolled
            </p>
          </div>

          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl hover:bg-violet-700 transition text-sm"
          >
            <FaPlus size={12} />
            {showForm ? "Cancel" : "Add Student"}
          </button>
        </div>
      </div>

      {/* Add student form */}
      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow border border-violet-100 flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">Student Name</label>
            <input
              type="text"
              placeholder="e.g. Anita Shrestha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
          <button
            onClick={handleAdd}
            className="bg-violet-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-violet-700 transition"
          >
            Add
          </button>
        </div>
      )}

      {/* Student table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-slate-500">Roll</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-500">Student Name</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-500">Status</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">
                    No students in this class yet. Add one above.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 text-sm text-slate-600">{student.roll}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{student.name}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        student.status === "Present" ? "bg-green-100 text-green-700" :
                        student.status === "Absent"  ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => deleteStudent(student.id)}
                        className="text-red-400 hover:text-red-600 transition"
                        title="Remove student"
                      >
                        <FaTrash size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ClassStudentList;