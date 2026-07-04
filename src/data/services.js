import {
  FaBolt,
  FaBroom,
  FaPaintRoller,
  FaSnowflake,
  FaHammer,
} from "react-icons/fa";

import { MdPlumbing } from "react-icons/md";

const services = [
  {
    id: 1,
    title: "Plumbing",
    icon: MdPlumbing,
    rating: 4.7,
    description: "Fix leaks, installations & more",
    color: "text-sky-500",
  },
  {
    id: 2,
    title: "Electrical",
    icon: FaBolt,
    rating: 4.6,
    description: "Wiring, repair & electrical work",
    color: "text-yellow-500",
  },
  {
    id: 3,
    title: "Carpentry",
    icon: FaHammer,
    rating: 4.6,
    description: "Furniture repair & wood work",
    color: "text-orange-500",
  },
  {
    id: 4,
    title: "Appliance Repair",
    icon: FaSnowflake,
    rating: 4.7,
    description: "AC, Fridge & Washing Machine",
    color: "text-blue-500",
  },
  {
    id: 5,
    title: "Painting",
    icon: FaPaintRoller,
    rating: 4.5,
    description: "Wall painting & texture",
    color: "text-pink-500",
  },
  {
    id: 6,
    title: "Cleaning",
    icon: FaBroom,
    rating: 4.6,
    description: "Home, kitchen & sofa cleaning",
    color: "text-green-500",
  },
];

export default services;