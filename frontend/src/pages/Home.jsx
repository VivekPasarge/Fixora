import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import TrustBar from "../components/TrustBar/TrustBar";
import Services from "../components/Services/Services";
import LiveTracking from "../components/LiveTracking/LiveTracking";
import Footer from "../components/Footer/Footer";
import Contact from "../components/Contact/Contact";
import About from "../components/About/About";
import api from "../api/axios";


const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustBar />
      {/* <Services /> */}
      {/* <LiveTracking />
      
      <About/>
      <Contact/> */}

      <Footer/>
    </>
  );
};
console.log(api.defaults.baseURL);

export default Home;