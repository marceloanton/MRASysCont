import type { Metadata } from "next";
import { getLicenseStatus } from "@/lib/license";
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
  const license = getLicenseStatus();

  return (
    <html lang="es">
      <body>
        {!license.hasCommercialKey ? (
          <div className="licenseBanner" role="note">
            {license.message}
          </div>
        ) : null}
        {children}
      </body>
    </html>
  );
}
