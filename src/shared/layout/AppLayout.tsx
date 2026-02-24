import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="h-dvh overflow-hidden bg-neutral-950 text-neutral-100 flex flex-col">
            <Header sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
            <div className="flex flex-1 min-h-0 min-w-0">
                <Sidebar open={sidebarOpen} onClose={closeSidebar} />
                <main className="relative flex-1 min-w-0 min-h-0 overflow-y-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
