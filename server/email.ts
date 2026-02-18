import Mailgun from "mailgun.js";
import FormData from "form-data";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});

const DOMAIN = process.env.MAILGUN_DOMAIN || "";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendSubmissionEmail(submission: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string | null;
  plan: string;
  wifiSsid: string;
  wifiPassword: string;
  installationDate: string;
  notes?: string | null;
  paymentRef?: string | null;
}) {
  if (!DOMAIN || !process.env.MAILGUN_API_KEY) {
    console.warn("Mailgun not configured, skipping email");
    return;
  }

  const installDate = new Date(submission.installationDate).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const s = {
    firstName: escapeHtml(submission.firstName),
    lastName: escapeHtml(submission.lastName),
    email: escapeHtml(submission.email),
    phone: escapeHtml(submission.phone),
    address: escapeHtml(submission.address),
    city: escapeHtml(submission.city),
    state: escapeHtml(submission.state),
    zipCode: submission.zipCode ? escapeHtml(submission.zipCode) : null,
    plan: escapeHtml(submission.plan),
    wifiSsid: escapeHtml(submission.wifiSsid),
    wifiPassword: escapeHtml(submission.wifiPassword),
    paymentRef: submission.paymentRef ? escapeHtml(submission.paymentRef) : null,
    notes: submission.notes ? escapeHtml(submission.notes) : null,
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f97316; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">New MangoNet Signup</h1>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Customer Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: bold;">${s.firstName} ${s.lastName}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;">${s.email}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0;">${s.phone}</td></tr>
        </table>

        <h2 style="color: #1f2937; font-size: 18px;">Service Location</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Address</td><td style="padding: 8px 0;">${s.address}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">City</td><td style="padding: 8px 0;">${s.city}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">State</td><td style="padding: 8px 0;">${s.state}</td></tr>
          ${s.zipCode ? `<tr><td style="padding: 8px 0; color: #6b7280;">Zip Code</td><td style="padding: 8px 0;">${s.zipCode}</td></tr>` : ''}
        </table>

        <h2 style="color: #1f2937; font-size: 18px;">Plan & WiFi</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Plan</td><td style="padding: 8px 0; font-weight: bold;">${s.plan}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">WiFi SSID</td><td style="padding: 8px 0; font-family: monospace;">${s.wifiSsid}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">WiFi Password</td><td style="padding: 8px 0; font-family: monospace;">${s.wifiPassword}</td></tr>
        </table>

        <h2 style="color: #1f2937; font-size: 18px;">Installation</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Preferred Date</td><td style="padding: 8px 0; font-weight: bold;">${installDate}</td></tr>
          ${s.paymentRef ? `<tr><td style="padding: 8px 0; color: #6b7280;">Payment Ref</td><td style="padding: 8px 0; font-family: monospace;">${s.paymentRef}</td></tr>` : ''}
          ${s.notes ? `<tr><td style="padding: 8px 0; color: #6b7280;">Notes</td><td style="padding: 8px 0; font-style: italic;">${s.notes}</td></tr>` : ''}
        </table>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; text-align: center;">
          <p style="margin: 0; color: #166534; font-weight: bold;">Payment of ₦100,000 confirmed</p>
        </div>
      </div>
      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">MangoNet Online — Automated Notification</p>
    </div>
  `;

  try {
    await mg.messages.create(DOMAIN, {
      from: `MangoNet Signup <noreply@${DOMAIN}>`,
      to: ["support@mangonetonline.com"],
      subject: `New Signup: ${submission.firstName} ${submission.lastName} — ${submission.plan}`,
      html,
    });
    console.log("Signup notification email sent successfully");
  } catch (error) {
    console.error("Failed to send signup notification email:", error);
  }
}
