import { jsPDF } from "jspdf";

const generateInvoice = (booking) => {

  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("FIXORA", 105, 20, { align: "center" });

  doc.setFontSize(16);
  doc.text("Payment Invoice", 105, 30, {
    align: "center",
  });

  doc.line(20, 38, 190, 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  let y = 50;

  doc.text(
    `Invoice No : INV-${booking.bookingId}`,
    20,
    y
  );

  y += 10;

  doc.text(
    `Booking ID : ${booking.bookingId}`,
    20,
    y
  );

  y += 10;

  doc.text(
    `Customer : ${booking.customer.name}`,
    20,
    y
  );

  y += 10;

  doc.text(
    `Technician : ${booking.technician.name}`,
    20,
    y
  );

  y += 10;

  doc.text(
    `Service : ${booking.service.name}`,
    20,
    y
  );

  y += 10;

  doc.text(
    `Booking Date : ${new Date(
      booking.bookingDate
    ).toLocaleDateString()}`,
    20,
    y
  );

  y += 10;

  doc.text(
    `Payment Method : ${booking.paymentMethod}`,
    20,
    y
  );

  y += 10;

  doc.text(
    `Payment Status : ${booking.paymentStatus}`,
    20,
    y
  );

  y += 10;

  doc.setFont("helvetica", "bold");

  doc.text(
    `Amount Paid : ₹${booking.price}`,
    20,
    y
  );

  y += 20;

  doc.setFont("helvetica", "normal");

  doc.text(
    "Thank you for choosing Fixora!",
    20,
    y
  );

  doc.save(
    `Invoice-${booking.bookingId}.pdf`
  );

};

export default generateInvoice;