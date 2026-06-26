import React, { createContext, useContext, useState, type ReactNode, } from "react";

// --- Interfaces ---
export interface Assignment {
  id: number;
  title: string;
  subject: string;
  batch: string;
  due: string;
  submissions: number;
  total: number;
  status: "Active" | "Graded" | "Draft";
  type: string;
}

export interface Submission {
  id: number;
  student: string;
  roll: string;
  assignment: string;
  submitted: string;
  grade: string | null;
  status: "Submitted" | "Graded" | "Late";
}



export interface ClassSchedule {
  id: number;
  subject: string;
  batch: string;
  room: string;
  time: string;
  status: "done" | "ongoing" | "upcoming";
}

interface DataStoreContextType {
  totalStudents: number;
  assignments: Assignment[];
  submissions: Submission[];
  students: Student[];
  classes: ClassSchedule[];
  ungradedCount: number;
  updateAttendance: (studentId: number, status: "Present" | "Absent" | "Late" | "Leave") => void;
  addAssignment: (assignment: Omit<Assignment, "id" | "submissions" | "total" | "status">) => void;
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined);

export const DataStoreProvider = ({ children }: { children: ReactNode }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: 1, title: "DBMS Mid-Term Assignment", subject: "DBMS", batch: "CSIT 3rd Sem", due: "Jun 10, 2026", submissions: 18, total: 22, status: "Active", type: "Assignment" },
    { id: 2, title: "Data Structures Lab Report", subject: "Data Structures", batch: "BCA 3rd Sem", due: "Jun 12, 2026", submissions: 12, total: 20, status: "Active", type: "Lab Report" },
  ]);

  const [students, setStudents] = useState<Student[]>([
    { id: 1014, name: "Aarav Sharma", roll: "BCA-301", batch: "BCA 3rd Sem", status: "Present" },
    { id: 1022, name: "Anjali KC", roll: "BCA-306", batch: "BCA 3rd Sem", status: "Present" },
    { id: 1053, name: "Bikash Gurung", roll: "BIT-301", batch: "BIT 5th Sem", status: "Present" },
    { id: 1094, name: "Dinesh Thapa", roll: "CST-307", batch: "CSIT 3rd Sem", status: "Present" },
    { id: 1102, name: "Kiran Shrestha", roll: "BCA-102", batch: "BCA 1st Sem", status: "Present" },
    { id: 1115, name: "Kiran Shoki", roll: "BCA-109", batch: "BCA 1st Sem", status: "Present" },
    { id: 1125, name: "Manisha Rai", roll: "BCA-308", batch: "BCA 3rd Sem", status: "Present" },
    { id: 1141, name: "Niranjan Thapa", roll: "BCA-101", batch: "BCA 1st Sem", status: "Present" },
    { id: 1168, name: "Priya Tamang", roll: "CST-301", batch: "CSIT 3rd Sem", status: "Present" },
    { id: 1189, name: "Raju Shrestha", roll: "BCA-305", batch: "BCA 3rd Sem", status: "Present" },
    { id: 1201, name: "Ritu Karki", roll: "CST-310", batch: "CSIT 3rd Sem", status: "Present" },
    { id: 1224, name: "Sita Adhikari", roll: "BCA-304", batch: "BCA 3rd Sem", status: "Present" },
    { id: 1259, name: "Suraj Basnet", roll: "BIT-309", batch: "BIT 5th Sem", status: "Present" },
  ]);

  const submissions: Submission[] = [];

  const [classes] = useState<ClassSchedule[]>([
    { id: 1, subject: "Data Structures", batch: "BCA 3rd Sem", room: "Room B1-205", time: "08:00 AM", status: "done" },
    { id: 2, subject: "DBMS", batch: "CSIT 3rd Sem", room: "Room A2-101", time: "10:00 AM", status: "ongoing" },
    { id: 3, subject: "Algorithms", batch: "BIT 5th Sem", room: "Room C3-302", time: "01:00 PM", status: "upcoming" },
    { id: 4, subject: "Advanced Programming", batch: "BCA 1st Sem", room: "Lab-04", time: "03:00 PM", status: "upcoming" },
  ]);

  const ungradedCount = submissions.filter((s) => s.status !== "Graded").length;

  const updateAttendance = (studentId: number, status: "Present" | "Absent" | "Late" | "Leave") => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status } : s)));
  };

  const addAssignment = (newAsg: Omit<Assignment, "id" | "submissions" | "total" | "status">) => {
    setAssignments((prev) => [
      ...prev,
      { ...newAsg, id: Date.now(), submissions: 0, total: 22, status: "Active" },
    ]);
  };

  return (
    <DataStoreContext.Provider
      value={{
        totalStudents: students.length,
        assignments,
        submissions,
        students,
        classes,
        ungradedCount,
        updateAttendance,
        addAssignment,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  );
};

export const useDataStore = () => {
  const context = useContext(DataStoreContext);
  if (!context) throw new Error("useDataStore must be used inside DataStoreProvider");
  return context;
};