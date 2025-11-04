import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Auth System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(` Email sent to ${to}`);
  } catch (err) {
    console.error("EMAIL ERROR:", err.message);
    throw new Error("Failed to send email");
  }
};

export default sendEmail;
