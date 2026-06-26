import { useState, useEffect, useMemo, useCallback } from "react";
import axiosInstance from "../../../api/axiosInstance"; 

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface FoundUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}

interface StudentOption {
  _id: string;
  admissionNumber: string;
  class: string;
  section: string;
  userId?: { fullName: string; email: string };
}

interface ParentRecord {
  _id: string;
  occupation: string | null;
  address: string | null;
  phone: string | null;
  status?: string;
  userId: { _id: string; fullName: string; email: string; role: string };
  schoolId?: { _id: string; name: string };
  createdBy?: { fullName: string; email: string };
  students: StudentOption[];
}

interface FormState {
  occupation: string;
  address: string;
  phone: string;
  students: string[];
}

const initialForm: FormState = {
  occupation: "",
  address: "",
  phone: "",
  students: [],
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function ParentsPage() {
  // ----- shared / list state -----
  const [parents, setParents] = useState<ParentRecord[]>([]);
  const [parentsLoading, setParentsLoading] = useState(true);
  const [parentsError, setParentsError] = useState<string | null>(null);
  const [listSearch, setListSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ----- form state -----
  const [form, setForm] = useState<FormState>(initialForm);
  const [emailQuery, setEmailQuery] = useState("");
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // ----- loaders -----
  const loadParents = useCallback(async () => {
    setParentsLoading(true);
    setParentsError(null);
    try {
      const res = await axiosInstance.get("/api/parents");
      const data: ParentRecord[] = res.data?.data ?? [];
      setParents(data);
      if (data.length > 0) {
        setSelectedId((prev) => prev ?? data[0]._id);
      }
    } catch (err: any) {
      setParentsError(err.response?.data?.message || "Couldn't load parents");
    } finally {
      setParentsLoading(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const res = await axiosInstance.get("/api/students");
      setStudents(res.data?.data ?? []);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Couldn't load students");
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParents();
    loadStudents();
  }, [loadParents, loadStudents]);

  // ----- email lookup -----
  async function handleLookupUser() {
    const email = emailQuery.trim();
    if (!email) {
      setLookupError("Enter an email to look up.");
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    setFoundUser(null);
    try {
      const res = await axiosInstance.get("/api/auth/by-email", { params: { email } });
      const user: FoundUser | undefined = res.data?.data ?? res.data?.user ?? res.data;
      if (!user?._id) {
        setLookupError("No user found with that email.");
        return;
      }
      setFoundUser(user);
    } catch (err: any) {
      setLookupError(err.response?.data?.message || "No user found with that email.");
    } finally {
      setLookupLoading(false);
    }
  }

  // ----- derived -----
  const filteredFormStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const name = s.userId?.fullName?.toLowerCase() ?? "";
      const admission = s.admissionNumber?.toLowerCase() ?? "";
      return name.includes(q) || admission.includes(q);
    });
  }, [students, studentSearch]);

  const filteredParents = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    if (!q) return parents;
    return parents.filter((p) => {
      const name = p.userId?.fullName?.toLowerCase() ?? "";
      const email = p.userId?.email?.toLowerCase() ?? "";
      const phone = p.phone?.toLowerCase() ?? "";
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [parents, listSearch]);

  const selectedParent = parents.find((p) => p._id === selectedId) ?? null;
  const selectedFormStudents = students.filter((s) => form.students.includes(s._id));

  // ----- handlers -----
  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleStudent(studentId: string) {
    setForm((prev) => {
      const isSelected = prev.students.includes(studentId);
      return {
        ...prev,
        students: isSelected
          ? prev.students.filter((id) => id !== studentId)
          : [...prev.students, studentId],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!foundUser) {
      setFormError("Look up a user by email first.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/api/parents", {
        userId: foundUser._id,
        occupation: form.occupation || undefined,
        address: form.address || undefined,
        phone: form.phone || undefined,
        students: form.students,
      });

      const newParent = res.data?.data;
      setFormSuccess(`Parent account created for ${newParent?.userId?.fullName ?? foundUser.fullName}.`);
      setForm(initialForm);
      setEmailQuery("");
      setFoundUser(null);
      setStudentSearch("");

      // refresh the list and jump to the new record
      await loadParents();
      if (newParent?._id) setSelectedId(newParent._id);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* ───────────────────────── Create parent ───────────────────────── */}
        <section>
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">Create parent account</h1>
            <p className="mt-1 text-sm text-slate-500">
              Turn an existing user into a parent and link the students they should see.
            </p>
          </header>

          {formError && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          {formSuccess && (
            <div
              role="status"
              className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              {formSuccess}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            {/* User lookup */}
            <div>
              <label htmlFor="emailQuery" className="block text-sm font-medium text-slate-700">
                User's email
              </label>
              <p className="mt-0.5 text-xs text-slate-500">
                This user's role will be changed to parent.
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  id="emailQuery"
                  type="email"
                  value={emailQuery}
                  onChange={(e) => {
                    setEmailQuery(e.target.value);
                    setFoundUser(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleLookupUser();
                    }
                  }}
                  placeholder="parent@example.com"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
                <button
                  type="button"
                  onClick={handleLookupUser}
                  disabled={lookupLoading}
                  className="shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  {lookupLoading ? "Looking up…" : "Find"}
                </button>
              </div>

              {lookupError && (
                <p className="mt-2 text-sm text-red-600">{lookupError}</p>
              )}

              {foundUser && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{foundUser.fullName}</p>
                    <p className="text-xs text-slate-500">{foundUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFoundUser(null);
                      setEmailQuery("");
                    }}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>


            {/* Contact details */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-slate-700">
                  Occupation
                </label>
                <input
                  id="occupation"
                  type="text"
                  value={form.occupation}
                  onChange={(e) => updateField("occupation", e.target.value)}
                  placeholder="Optional"
                  className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="Optional"
                  className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                Address
              </label>
              <textarea
                id="address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Optional"
                rows={2}
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Student linking */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Link students
                </label>
                <span className="text-xs text-slate-500">
                  {form.students.length} selected
                </span>
              </div>

              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by name or admission number"
                disabled={optionsLoading}
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              />

              <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-slate-200">
                {optionsLoading ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">
                    Loading students…
                  </p>
                ) : filteredFormStudents.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">
                    No students match that search.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {filteredFormStudents.map((s) => {
                      const checked = form.students.includes(s._id);
                      return (
                        <li key={s._id}>
                          <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleStudent(s._id)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-400"
                            />
                            <span className="flex-1">
                              <span className="font-medium text-slate-800">
                                {s.userId?.fullName ?? "Unnamed student"}
                              </span>
                              <span className="ml-2 text-slate-400">{s.userId?.email}</span>
                            </span>
                            <span className="text-xs text-slate-400">
                              {s.class}
                              {s.section ? ` ${s.section}` : ""} · {s.admissionNumber}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {selectedFormStudents.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedFormStudents.map((s) => (
                    <span
                      key={s._id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                    >
                      {s.userId?.fullName ?? s.admissionNumber}
                      <button
                        type="button"
                        onClick={() => toggleStudent(s._id)}
                        aria-label={`Remove ${s.userId?.fullName ?? s.admissionNumber}`}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => {
                  setForm(initialForm);
                  setEmailQuery("");
                  setFoundUser(null);
                  setLookupError(null);
                  setStudentSearch("");
                  setFormError(null);
                  setFormSuccess(null);
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={submitting || optionsLoading}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? "Creating…" : "Create parent account"}
              </button>
            </div>
          </form>
        </section>

        {/* ───────────────────────── All parents ───────────────────────── */}
        <section>
          <header className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">All parents</h2>
            <p className="mt-1 text-sm text-slate-500">
              {parentsLoading
                ? "Loading…"
                : `${parents.length} parent account${parents.length === 1 ? "" : "s"}`}
            </p>
          </header>

          {parentsError && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {parentsError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            {/* List */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-3">
                <input
                  type="text"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  placeholder="Search by name, email, or phone"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="max-h-150 overflow-y-auto">
                {parentsLoading ? (
                  <p className="px-4 py-8 text-center text-sm text-slate-400">
                    Loading parents…
                  </p>
                ) : filteredParents.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-slate-400">
                    No parents match that search.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {filteredParents.map((p) => {
                      const isActive = p._id === selectedId;
                      return (
                        <li key={p._id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(p._id)}
                            className={`block w-full px-4 py-3 text-left transition-colors ${
                              isActive ? "bg-slate-100" : "hover:bg-slate-50"
                            }`}
                          >
                            <p className="text-sm font-medium text-slate-800">
                              {p.userId?.fullName ?? "Unnamed parent"}
                            </p>
                            <p className="text-xs text-slate-500">{p.userId?.email}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              {p.students?.length ?? 0} linked student
                              {p.students?.length === 1 ? "" : "s"}
                            </p>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Detail panel */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              {!selectedParent ? (
                <p className="text-sm text-slate-400">
                  {parentsLoading ? "Loading…" : "Select a parent to view details."}
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {selectedParent.userId?.fullName}
                      </h3>
                      <p className="text-sm text-slate-500">{selectedParent.userId?.email}</p>
                    </div>
                    {selectedParent.status && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {selectedParent.status}
                      </span>
                    )}
                  </div>

                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Phone
                      </dt>
                      <dd className="mt-1 text-sm text-slate-700">
                        {selectedParent.phone || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Occupation
                      </dt>
                      <dd className="mt-1 text-sm text-slate-700">
                        {selectedParent.occupation || "—"}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Address
                      </dt>
                      <dd className="mt-1 text-sm text-slate-700">
                        {selectedParent.address || "—"}
                      </dd>
                    </div>
                    {selectedParent.schoolId?.name && (
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          School
                        </dt>
                        <dd className="mt-1 text-sm text-slate-700">
                          {selectedParent.schoolId.name}
                        </dd>
                      </div>
                    )}
                    {selectedParent.createdBy?.fullName && (
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Created by
                        </dt>
                        <dd className="mt-1 text-sm text-slate-700">
                          {selectedParent.createdBy.fullName}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Linked students
                    </h4>
                    {selectedParent.students.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-400">No students linked yet.</p>
                    ) : (
                      <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
                        {selectedParent.students.map((s) => (
                          <li key={s._id} className="flex items-center justify-between px-4 py-2.5">
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {s.userId?.fullName ?? "Unnamed student"}
                              </p>
                              <p className="text-xs text-slate-500">{s.userId?.email}</p>
                            </div>
                            <p className="text-xs text-slate-400">
                              {s.class}
                              {s.section ? ` ${s.section}` : ""} · {s.admissionNumber}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}