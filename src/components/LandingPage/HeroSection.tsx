import React, { useEffect, useRef } from "react";
import { FaRocket, FaGraduationCap, FaBook, FaUsers, FaSchool, FaBolt } from "react-icons/fa";
import { MdArrowDownward } from "react-icons/md";

interface HeroSectionProps {
  onLoginClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onLoginClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const portals = [
    { icon: <FaGraduationCap />, label: "Student Portal" },
    { icon: <FaBook />, label: "Teacher Portal" },
    { icon: <FaUsers />, label: "Parent Portal" },
    { icon: <FaSchool />, label: "Admin Portal" },
    { icon: <FaBolt />, label: "Super Admin" },
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-8 pt-20 pb-8 text-center"
      style={{ background: "linear-gradient(135deg, #050814 0%, #0a0f28 40%, #0d1340 100%)" }}
    >
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Glow */}
      <div
        className="absolute w-150 h-150 rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-7 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse" />
          Next-Gen Education Platform
        </div>

        {/* Title */}
        <h1 className="text-[clamp(2.4rem,6vw,4.2rem)] font-black leading-[1.1] tracking-tight text-white mb-5">
          One Platform.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #6366f1, #a78bfa, #e879f9)" }}
          >
            Every Stakeholder.
          </span>
          <br />
          Infinite Possibilities.
        </h1>

        {/* Subtitle */}
        <p className="text-[clamp(1rem,2vw,1.15rem)] text-slate-400 max-w-xl mx-auto leading-relaxed mb-10">
          EduSphere unifies students, teachers, parents, and administrators on a single
          intelligent platform — enabling seamless learning, real-time communication,
          and data-driven decisions.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={onLoginClick}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 0 30px rgba(99,102,241,0.5)",
            }}
          >
            <FaRocket /> Access Your Portal
          </button>
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-indigo-300 font-semibold text-sm border border-indigo-500/40 bg-transparent hover:bg-indigo-500/10 hover:border-indigo-500/70 hover:text-white transition-all duration-200"
          >
            Explore Features <MdArrowDownward />
          </button>
        </div>

        {/* Portal Pills */}
        <div className="flex flex-wrap justify-center gap-2.5">
          {portals.map((p) => (
            <div
              key={p.label}
              className="flex items-center gap-1.5 bg-white/4 border border-white/10 px-3.5 py-1.5 rounded-full text-slate-400 text-xs font-medium"
            >
              <span className="text-sm">{p.icon}</span>
              <span>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-600 text-[10px] font-medium tracking-widest animate-bounce">
        <span>SCROLL</span>
        <div className="w-4 h-4 border-r-2 border-b-2 border-slate-600 rotate-45" />
      </div>
    </section>
  );
};

export default HeroSection;