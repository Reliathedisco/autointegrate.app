import * as React from "react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ padding: "32px", fontFamily: "sans-serif" }}>
      <h2>AutoIntegrate</h2>
      <div>{children}</div>
      <p style={{ fontSize: 12, color: "#999" }}>
        © {new Date().getFullYear()} AutoIntegrate
      </p>
    </div>
  );
};
