import {
  FiZap,
  FiDroplet,
  FiHome,
  FiWind,
  FiTool,
  FiMonitor,
} from "react-icons/fi";

const services = [
  {
    id: 1,
    title: "Electrician",
    description: "Wiring, switches, lighting, fan installation & repairs.",
    icon: FiZap,
    rating: "4.9",
    price: "₹299",
    arrival: "30 mins",
  },
  {
    id: 2,
    title: "Plumber",
    description: "Leak repairs, taps, pipelines and bathroom fittings.",
    icon: FiDroplet,
    rating: "4.8",
    price: "₹249",
    arrival: "35 mins",
  },
  {
    id: 3,
    title: "Home Cleaning",
    description: "Deep cleaning for homes, kitchens and bathrooms.",
    icon: FiHome,
    rating: "4.9",
    price: "₹499",
    arrival: "1 Hour",
  },
  {
    id: 4,
    title: "AC Repair",
    description: "AC servicing, gas refill and cooling issue repairs.",
    icon: FiWind,
    rating: "4.8",
    price: "₹599",
    arrival: "45 mins",
  },
  {
    id: 5,
    title: "Carpenter",
    description: "Furniture repair, installation and wood work.",
    icon: FiTool,
    rating: "4.7",
    price: "₹399",
    arrival: "40 mins",
  },
  {
    id: 6,
    title: "Appliance Repair",
    description: "TV, Washing Machine, Refrigerator and Microwave.",
    icon: FiMonitor,
    rating: "4.9",
    price: "₹349",
    arrival: "50 mins",
  },
];

export default services;