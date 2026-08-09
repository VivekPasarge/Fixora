// import { motion } from "framer-motion";
// import { FiCheckCircle, FiClock, FiStar } from "react-icons/fi";
// import "./FloatingCards.css";

// const cards = [
//   {
//     icon: <FiStar />,
//     title: "4.9 Rating",
//     subtitle: "20K+ Reviews",
//     className: "rating-card float-1",
//     iconClass: "icon-primary",
//   },
//   {
//     icon: <FiCheckCircle />,
//     title: "Verified",
//     subtitle: "Background Checked",
//     className: "verified-card float-2",
//     iconClass: "icon-success",
//   },
//   {
//     icon: <FiClock />,
//     title: "15–30 Min",
//     subtitle: "Average Arrival",
//     className: "arrival-card float-3",
//     iconClass: "icon-warning",
//   },
// ];

// const FloatingCards = () => {
//   return (
//     <>
//       {cards.map((card, index) => (
//         <motion.div
//           key={card.title}
//           className={`floating-card ${card.className}`}
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{
//             delay: index * 0.2,
//             duration: 0.5,
//           }}
//           whileHover={{
//             y: -6,
//             scale: 1.03,
//           }}
//         >
//           <div className={`floating-icon ${card.iconClass}`}>
//             {card.icon}
//           </div>

//           <div className="floating-content">
//             <h4>{card.title}</h4>
//             <p>{card.subtitle}</p>
//           </div>
//         </motion.div>
//       ))}
//     </>
//   );
// };

// export default FloatingCards;