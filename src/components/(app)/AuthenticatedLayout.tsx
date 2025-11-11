"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { DashboardTopBar } from "./DashboardTopBar"

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardTopBar />
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 p-4 pt-[3.5rem]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

