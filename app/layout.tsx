import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "AutoIntegrate - Build Integrations in Minutes",
  description: "Automated API integrations that generate code, commit changes, and open pull requests — all from one dashboard.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
