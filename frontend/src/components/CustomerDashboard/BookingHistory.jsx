import "./BookingHistory.css";

const bookings = [
  {
    id: "#FX1001",
    service: "AC Repair",
    date: "28 Jul 2026",
    amount: "₹1,250",
    status: "Completed",
  },
  {
    id: "#FX1002",
    service: "House Cleaning",
    date: "24 Jul 2026",
    amount: "₹2,100",
    status: "Pending",
  },
  {
    id: "#FX1003",
    service: "Plumbing",
    date: "20 Jul 2026",
    amount: "₹850",
    status: "Cancelled",
  },
  {
    id: "#FX1004",
    service: "Electrician",
    date: "15 Jul 2026",
    amount: "₹1,450",
    status: "Completed",
  },
];

const BookingHistory = () => {
  return (
    <section className="booking-history">

      <div className="history-header">
        <div>
          <h2>Booking History</h2>
          <p>Your recent Fixora service bookings.</p>
        </div>

        <button className="view-all-btn">
          View All
        </button>
      </div>

      <div className="history-table">

        <div className="table-head">

          <span>Booking ID</span>
          <span>Service</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Action</span>

        </div>

        {bookings.map((booking) => (

          <div className="table-row" key={booking.id}>

            <span>{booking.id}</span>

            <span>{booking.service}</span>

            <span>{booking.date}</span>

            <span>{booking.amount}</span>

            <span className={`status ${booking.status.toLowerCase()}`}>
              {booking.status}
            </span>

            <button className="details-btn">
              View Details
            </button>

          </div>

        ))}

      </div>

    </section>
  );
};

export default BookingHistory;