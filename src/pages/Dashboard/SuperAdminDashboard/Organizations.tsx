import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTrash,
  // FaMagnifyingGlass,
  FaBuilding,
  // FaRotateRight,
  FaCheckCircle,
  FaEdit,
  // FaCircleXmark,
  // FaCircleDot,
} from "react-icons/fa";
import { FaMagnifyingGlass, FaRotateRight } from "react-icons/fa6";

interface Organization {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt?: string;
  subscription?: {
    status: "active" | "expired" | "cancelled";
    plan?: "basic" | "standard" | "premium";
  } | null;
}

interface FormState {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

const API =
  (import.meta as any)?.env?.VITE_API_URL ?? "http://localhost:4000/api";

const http = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: API,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

// status UI
const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
  expired: { label: "Expired", color: "bg-rose-100 text-rose-700" },
  cancelled: { label: "Cancelled", color: "bg-slate-200 text-slate-600" },
  none: { label: "No Plan", color: "bg-slate-100 text-slate-500" },
};

const Organizations = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  // ───── FETCH ─────
  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http().get("/organizations");
      setOrgs(res.data?.data ?? res.data ?? []);
    } catch {
      setError("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  // ───── FILTER ─────
  const filtered = orgs.filter((o) => {
    const q = search.toLowerCase();

    const matchSearch =
      o.fullName.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q);

    const matchStatus =
      !statusFilter ||
      (o.subscription?.status ?? "none") === statusFilter;

    return matchSearch && matchStatus;
  });

  // ───── CREATE / UPDATE ─────
  const handleSubmit = async () => {
    if (!form.fullName || !form.email) return;

    try {
      if (editingId) {
        await http().put(`/organizations/${editingId}`, form);
      } else {
        await http().post("/organizations", form);
      }

      setShowModal(false);
      setEditingId(null);

      setForm({
        fullName: "",
        email: "",
        password: "",
        phone: "",
      });

      fetchOrgs();
    } catch {
      alert("Failed to save organization");
    }
  };

  // ───── EDIT ─────
  const handleEdit = (org: Organization) => {
    setEditingId(org._id);
    setForm({
      fullName: org.fullName,
      email: org.email,
      password: "",
      phone: org.phone ?? "",
    });
    setShowModal(true);
  };

  // ───── DELETE ─────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this organization?")) return;

    try {
      await http().delete(`/organizations/${id}`);
      fetchOrgs();
    } catch {
      alert("Delete failed");
    }
  };

  // ───── UI ─────
  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-sm text-slate-500">
            Manage schools & institutions
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus /> Add
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-3 rounded-xl border flex gap-3 flex-wrap">
        <div className="flex items-center border px-3 py-2 rounded-lg flex-1">
          <FaMagnifyingGlass className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations..."
            className="ml-2 w-full outline-none"
          />
        </div>

        <select
          className="border px-3 py-2 rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
          <option value="none">No Plan</option>
        </select>

        <button
          onClick={fetchOrgs}
          className="border px-3 py-2 rounded-lg"
        >
          <FaRotateRight />
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-2 rounded">
          {error}
        </div>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No organizations found</p>
        ) : (
          filtered.map((org) => {
            const status = org.subscription?.status ?? "none";

            return (
              <div
                key={org._id}
                className="bg-white border rounded-xl p-4 flex justify-between items-center hover:shadow"
              >
                <div>
                  <h2 className="font-semibold">{org.fullName}</h2>
                  <p className="text-sm text-gray-500">{org.email}</p>

                  <span
                    className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${statusMap[status].color}`}
                  >
                    {statusMap[status].label}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(org)}
                    className="text-indigo-600"
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={() => handleDelete(org._id)}
                    className="text-red-500"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-5 rounded-xl w-[380px] space-y-3">

            <input
              placeholder="Full Name"
              className="border p-2 w-full rounded"
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
            />

            <input
              placeholder="Email"
              className="border p-2 w-full rounded"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              placeholder="Phone"
              className="border p-2 w-full rounded"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            {!editingId && (
              <input
                type="password"
                placeholder="Password"
                className="border p-2 w-full rounded"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Organizations;