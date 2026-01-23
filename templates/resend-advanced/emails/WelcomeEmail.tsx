import * as React from "react";
import { Layout } from "./layout";

export const WelcomeEmail = ({ user }: { user: string }) => (
  <Layout>
    <p>Hello {user},</p>
    <p>Your project is now connected to AutoIntegrate 🎉</p>
  </Layout>
);
