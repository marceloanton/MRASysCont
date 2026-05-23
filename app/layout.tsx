import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MRASysCont",
  description: "Sistema contable web multi-empresa para estudios contables."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
