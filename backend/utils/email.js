const nodemailer = require('nodemailer');

const getTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST  || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

const send = async (to, subject, html) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email skipped – SMTP not configured] To: ${to} | ${subject}`);
    return;
  }
  await transporter.sendMail({ from: `"DriveEase" <${process.env.SMTP_USER}>`, to, subject, html });
};

// ─── Templates ────────────────────────────────────────────────────────────────

const sendBookingConfirmation = ({ to, name, vehicleName, startDate, endDate, totalPrice }) =>
  send(
    to,
    '✅ Booking Confirmed – DriveEase',
    `<h2>Hi ${name},</h2>
     <p>Your booking for <strong>${vehicleName}</strong> is <strong>confirmed</strong>.</p>
     <p>📅 <strong>From:</strong> ${new Date(startDate).toDateString()}</p>
     <p>📅 <strong>To:</strong> ${new Date(endDate).toDateString()}</p>
     <p>💰 <strong>Total paid:</strong> $${totalPrice}</p>
     <p>Enjoy your ride! – Team DriveEase</p>`
  );

const sendBookingCancellation = ({ to, name, vehicleName }) =>
  send(
    to,
    '❌ Booking Cancelled – DriveEase',
    `<h2>Hi ${name},</h2>
     <p>Your booking for <strong>${vehicleName}</strong> has been <strong>cancelled</strong>.</p>
     <p>If this was a mistake, please create a new booking on DriveEase.</p>
     <p>– Team DriveEase</p>`
  );

const sendBookingReminder = ({ to, name, vehicleName, startDate }) =>
  send(
    to,
    '⏰ Reminder: Your rental starts tomorrow – DriveEase',
    `<h2>Hi ${name},</h2>
     <p>Just a reminder that your rental of <strong>${vehicleName}</strong> starts tomorrow,
        <strong>${new Date(startDate).toDateString()}</strong>.</p>
     <p>Please be ready at the pickup location. – Team DriveEase</p>`
  );

const sendPasswordReset = ({ to, name, resetUrl }) =>
  send(
    to,
    '🔑 Password Reset – DriveEase',
    `<h2>Hi ${name},</h2>
     <p>You requested a password reset. Click the link below (valid for 1 hour):</p>
     <p><a href="${resetUrl}" style="background:#4f46e5;color:white;padding:10px 18px;
        border-radius:6px;text-decoration:none;">Reset Password</a></p>
     <p>If you didn't request this, ignore this email.</p>`
  );

module.exports = {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingReminder,
  sendPasswordReset,
};
