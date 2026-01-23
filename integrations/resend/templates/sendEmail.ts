import { resend } from "./init";

export const sendEmail = async ({
  to,
  subject,
  html,
  from = process.env.EMAIL_FROM || "onboarding@resend.dev",
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) => {
  return resend.emails.send({
    from,
    to,
    subject,
    html,
  });
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  return sendEmail({
    to,
    subject: "Welcome to AutoIntegrate!",
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Thanks for joining AutoIntegrate.</p>
    `,
  });
};
