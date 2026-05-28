import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Prompt Test",
  description: "Testing and comparing AI prompts across different routes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-900 antialiased">
        <div className="flex min-h-screen w-full">
          
          {/* ส่วน Sidebar ฝั่งซ้าย */}
          <Sidebar />

          {/* ส่วนเนื้อหาหลักฝั่งขวา: หักลบขนาดสัดส่วนหน้าจอให้พอดีเป๊ะ ไม่เบี้ยว */}
          <main className="flex-1 w-[calc(100%-18rem)] p-10 ml-72">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}