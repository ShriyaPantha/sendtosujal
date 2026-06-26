import React from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";

const Contacts: React.FC = () => {
  const info = [
    { icon: FaPhone, label: "Phone", value: "+977 9800000000" },
    { icon: FaEnvelope, label: "Email", value: "support@edusphere.com" },
    { icon: FaMapMarkerAlt, label: "Address", value: "Kathmandu, Nepal" },
  ];

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-gray-200 placeholder-gray-600 focus:border-indigo-500/50 focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-[#050814] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-cyan-400 mb-2">
            Get in Touch
          </h1>
          <p className="text-gray-500 text-xs max-w-xs mx-auto leading-relaxed">
            Have questions or want to collaborate? We'd love to hear from you.
          </p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-4 items-stretch">

          {/* LEFT */}
          <div className="flex flex-col gap-3 bg-white/3 border border-white/[0.07] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white">Contact Details</h2>
            <div className="flex flex-col gap-2.5 flex-1">
              {info.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 bg-white/3 border border-white/6 hover:border-indigo-500/30 rounded-lg px-3.5 py-3 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors shrink-0">
                    <item.icon className="text-indigo-400 text-xs" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="text-xs text-gray-300 font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-700 mt-1">
              We typically respond within 24 hours on business days.
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col bg-white/3 border border-white/[0.07] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Send a Message</h2>
            <form className="flex flex-col gap-2.5 flex-1">
              <input type="text" placeholder="Your name" className={inputClass} />
              <input type="email" placeholder="Your email" className={inputClass} />
              <textarea
                rows={4}
                placeholder="How can we help?"
                className={`${inputClass} resize-none`}
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] py-2.5 rounded-lg text-xs font-semibold text-white transition-all duration-150 mt-1"
              >
                <FaPaperPlane className="text-xs" /> Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contacts;