import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./styles/index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY. Set it in .env.local or .env.");
}

const clerkAppearance = {
  variables: {
    colorPrimary: "#2563eb",
    borderRadius: "0.5rem",
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignInUrl="/"
      afterSignUpUrl="/"
      afterSignOutUrl="/"
      appearance={clerkAppearance}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
