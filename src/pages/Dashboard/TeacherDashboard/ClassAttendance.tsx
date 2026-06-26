import { useState } from "react";
import { useParams } from "react-router-dom";

const students = [
  {
    id: 1,
    roll: 1,
    name: "Ram Sharma",
    status: "Present",
  },
  {
    id: 2,
    roll: 2,
    name: "Sita Karki",
    status: "Present",
  },
  {
    id: 3,
    roll: 3,
    name: "Hari Thapa",
    status: "Absent",
  },
];

const ClassAttendance = () => {
  const { classId } = useParams();

  const [attendance, setAttendance] =
    useState(students);

  const updateStatus = (
    id: number,
    value: string
  ) => {
    setAttendance((prev) =>
      prev.map((student) =>
        student.id === id
          ? { ...student, status: value }
          : student
      )
    );
  };

  return (
    <div className="p-4 md:p-6">

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Attendance - {classId}
        </h1>

        <p className="text-slate-500">
          Mark attendance for students
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-left">Roll</th>
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((student) => (
                <tr
                  key={student.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {student.roll}
                  </td>

                  <td className="p-4">
                    {student.name}
                  </td>

                  <td className="p-4">
                    <select
                      value={student.status}
                      onChange={(e) =>
                        updateStatus(
                          student.id,
                          e.target.value
                        )
                      }
                      className="border rounded-lg px-3 py-2"
                    >
                      <option>
                        Present
                      </option>

                      <option>
                        Absent
                      </option>

                      <option>
                        Leave
                      </option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        <div className="p-4 border-t">
          <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700">
            Save Attendance
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClassAttendance;