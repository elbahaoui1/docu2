import { ReactNode } from "react";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { Sidebar } from "@/components/Sidebar";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container mx-auto px-6 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <aside className="md:sticky md:top-20 md:h-[calc(100vh-6rem)]">
            <Sidebar />
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}


