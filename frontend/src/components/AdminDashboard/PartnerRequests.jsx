import { useEffect, useState } from "react";
import api from "../../api/axios";

const PartnerRequests = () => {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/partners", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPartners(response.data.partners);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>

      <h2>Partner Applications</h2>

      {partners.length === 0 ? (
        <p>No Partner Applications</p>
      ) : (
        partners.map((partner) => (
          <div key={partner._id}>

            <h3>{partner.fullName}</h3>

            <p>{partner.profession}</p>

            <p>{partner.workingCity}</p>

            <p>Status: {partner.status}</p>

            <button>Approve</button>

            <button>Reject</button>

          </div>
        ))
      )}

    </div>
  );
};

export default PartnerRequests;