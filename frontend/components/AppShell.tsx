"use client";

import { usePathname } from "next/navigation";
import { SidebarNavigation } from "@/components/SidebarNavigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullPage = pathname === "/" || pathname === "/boot";

  if (isFullPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNavigation />
      <div className="flex-1 pl-72 flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
