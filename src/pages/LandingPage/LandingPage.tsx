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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLoginClick={() => setShowLogin(true)} />

      <section id="home">
        <HeroSection onLoginClick={() => setShowLogin(true)} />
      </section>

      <section id="features">
        <FeaturesSection />
        <PlanSubscriptionPage />
      </section>

      <section id="portals">
        <StatsSection />
      </section>

      <section id="contact">
        <Contacts />
        <Footer />
      </section>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => {
          // navigation is handled inside LoginModal via useNavigate
          setShowLogin(false);
        }}
      />
    </div>
  );
}