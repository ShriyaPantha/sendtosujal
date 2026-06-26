import { Edit, Download } from "lucide-react";

const ProfileHero = () => {
  const downloadIDCard = () => {
    alert("Download Student ID Card");
  };

  return (
    <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-3xl overflow-hidden">
      <div className="p-8 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src="https://i.pravatar.cc/300"
            alt=""
            className="w-32 h-32 rounded-3xl border-4 border-white"
          />

          <div className="text-white">
            <h1 className="text-4xl font-bold">
              Sujal Sundas
            </h1>

            <p className="text-blue-100">
              BSc.CSIT • 3rd Semester
            </p>

            <div className="mt-3">
              <span className="bg-green-500 px-3 py-1 rounded-full text-sm">
                Active Student
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="bg-white text-blue-600 px-5 py-3 rounded-xl flex items-center gap-2">
            <Edit size={18} />
            Edit Profile
          </button>

          <button
            onClick={downloadIDCard}
            className="bg-green-500 text-white px-5 py-3 rounded-xl flex items-center gap-2"
          >
            <Download size={18} />
            ID Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHero;