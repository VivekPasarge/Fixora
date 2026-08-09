import {
  FiZap,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiTool,
} from "react-icons/fi";

const serviceDetailsData = {
  id: 1,

  title: "Electrician",

  category: "Electrical Services",

  icon: FiZap,

  rating: 4.9,

  reviews: 1234,

  startingPrice: "₹299",

  arrivalTime: "30 Minutes",

  duration: "1–2 Hours",

  description:
    "Our certified electricians provide fast, reliable and affordable electrical services for homes and offices. From small repairs to complete installations, every job is handled safely and professionally.",

  heroImage: "/assets/services/electrician.png",

  includedServices: [
    "Fan Installation",
    "Light Installation",
    "Switch Board Repair",
    "MCB Replacement",
    "Socket Installation",
    "Door Bell Installation",
    "Internal Wiring",
    "Power Failure Diagnosis",
  ],

  whyChoose: [
    {
      icon: FiShield,
      title: "Verified Professional",
      description: "Background verified and highly trained technician.",
    },
    {
      icon: FiTool,
      title: "Quality Work",
      description: "Professional tools and genuine spare parts.",
    },
    {
      icon: FiClock,
      title: "On-Time Arrival",
      description: "Average arrival within 30 minutes.",
    },
    {
      icon: FiCheckCircle,
      title: "30-Day Warranty",
      description: "Free revisit for eligible service issues.",
    },
  ],

  technician: {
    name: "Rahul Sharma",
    experience: "8+ Years",
    jobsCompleted: "850+",
    rating: 4.9,
  },
};

export default serviceDetailsData;