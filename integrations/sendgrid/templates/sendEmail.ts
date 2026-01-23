// SendGrid Email Example

import sgMail from "./init";

export async function sendGridEmail() {
  const msg = {
    to: "test@example.com",
    from: "AutoIntegrate <noreply@autointegrate.dev>",
    subject: "Hello from SendGrid",
    text: "SendGrid Integration Working",
  };

  return await sgMail.send(msg);
}
