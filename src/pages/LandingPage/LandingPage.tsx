import { useState } from "react";
import Navbar from "../../components/LandingPage/Navbar";
import HeroSection from "../../components/LandingPage/HeroSection";
import StatsSection from "../../components/LandingPage/StatsSection";
import LoginModal from "../../components/LandingPage/LoginModal";
import FeaturesSection from "../../components/LandingPage/FutureSection";
import Contacts from "../../components/LandingPage/Contacts";
import Footer from "../../components/LandingPage/Footer";
import PlanSubscriptionPage from "../../components/LandingPage/Plansubscriptionpage";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">

      {!loggedIn ? (
        <>
          <Navbar onLoginClick={() => setShowLogin(true)} />

          <section id="home">
            <HeroSection onLoginClick={() => setShowLogin(true)} />
          </section>

          <section id="features">
            <FeaturesSection />
            <PlanSubscriptionPage/>
          </section>

          {/* PORTALS (if you want) */}
          <section id="portals">
            <StatsSection />
          </section>

          {/* CONTACT + FOOTER */}
          <section id="contact">
            <Contacts />
            <Footer />
          </section>

          <LoginModal
            isOpen={showLogin}
            onClose={() => setShowLogin(false)}
            onLoginSuccess={(_role, path) => {
              setShowLogin(false);
              setLoggedIn(true);
              window.location.href = path;
            }}
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <h1 className="text-2xl font-bold">
            Welcome to Dashboard 🚀
          </h1>
        </div>
      )}
    </div>
  );
}