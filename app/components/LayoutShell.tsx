"use client";

import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* Desktop sidebar */}
            <aside className="hidden md:block w-64 border-r bg-card/40 backdrop-blur sticky top-0 h-screen">
                <Sidebar />
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0">
                {/* Mobile top bar with sheet-triggered menu */}
                <div className="md:hidden sticky top-0 z-30 bg-background/70 backdrop-blur border-b">
                    <MobileNav />
                </div>

                <div className="p-4 md:p-6">{children}</div>
            </main>
        </div>
    );
}