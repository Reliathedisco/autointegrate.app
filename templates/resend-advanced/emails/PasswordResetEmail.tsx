import * as React from "react";
import { Layout } from "./layout";

export const PasswordResetEmail = ({ resetLink }: { resetLink: string }) => (
  <Layout>
    <p>You requested a password reset.</p>
    <p>
      <a href={resetLink} style={{ color: "#0070f3" }}>
        Click here to reset your password
      </a>
    </p>
    <p style={{ fontSize: 12, color: "#666" }}>
      If you didn't request this, you can safely ignore this email.
    </p>
  </Layout>
);
