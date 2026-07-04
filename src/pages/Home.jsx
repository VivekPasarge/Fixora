import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import HomeServices from "../components/home/HomeServices";
import Footer from "../components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#07111F] overflow-x-hidden">
      <Navbar />

      <main>
        <Hero />
        <HomeServices />
      </main>

      <Footer />
    </div>
  );
}