import type { Metadata } from "next";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "C-LOTO | PT PLN Indonesia Power UBP Cilegon",
  description:
    "Cilegon Lockout Tagout Management System - Standard Operasional Prosedur Keselamatan Kerja PLTGU Cilegon (660 MW)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface antialiased min-h-screen">
        <RoleProvider>
          <div className="flex">
            <Sidebar />
            <div className="pl-64 flex flex-col min-h-screen w-full">
              <Header />
              <main className="w-full pt-16 bg-surface flex-1 px-6 py-6">
                {children}
              </main>
            </div>
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
