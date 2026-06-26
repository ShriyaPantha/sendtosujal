// src/pages/Dashboard/ParentDashboard/DataStore.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Assignment {
  id: number;
  title: string;
  subject: string;
  due: string;
  status: "pending" | "in-progress" | "submitted";
}

export interface Grade {
  subject: string;
  score: number;
  grade: string;
  color: string;
  teacher: string;
}

export interface FeeRecord {
  id: number;
  label: string;
  amount: number;
  due: string;
  paid: boolean;
  paidOn?: string;
}

export interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "late";
}

export interface Notice {
  id: number;
  title: string;
  desc: string;
  date: string;
  important: boolean;
}

export interface SchoolEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "meeting" | "holiday" | "event";
}

export interface Message {
  id: number;
  from: string;
  role: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
  thread: { sender: "me" | "them"; text: string; time: string }[];
}

// ── Context Type ──────────────────────────────────────────────────────────────

interface DataStoreContextType {
  // Student
  studentName: string;
  parentName: string;
  grade: string;
  rollNo: string;
  teacher: string;
  avatarInitials: string;

  // Summary stats
  attendanceRate: number;
  totalDays: number;
  presentDays: number;
  pendingFees: number;

  // Page data
  assignments: Assignment[];
  grades: Grade[];
  fees: FeeRecord[];
  attendance: AttendanceRecord[];
  notices: Notice[];
  events: SchoolEvent[];
  messages: Message[];
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const mockData: DataStoreContextType = {
  // Student info
  studentName: "Aayush Shrestha",
  parentName: "Rajesh Shrestha",
  grade: "Grade 5 – Section A",
  rollNo: "24",
  teacher: "Mrs. Sharma",
  avatarInitials: "AS",

  // Summary
  attendanceRate: 93,
  totalDays: 180,
  presentDays: 167,
  pendingFees: 450,

  // Assignments
  assignments: [
    { id: 1, title: "Mathematics - Algebra Worksheet", subject: "Math",    due: "Jun 10, 2026", status: "pending" },
    { id: 2, title: "Science Project - Solar System",  subject: "Science", due: "Jun 15, 2026", status: "in-progress" },
    { id: 3, title: "English Essay - My Role Model",   subject: "English", due: "Jun 08, 2026", status: "submitted" },
    { id: 4, title: "Social Studies - Map Work",       subject: "S.St",    due: "Jun 18, 2026", status: "pending" },
    { id: 5, title: "Computer - MS Word Practice",     subject: "Comp",    due: "Jun 12, 2026", status: "submitted" },
  ],

  // Grades
  grades: [
    { subject: "Mathematics",    score: 92, grade: "A",  color: "indigo",  teacher: "Mr. Thapa" },
    { subject: "Science",        score: 88, grade: "B+", color: "emerald", teacher: "Mrs. Rai" },
    { subject: "English",        score: 79, grade: "B",  color: "blue",    teacher: "Mrs. Sharma" },
    { subject: "Social Studies", score: 85, grade: "B+", color: "amber",   teacher: "Mr. Karki" },
    { subject: "Computer",       score: 95, grade: "A+", color: "violet",  teacher: "Mr. Pandey" },
  ],

  // Fees
  fees: [
    { id: 1, label: "Quarter 1 – Tuition Fee", amount: 500, due: "Mar 10, 2026", paid: true,  paidOn: "Mar 08, 2026" },
    { id: 2, label: "Annual Sports Fee",        amount: 200, due: "Apr 01, 2026", paid: true,  paidOn: "Mar 30, 2026" },
    { id: 3, label: "Quarter 2 – Tuition Fee", amount: 500, due: "Jun 20, 2026", paid: false },
    { id: 4, label: "Library Fee",              amount: 50,  due: "Jun 20, 2026", paid: false },
    { id: 5, label: "Quarter 3 – Tuition Fee", amount: 500, due: "Sep 10, 2026", paid: false },
  ],

  // Attendance (last 30 days sample)
  attendance: [
    { date: "2026-05-01", status: "present" }, { date: "2026-05-02", status: "absent" },
    { date: "2026-05-05", status: "present" }, { date: "2026-05-06", status: "present" },
    { date: "2026-05-07", status: "late" },    { date: "2026-05-08", status: "present" },
    { date: "2026-05-09", status: "present" }, { date: "2026-05-12", status: "present" },
    { date: "2026-05-13", status: "absent" },  { date: "2026-05-14", status: "present" },
    { date: "2026-05-15", status: "present" }, { date: "2026-05-16", status: "present" },
    { date: "2026-05-19", status: "present" }, { date: "2026-05-20", status: "present" },
    { date: "2026-05-21", status: "late" },    { date: "2026-05-22", status: "present" },
    { date: "2026-05-23", status: "present" }, { date: "2026-05-26", status: "present" },
    { date: "2026-05-27", status: "present" }, { date: "2026-05-28", status: "absent" },
    { date: "2026-05-29", status: "present" }, { date: "2026-05-30", status: "present" },
    { date: "2026-06-02", status: "present" }, { date: "2026-06-03", status: "present" },
    { date: "2026-06-04", status: "present" }, { date: "2026-06-05", status: "late" },
    { date: "2026-06-06", status: "present" }, { date: "2026-06-09", status: "present" },
    { date: "2026-06-10", status: "present" }, { date: "2026-06-11", status: "present" },
  ],

  // Notices
  notices: [
    { id: 1, title: "School Closed on June 12",  desc: "Due to local elections, school will remain closed.", date: "Jun 05, 2026", important: true },
    { id: 2, title: "PTA Meeting Schedule",       desc: "PTA meeting on June 12 at 10 AM in the auditorium.", date: "Jun 04, 2026", important: false },
    { id: 3, title: "Exam Timetable Released",    desc: "Final exam schedule for Grade 5 has been published.", date: "Jun 03, 2026", important: true },
    { id: 4, title: "Summer Homework Guidelines", desc: "Students must complete the summer activity booklet.", date: "Jun 02, 2026", important: false },
  ],

  // Events
  events: [
    { id: 1, title: "Parent-Teacher Meeting", date: "Jun 12, 2026", time: "10:00 AM", location: "School Auditorium", type: "meeting" },
    { id: 2, title: "Summer Break Begins",    date: "Jun 20, 2026", time: "All Day",  location: "School Closed",    type: "holiday" },
    { id: 3, title: "Annual Sports Day",      date: "Jun 25, 2026", time: "8:00 AM", location: "School Ground",    type: "event" },
    { id: 4, title: "Final Exam – Day 1",     date: "Jun 17, 2026", time: "9:00 AM", location: "Exam Hall",        type: "event" },
    { id: 5, title: "Result Distribution",    date: "Jul 05, 2026", time: "11:00 AM",location: "Classrooms",       type: "meeting" },
  ],

  // Messages
  messages: [
    {
      id: 1,
      from: "Mrs. Sharma",
      role: "Class Teacher",
      avatar: "SS",
      preview: "Aayush has shown great improvement this week.",
      time: "Today, 9:15 AM",
      unread: true,
      thread: [
        { sender: "them", text: "Good morning! I wanted to share that Aayush has shown great improvement this week in class participation.", time: "9:15 AM" },
        { sender: "me",   text: "Thank you so much for the update, Mrs. Sharma! We've been working with him at home.", time: "9:32 AM" },
        { sender: "them", text: "That's wonderful to hear. Keep encouraging him. He's doing very well!", time: "9:45 AM" },
      ],
    },
    {
      id: 2,
      from: "Mr. Thapa",
      role: "Math Teacher",
      avatar: "MT",
      preview: "Please remind Aayush to submit the worksheet.",
      time: "Yesterday",
      unread: true,
      thread: [
        { sender: "them", text: "Hi, just a reminder that the algebra worksheet is due tomorrow. Please remind Aayush to submit it.", time: "Jun 09, 3:00 PM" },
        { sender: "me",   text: "Sure, I'll remind him tonight. Thank you!", time: "Jun 09, 6:10 PM" },
      ],
    },
    {
      id: 3,
      from: "School Admin",
      role: "Administration",
      avatar: "SA",
      preview: "Fee payment reminder for Quarter 2.",
      time: "Jun 05",
      unread: false,
      thread: [
        { sender: "them", text: "Dear Parent, this is a reminder that Quarter 2 tuition fees are due by June 20, 2026. Please make the payment on time.", time: "Jun 05, 10:00 AM" },
      ],
    },
  ],
};

// ── Provider ──────────────────────────────────────────────────────────────────

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined);

export const DataStoreProvider = ({ children }: { children: ReactNode }) => {
  const [data] = useState(mockData);
  return (
    <DataStoreContext.Provider value={data}>
      {children}
    </DataStoreContext.Provider>
  );
};

export const useDataStore = () => {
  const context = useContext(DataStoreContext);
  if (!context) throw new Error("useDataStore must be used within a DataStoreProvider");
  return context;
};
