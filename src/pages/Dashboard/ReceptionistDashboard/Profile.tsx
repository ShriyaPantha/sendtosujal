import { useRef, useState } from "react";
import { Camera, Pencil, Save, X, Mail, Phone, Building2, BadgeCheck, MapPin } from "lucide-react";

interface ProfileData {
  name: string;
  role: string;
  department: string;
  employeeId: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

const initialProfile: ProfileData = {
  name: "Sara Kim",
  role: "Front Desk Receptionist",
  department: "Front Office",
  employeeId: "EMP-1042",
  email: "sara.kim@school.edu",
  phone: "+1 555-201-0099",
  location: "Main Building, Ground Floor",
  bio: "First point of contact for visitors, deliveries, and staff. On desk Monday–Friday, 8:00 AM – 4:00 PM.",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const Rprofile = () => {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [draft, setDraft] = useState<ProfileData>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
  };

  const startEditing = () => {
    setDraft(profile);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setEditing(false);
  };

  const saveProfile = () => {
    setProfile(draft);
    setEditing(false);
  };

  const field = (label: string, key: keyof ProfileData, icon: React.ReactNode, type: "input" | "textarea" = "input") => (
    <div>
      <label className="text-xs font-semibold text-slate-500">{label}</label>
      {editing ? (
        type === "textarea" ? (
          <textarea
            value={draft[key]}
            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
          />
        ) : (
          <input
            value={draft[key]}
            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        )
      ) : (
        <div className="mt-1 flex items-start gap-2 text-sm text-slate-700">
          <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
          <span>{profile[key]}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your photo and contact details</p>
        </div>
        {!editing ? (
          <button
            onClick={startEditing}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={cancelEditing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={saveProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Photo + identity card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center ring-4 ring-slate-100">
              {photoUrl ? (
                <img src={photoUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-bold">{initials(profile.name)}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-slate-800 border-4 border-white flex items-center justify-center text-white hover:bg-slate-700 transition"
              title="Change photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-800">{profile.name}</h2>
          <p className="text-sm text-slate-500">{profile.role}</p>

          <span className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            On Duty
          </span>

          <div className="w-full border-t border-slate-100 mt-5 pt-4 space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <BadgeCheck className="w-3.5 h-3.5 text-slate-400" />
              {profile.employeeId}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {profile.department}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {field("Full Name", "name", null)}
            {field("Role", "role", null)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {field("Email", "email", <Mail className="w-3.5 h-3.5" />)}
            {field("Phone", "phone", <Phone className="w-3.5 h-3.5" />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {field("Department", "department", <Building2 className="w-3.5 h-3.5" />)}
            {field("Desk Location", "location", <MapPin className="w-3.5 h-3.5" />)}
          </div>
          {field("About", "bio", null, "textarea")}
        </div>
      </div>
    </div>
  );
};

export default Rprofile;