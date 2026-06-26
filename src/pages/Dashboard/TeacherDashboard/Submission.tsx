import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useDataStore } from "./DataStore";

const Submissions = () => {
  const { submissions, updateSubmissionStatus } = useDataStore();
  const location = useLocation();

  // safer parsing
  const assignmentId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("assignment");
    return id ? Number(id) : null;
  }, [location.search]);

  const filtered = useMemo(() => {
    return assignmentId
      ? submissions.filter((s) => s.assignmentId === assignmentId)
      : submissions;
  }, [submissions, assignmentId]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">
        {assignmentId ? "Assignment Submissions" : "All Submissions"}
      </h1>

      {filtered.length === 0 ? (
        <div className="bg-white border p-6 rounded-xl text-slate-400">
          No submissions found
        </div>
      ) : (
        filtered.map((s) => (
          <div key={s.id} className="bg-white border rounded-xl p-4">
            <div className="flex justify-between">
              <h2 className="font-semibold">{s.studentName}</h2>
              <span className="text-xs text-slate-500">
                {s.submittedAt}
              </span>
            </div>

            <p className="text-sm text-slate-600 mt-2">{s.text}</p>

            <div className="mt-3 flex justify-between items-center">
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  s.status === "Submitted"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {s.status}
              </span>

              <button
                onClick={() => updateSubmissionStatus(s.id, "Reviewed")}
                className="text-xs bg-violet-600 text-white px-3 py-1 rounded-lg"
              >
                Mark Reviewed
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Submissions;