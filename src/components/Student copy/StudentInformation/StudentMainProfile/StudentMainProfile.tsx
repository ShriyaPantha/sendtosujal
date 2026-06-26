import InfoCard from "../InfoCard";
import ProfileHero from "../ProfileHero";
import StudentDocuments from "../StudentDocument";
import StudentStats from "../StudentStats";


const StudentProfile = () => {
  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      <ProfileHero />

      <StudentStats />

      <div className="grid lg:grid-cols-2 gap-6">
        <InfoCard
          title="Personal Information"
          items={[
            ["Full Name", "Sujal Sundas"],
            ["Date of Birth", "20 Oct 2003"],
            ["Gender", "Male"],
            ["Blood Group", "O+"],
          ]}
        />

        <InfoCard
          title="Academic Information"
          items={[
            ["Student ID", "CSIT20230125"],
            ["Program", "BSc.CSIT"],
            ["Semester", "3rd"],
            ["Department", "Computer Science"],
          ]}
        />

        <InfoCard
          title="Contact Information"
          items={[
            ["Email", "student@email.com"],
            ["Phone", "+977 98XXXXXXXX"],
            ["Address", "Kathmandu, Nepal"],
          ]}
        />

        <InfoCard
          title="Guardian Information"
          items={[
            ["Father", "Ram Sundas"],
            ["Mother", "Sita Sundas"],
            ["Guardian Phone", "+977 98XXXXXXXX"],
          ]}
        />
      </div>

      <StudentDocuments />
    </div>
  );
};

export default StudentProfile;