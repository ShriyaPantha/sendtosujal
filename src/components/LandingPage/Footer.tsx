import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050814] text-gray-400 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">

        {/* BRAND */}
        <div>
          <h2 className="text-white text-xl font-bold tracking-tight">
            EduSphere
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            A modern SaaS platform for students, teachers, parents, and admins.
            Manage learning smarter, faster, and together.
          </p>
        </div>

        {/* PRODUCT */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-widest">
            Product
          </h3>
          <ul className="space-y-3 text-sm">
            {["Home", "Features", "About", "Contact"].map((item) => (
              <li
                key={item}
                className="hover:text-white transition cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* SUPPORT */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-widest">
            Support
          </h3>
          <ul className="space-y-3 text-sm">
            {["Help Center", "Privacy Policy", "Terms & Conditions"].map(
              (item) => (
                <li
                  key={item}
                  className="hover:text-white transition cursor-pointer"
                >
                  {item}
                </li>
              )
            )}
          </ul>
        </div>

        {/* SOCIAL */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-widest">
            Follow Us
          </h3>

          <div className="flex gap-3">
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-600 hover:text-white transition"
            >
              <FaFacebookF />
            </a>

            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-sky-500 hover:text-white transition"
            >
              <FaTwitter />
            </a>

            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-pink-500 hover:text-white transition"
            >
              <FaInstagram />
            </a>

            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-blue-600 hover:text-white transition"
            >
              <FaLinkedinIn />
            </a>
          </div>

          {/* CONTACT SMALL TEXT */}
          <p className="text-xs text-gray-500 mt-4">
            support@edusphere.com
          </p>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} EduSphere. All rights reserved.</p>

          <div className="flex gap-5">
            <span className="hover:text-white cursor-pointer">
              Privacy
            </span>
            <span className="hover:text-white cursor-pointer">
              Terms
            </span>
            <span className="hover:text-white cursor-pointer">
              Cookies
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;