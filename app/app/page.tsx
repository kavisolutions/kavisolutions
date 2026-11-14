import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Explore from "@/components/Explore";
import EmergingTech from "@/components/EmergingTech";
import Features from "@/components/Features";
import Fellowship from "@/components/Fellowship";
import Team from "@/components/Team";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-ink font-sans text-[#F7F9FC]">
      <Navbar />
      <Hero />
      <Explore />
      <EmergingTech />
      <Features />
      <Fellowship />
      <Team />
      <Contact />
      <Footer />
    </main>
  );
}
