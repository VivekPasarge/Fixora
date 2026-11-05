
const nodemailer = require("nodemailer");

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT || 587),

  secure: false,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Prevent requests from waiting indefinitely.
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,

  tls: {
    minVersion: "TLSv1.2",
  },
});

// Check SMTP connection when the backend starts.
mailer.verify()
  .then(() => {
    console.log("SMTP connection established successfully.");
  })
  .catch((error) => {
    console.error("SMTP CONNECTION ERROR:", error.message);
  });

module.exports = mailer;
