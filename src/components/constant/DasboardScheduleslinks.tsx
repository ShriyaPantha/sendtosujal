import { 
  FileText, 
  Code2, 
  Network, 
  Database 
} from "lucide-react";

export const scheduleData = [
  { id: 1, time: "08:00 AM", subject: "Data Structures", prof: "Prof. Roshan Shrestha", room: "Room B1-205", color: "bg-blue-600" },
  { id: 2, time: "10:00 AM", subject: "Database Systems", prof: "Prof. Anuja Rai", room: "Room B1-207", color: "bg-purple-600" },
  { id: 3, time: "12:00 PM", subject: "Web Technologies", prof: "Prof. Sagar Poudel", room: "Room B1-301", color: "bg-emerald-500" },
  { id: 4, time: "02:00 PM", subject: "Computer Networks", prof: "Prof. Nabin Karki", room: "Room B1-203", color: "bg-gray-400" },
];

export const assignmentData = [
  { 
    id: 1, 
    title: "Data Structures - Lab", 
    desc: "Implement Linked List", 
    due: "Due: May 25, 2026", 
    status: "In Progress", 
    statusStyle: "bg-blue-50 text-blue-600",
    icon: Code2,
    iconBg: "bg-purple-100 text-purple-600"
  },
  { 
    id: 2, 
    title: "Web Technologies", 
    desc: "Build a Personal Portfolio", 
    due: "Due: May 26, 2026", 
    status: "Not Started", 
    statusStyle: "bg-gray-100 text-gray-500",
    icon: FileText,
    iconBg: "bg-orange-100 text-orange-600"
  },
  { 
    id: 3, 
    title: "Database Systems", 
    desc: "ER Diagram Design", 
    due: "Due: May 27, 2026", 
    status: "Submitted", 
    statusStyle: "bg-emerald-50 text-emerald-600",
    icon: Database,
    iconBg: "bg-emerald-100 text-emerald-600"
  },
  { 
    id: 4, 
    title: "Computer Networks", 
    desc: "Network Topology Report", 
    due: "Due: May 29, 2026", 
    status: "In Progress", 
    statusStyle: "bg-blue-50 text-blue-600",
    icon: Network,
    iconBg: "bg-indigo-100 text-indigo-600"
  },
];

export const examData = [
  { id: 1, title: "Data Structures & Algorithms", date: "May 28, 2026 • 10:00 AM", venue: "Hall B1", countdown: "7 Days" },
  { id: 2, title: "Database Systems", date: "June 02, 2026 • 10:00 AM", venue: "Hall B2", countdown: "12 Days" },
  { id: 3, title: "Web Technologies", date: "June 05, 2026 • 01:00 PM", venue: "Hall B1", countdown: "15 Days" },
  { id: 4, title: "Computer Networks", date: "June 10, 2026 • 10:00 AM", venue: "Hall B2", countdown: "20 Days" },
];