import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Vecino",
  description: "Marketplace hiperlocal Vecino",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-vecino-bg text-vecino-text">{children}</body>
    </html>
  )
}
