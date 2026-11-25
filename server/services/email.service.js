import nodemailer from 'nodemailer';
import Notification from '../models/Notification.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function notifyUser({ userId, email, title, message, type = 'info', relatedEntity }) {
  let emailSent = false;

  const mailer = getTransporter();
  if (mailer && email) {
    try {
      await mailer.sendMail({
        from: process.env.EMAIL_FROM || 'AdmissionPortal <noreply@admissionportal.edu>',
        to: email,
        subject: `[AdmissionPortal] ${title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
            <h2 style="color: #1e3a8a; margin-top: 0;">${title}</h2>
            <p style="color: #334155; line-height: 1.6;">${message}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">AdmissionPortal — Automated Admission Notification</p>
          </div>
        `,
      });
      emailSent = true;
    } catch (err) {
      console.warn('Email delivery failed (in-app notification still saved):', err.message);
    }
  }

  return Notification.create({
    userId,
    title,
    message,
    type,
    emailSent,
    relatedEntity,
  });
}

