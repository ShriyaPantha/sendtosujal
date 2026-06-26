import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Baby, Loader2, Mail, Phone } from 'lucide-react';
import axiosInstance from "../../../../api/axiosInstance"; 

interface RecentParent {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  occupation: string | null;
  childrenCount: number;
  status: "active" | "inactive";
  joinedAt: string;
}

interface ParentsOverviewData {
  totalParents: number;
  activeParents: number;
  recentParents: RecentParent[];
}

const StatPill = ({ icon, label, value, bg, color }: { icon: React.ReactNode; label: string; value: number; bg: string; color: string }) => (
  <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 flex-1 min-w-36">
    <div className={`p-2 rounded-xl ${bg} ${color}`}>{icon}</div>
    <div>
      <p className="text-[11px] text-slate-400 font-medium">{label}</p>
      <p className="text-lg font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default function ParentOverview() {
  const [data, setData] = useState<ParentsOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/api/admin/dashboard/parents-overview")
      .then((res) => setData(res.data.data))
      .catch((e) => setError(e.response?.data?.message || e.message || "Failed to load parent details"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full bg-slate-50 px-1 pb-4 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-blue-600" size={18} />
          <h3 className="font-bold text-slate-700 text-base">Parent Overview</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-slate-400" size={20} />
          </div>
        ) : error ? (
          <p className="text-xs text-red-500 py-4">{error}</p>
        ) : !data ? null : (
          <>
            <div className="flex flex-wrap gap-3 mb-5">
              <StatPill
                icon={<Users size={16} />}
                label="Total Parents"
                value={data.totalParents}
                bg="bg-blue-50"
                color="text-blue-600"
              />
              <StatPill
                icon={<UserCheck size={16} />}
                label="Active Parents"
                value={data.activeParents}
                bg="bg-emerald-50"
                color="text-emerald-600"
              />
              <StatPill
                icon={<Baby size={16} />}
                label="Avg. Children / Parent"
                value={
                  data.recentParents.length > 0
                    ? Math.round(
                        (data.recentParents.reduce((sum, p) => sum + p.childrenCount, 0) /
                          data.recentParents.length) *
                          10
                      ) / 10
                    : 0
                }
                bg="bg-purple-50"
                color="text-purple-600"
              />
            </div>

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Recently Added</p>

            {data.recentParents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No parents added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                      <th className="pb-2 font-medium">Name</th>
                      <th className="pb-2 font-medium">Contact</th>
                      <th className="pb-2 font-medium">Occupation</th>
                      <th className="pb-2 font-medium text-center">Children</th>
                      <th className="pb-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.recentParents.map((parent) => (
                      <tr key={parent.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 text-xs font-bold text-slate-700">{parent.name}</td>
                        <td className="py-2.5 text-xs text-slate-500">
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1"><Mail size={11} className="text-slate-300" /> {parent.email}</span>
                            {parent.phone && (
                              <span className="flex items-center gap-1"><Phone size={11} className="text-slate-300" /> {parent.phone}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 text-xs text-slate-500">{parent.occupation || "—"}</td>
                        <td className="py-2.5 text-xs text-slate-700 font-medium text-center">{parent.childrenCount}</td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                              parent.status === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {parent.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}