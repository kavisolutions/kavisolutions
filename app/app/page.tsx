import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Features from "@/components/Features";
import Fellowship from "@/components/Fellowship";
import Team from "@/components/Team";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-ink font-sans text-white">
      <Navbar />
      <Hero />
      <Services />
      <Features />
      <Fellowship />
      <Team />
      <Contact />
      <Footer />
    </main>
  );
}
