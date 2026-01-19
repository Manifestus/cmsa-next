import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Sidebar from "@/app/components/Sidebar";
import MobileNav from "@/app/components/MobileNav";

export const metadata: Metadata = { title: "CMSA" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="min-h-dvh bg-background text-foreground">
        <Providers>
            {/* mobile top bar + sheet */}
            <MobileNav />
            <div className="mx-auto w-full max-w lg:grid lg:grid-cols-[auto_1fr]">
                {/* desktop sidebar */}
                <div className="hidden lg:block">
                    <Sidebar />
                </div>
                {/* page content */}
                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </Providers>
        </body>
        </html>
    );
}