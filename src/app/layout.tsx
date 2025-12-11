import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Kalako ERP",
  description: "Multi-tenant ERP",
  icons: {
    icon: "/kalakofav.ico",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center">
        {children}
      </body>
    </html>
  );
}
