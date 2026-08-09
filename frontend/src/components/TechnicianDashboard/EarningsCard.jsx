import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./EarningsCard.css";

const EarningsCard = () => {

  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    todayEarnings: 0,
    completedJobs: 0,
    bookings: [],
  });

  useEffect(() => {

    fetchEarnings();

  }, []);

  const fetchEarnings = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await api.get(
        "/bookings/technician/earnings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEarnings(response.data);

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="earnings-card">

      <h2>Earnings Overview</h2>

      <div className="earnings-grid">

        <div className="earning-box">

          <span>Today's Earnings</span>

          <h3>₹{earnings.todayEarnings}</h3>

        </div>

        <div className="earning-box">

          <span>Total Earnings</span>

          <h3>₹{earnings.totalEarnings}</h3>

        </div>

        <div className="earning-box">

          <span>Completed Jobs</span>

          <h3>{earnings.completedJobs}</h3>

        </div>

        <div className="earning-box">

          <span>Average Per Job</span>

          <h3>

            ₹{

              earnings.completedJobs > 0

                ? Math.round(
                    earnings.totalEarnings /
                    earnings.completedJobs
                  )

                : 0

            }

          </h3>

        </div>

      </div>

      <h3 className="recent-title">
        Recent Payments
      </h3>

      {

        earnings.bookings.length === 0 ? (

          <p>No completed jobs yet.</p>

        ) : (

          earnings.bookings
            .slice(0, 5)
            .map((booking) => (

              <div
                key={booking._id}
                className="payment-row"
              >

                <span>

                  {booking.service.name}

                </span>

                <strong>

                  ₹{booking.price}

                </strong>

              </div>

            ))

        )

      }

    </div>

  );

};

export default EarningsCard;