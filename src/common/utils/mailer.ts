import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: `"GoTrip" <${config.smtp.user}>`,
    to,
    subject: 'Your GoTrip OTP',
    text: `Your OTP is: ${otp}\n\nValid for 5 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#1d4ed8;margin-bottom:8px">GoTrip</h2>
        <p style="color:#374151">Use the OTP below to sign in. It expires in <strong>5 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;text-align:center;padding:16px 0">
          ${otp}
        </div>
        <p style="color:#6b7280;font-size:12px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
