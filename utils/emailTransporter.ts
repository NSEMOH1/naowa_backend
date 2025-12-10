import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Your OTP Code for NAOWA",
    text: `Your OTP code is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent to:", email);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send OTP");
  }
};

export const sendWelcomeEmail = async (
  email: string,
  memberName: string,
) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Welcome to NAOWA Multipurpose Cooperative Society",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to NAOWA Multipurpose Cooperative Society!</h2>
        
        <p>Dear ${memberName},</p>
        
        <p>We are delighted to welcome you as a new member of the NAOWA Multipurpose Cooperative Society. Your registration has been successfully completed.</p>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">What's Next?</h3>
          <ul style="line-height: 1.8;">
            <li>Complete your profile information</li>
            <li>Explore available savings and loan products</li>
            <li>Always check your mail for any information</li>
            <li>Contact us for any questions or assistance</li>
          </ul>
        </div>
        
        <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
        
        <p>Thank you for joining us. We look forward to serving you!</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>NAOWA Multipurpose Cooperative Society</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #7f8c8d;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent to:", email);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};
