import React, { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  // { label: "Stats", href: "#stats" },
  { label: "Portals", href: "#portals" },
  { label: "Contact", href: "#contact" },
];

// ✅ CLEAN LOGO COMPONENT (SVG)
const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Graduation cap style logo */}
        <path
          d="M12 3L1 9L12 15L23 9L12 3Z"
          stroke="white"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M5 12V16C5 18.761 8.134 21 12 21C15.866 21 19 18.761 19 16V12"
          stroke="white"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>

    <div className="leading-tight">
      <h1 className="text-white font-bold text-lg">EduSphere</h1>
      <p className="text-xs text-indigo-300 tracking-widest uppercase">
        Smart School
      </p>
    </div>
  </div>
);

interface NavbarProps {
  onLoginClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0b1025]/90 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-17.5 flex items-center justify-between">

        {/* LOGO */}
        <Logo />

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-gray-300 hover:text-white text-sm transition"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* LOGIN */}
        <button
          onClick={onLoginClick}
          className="hidden md:block bg-linear-to-r from-indigo-500 to-violet-600 text-white px-5 py-2 rounded-lg font-medium hover:scale-105 transition"
        >
          Login
        </button>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1"
        >
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden absolute top-17.5 left-0 w-full bg-[#0b1025]/95 backdrop-blur-xl border-t border-white/10 ${
          menuOpen ? "block" : "hidden"
        }`}
      >
        <div className="flex flex-col px-6 py-4 gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-white text-sm"
            >
              {link.label}
            </a>
          ))}

          <button
            onClick={() => {
              setMenuOpen(false);
              onLoginClick();
            }}
            className="bg-linear-to-r from-indigo-500 to-violet-600 text-white py-2 rounded-lg font-medium"
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;