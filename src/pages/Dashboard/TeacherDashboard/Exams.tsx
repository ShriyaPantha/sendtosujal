import { useState, useEffect } from "react";
import {
  ChevronRight, Save, BookOpen, Trophy, TrendingUp, Users,
  CheckCircle2, AlertCircle, Edit3, BarChart2, Award, Clock,
  ChevronDown, FileText, Star, Percent, Hash
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────

type Exam = {
  id: string;
  label: string;
  fullMark: number;
  passmark: number;
  date: string;
  type: "unit" | "mid" | "final";
  weight: number;
};

type Student = {
  id: number;
  name: string;
  roll: string;
  batch: string;
};

// ─── Data ──────────────────────────────────────────────

const CLASSES = [
  { id: 1, subject: "Data Structures", batch: "BCA 3rd Sem", room: "Room B1-205", time: "08:00 AM" },
  { id: 2, subject: "DBMS", batch: "CSIT 3rd Sem", room: "Room A2-101", time: "10:00 AM" },
  { id: 3, subject: "Algorithms", batch: "BIT 5th Sem", room: "Room C3-302", time: "01:00 PM" },
  { id: 4, subject: "Advanced Programming", batch: "BCA 1st Sem", room: "Lab-04", time: "03:00 PM" },
];

const STUDENT_LIST: Student[] = [
  { id: 1014, name: "Aarav Sharma", roll: "BCA-301", batch: "BCA 3rd Sem" },
  { id: 1022, name: "Anjali KC", roll: "BCA-306", batch: "BCA 3rd Sem" },
  { id: 1053, name: "Bikash Gurung", roll: "BIT-301", batch: "BIT 5th Sem" },
  { id: 1094, name: "Dinesh Thapa", roll: "CST-307", batch: "CSIT 3rd Sem" },
  { id: 1102, name: "Kiran Shrestha", roll: "BCA-102", batch: "BCA 1st Sem" },
  { id: 1115, name: "Kiran Shoki", roll: "BCA-109", batch: "BCA 1st Sem" },
  { id: 1125, name: "Manisha Rai", roll: "BCA-308", batch: "BCA 3rd Sem" },
  { id: 1141, name: "Niranjan Thapa", roll: "BCA-101", batch: "BCA 1st Sem" },
  { id: 1168, name: "Priya Tamang", roll: "CST-301", batch: "CSIT 3rd Sem" },
  { id: 1189, name: "Raju Shrestha", roll: "BCA-305", batch: "BCA 3rd Sem" },
  { id: 1201, name: "Ritu Karki", roll: "CST-310", batch: "CSIT 3rd Sem" },
  { id: 1224, name: "Sita Adhikari", roll: "BCA-304", batch: "BCA 3rd Sem" },
  { id: 1259, name: "Suraj Basnet", roll: "BIT-309", batch: "BIT 5th Sem" },
];

const EXAMS: Exam[] = [
  { id: "unit1", label: "Unit Test I", fullMark: 20, passmark: 8, date: "2026-03-10", type: "unit", weight: 10 },
  { id: "unit2", label: "Unit Test II", fullMark: 20, passmark: 8, date: "2026-04-15", type: "unit", weight: 10 },
  { id: "mid", label: "Mid-Term", fullMark: 40, passmark: 16, date: "2026-05-05", type: "mid", weight: 20 },
  { id: "final", label: "Final Board", fullMark: 100, passmark: 40, date: "2026-07-20", type: "final", weight: 60 },
];

// ─── Helpers ───────────────────────────────────────────

const STORAGE_KEY = (classId: number, examId: string) =>
  `exam_marks_${classId}_${examId}`;

const PUBLISHED_KEY = (classId: number, examId: string) =>
  `exam_published_${classId}_${examId}`;

// ─── Component ─────────────────────────────────────────

const ExamsAndMarks = () => {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [selectedExam, setSelectedExam] = useState<Exam>(EXAMS[0]);

  const [marks, setMarks] = useState<Record<number, number | "">>({});
  const [published, setPublished] = useState<Record<number, boolean>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<"entry" | "report">("entry");
  const [savedFlash, setSavedFlash] = useState(false);

  const students = STUDENT_LIST.filter(
    (s) => s.batch === selectedClass.batch
  );

  // Load from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(
      STORAGE_KEY(selectedClass.id, selectedExam.id)
    );
    setMarks(raw ? (JSON.parse(raw) as Record<number, number>) : {});

    const pub = localStorage.getItem(
      PUBLISHED_KEY(selectedClass.id, selectedExam.id)
    );
    setPublished(pub ? (JSON.parse(pub) as Record<number, boolean>) : {});
  }, [selectedClass, selectedExam]);

  // Handle mark input
  const handleMark = (studentId: number, val: string) => {
    const num = Number(val);
    const clamped = isNaN(num)
      ? ""
      : Math.min(selectedExam.fullMark, Math.max(0, num));

    setMarks((prev) => ({
      ...prev,
      [studentId]: clamped,
    }));
  };

  // Save marks
  const saveMarks = () => {
    localStorage.setItem(
      STORAGE_KEY(selectedClass.id, selectedExam.id),
      JSON.stringify(marks)
    );
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  // Publish toggle
  const togglePublish = (studentId: number) => {
    const updated = {
      ...published,
      [studentId]: !published[studentId],
    };

    setPublished(updated);

    localStorage.setItem(
      PUBLISHED_KEY(selectedClass.id, selectedExam.id),
      JSON.stringify(updated)
    );
  };

  // Stats
  const entered = students.filter(
    (s) => marks[s.id] !== undefined && marks[s.id] !== ""
  ).length;

  const avgScore =
    entered === 0
      ? 0
      : Math.round(
          students.reduce(
            (sum, s) => sum + (Number(marks[s.id]) || 0),
            0
          ) / entered
        );

  const highest =
    entered === 0
      ? 0
      : Math.max(...students.map((s) => Number(marks[s.id]) || 0));

  const passCount = students.filter(
    (s) => (Number(marks[s.id]) || 0) >= selectedExam.passmark
  ).length;

  const failCount = entered - passCount;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Exams & Marks</h1>

      {/* Class Select */}
      <div className="flex gap-2">
        {CLASSES.map((cls) => (
          <button
            key={cls.id}
            onClick={() => setSelectedClass(cls)}
            className="px-3 py-1 border rounded"
          >
            {cls.subject}
          </button>
        ))}
      </div>

      {/* Exam Select */}
      <div className="flex gap-2 mt-2">
        {EXAMS.map((exam) => (
          <button
            key={exam.id}
            onClick={() => setSelectedExam(exam)}
            className="px-3 py-1 border rounded"
          >
            {exam.label}
          </button>
        ))}
      </div>

      {/* Save */}
      <button
        onClick={saveMarks}
        className="bg-black text-white px-4 py-2 rounded mt-4"
      >
        {savedFlash ? "Saved!" : "Save Marks"}
      </button>

      {/* Table */}
      <div className="mt-4 space-y-2">
        {students.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 border p-2 rounded"
          >
            <div className="w-40">{s.name}</div>

            <input
              type="number"
              value={marks[s.id] ?? ""}
              onChange={(e) => handleMark(s.id, e.target.value)}
              className="border px-2 w-20"
            />

            <button
              onClick={() => togglePublish(s.id)}
              className="text-sm border px-2"
            >
              {published[s.id] ? "Published" : "Publish"}
            </button>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 text-sm">
        Avg: {avgScore} | Highest: {highest} | Pass: {passCount} | Fail:{" "}
        {failCount}
      </div>
    </div>
  );
};

export default ExamsAndMarks;