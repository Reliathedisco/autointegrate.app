import { resend } from "./client";
import { render } from "@react-email/render";
import { WelcomeEmail } from "./emails/WelcomeEmail";
import { PasswordResetEmail } from "./emails/PasswordResetEmail";

export const sendWelcome = async (to: string, user: string) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Welcome to AutoIntegrate",
    html: render(<WelcomeEmail user={user} />),
  });
};

export const sendPasswordReset = async (to: string, resetLink: string) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Reset Your Password",
    html: render(<PasswordResetEmail resetLink={resetLink} />),
  });
};
