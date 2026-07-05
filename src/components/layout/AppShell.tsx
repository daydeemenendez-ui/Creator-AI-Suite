"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ProjectProvider } from "@/components/providers/ProjectProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProjectProvider>
      <div className="flex h-full overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-[#090909]">
            {children}
          </main>
        </div>
      </div>
    </ProjectProvider>
  );
}
