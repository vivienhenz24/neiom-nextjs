"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const PAGE_TITLE_MAP: Record<string, string> = {
  "/": "Demo Application",
  "/test": "Test",
}

function getPageTitle(pathname: string | null): string {
  if (!pathname) return "Dashboard"

  const normalizedPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname

  if (PAGE_TITLE_MAP[normalizedPath]) {
    return PAGE_TITLE_MAP[normalizedPath]
  }

  // If the path is deeper (e.g., /playground/text-to-speech), attempt to title-case the last segment
  const segments = normalizedPath.split("/").filter(Boolean)
  const fallback = segments.at(-1)

  if (!fallback) {
    return "Dashboard"
  }

  return fallback
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function DashboardTopBar() {
  const pathname = usePathname()

  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background md:left-[var(--sidebar-width)]">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Feedback
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Feedback</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Submit Feedback</DropdownMenuItem>
              <DropdownMenuItem>View Feedback</DropdownMenuItem>
              <DropdownMenuItem>Report an Issue</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Help
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Help</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Documentation</DropdownMenuItem>
              <DropdownMenuItem>Contact Support</DropdownMenuItem>
              <DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

