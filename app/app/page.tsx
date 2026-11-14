import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WebMobileSection from "@/components/WebMobileSection";
import ProjectsShowcase from "@/components/ProjectsShowcase";
import EmergingTech from "@/components/EmergingTech";
import Fellowship from "@/components/Fellowship";
import FarmsSection from "@/components/FarmsSection";
import CivicTechSection from "@/components/CivicTechSection";
import Features from "@/components/Features";
import Team from "@/components/Team";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-ink font-sans text-[#F7F9FC]">
      <Navbar />
      <Hero />
      <WebMobileSection />
      <ProjectsShowcase />
      <EmergingTech />
      <Fellowship />
      <FarmsSection />
      <CivicTechSection />
      <Features />
      <Team />
      <Contact />
      <Footer />
    </main>
  );
}
