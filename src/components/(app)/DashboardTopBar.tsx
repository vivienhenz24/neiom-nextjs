"use client"

import { useMemo, type CSSProperties } from "react"
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
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useLocale } from "@/components/LocaleProvider"
import { getNestedTranslations } from "@/lib/i18n"

export function DashboardTopBar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const { locale } = useLocale()
  const t = getNestedTranslations(locale).pages.dashboard.topBar

  const pageTitle = useMemo(() => {
    if (!pathname) return t.pageTitles.dashboard

    const normalizedPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname

    if (normalizedPath === "/") {
      return t.pageTitles.demoApplication
    }
    if (normalizedPath === "/translate") {
      return t.pageTitles.translate
    }

    // If the path is deeper, attempt to title-case the last segment
    const segments = normalizedPath.split("/").filter(Boolean)
    const fallback = segments.at(-1)

    if (!fallback) {
      return t.pageTitles.dashboard
    }

    return fallback
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }, [pathname, t])
  
  // Determine left position based on sidebar state
  // Expanded: left-64 (16rem = 256px), Collapsed: left-16 (4rem = 64px)
  const isSidebarOpen = state === "expanded"
  const topBarStyle = useMemo<CSSProperties>(() => {
    return {
      "--sidebar-topbar-offset": isSidebarOpen
        ? "var(--sidebar-width)"
        : "var(--sidebar-width-icon)",
    } as CSSProperties
  }, [isSidebarOpen])

  return (
    <header
      style={topBarStyle}
      className={cn(
        "fixed top-0 left-0 right-0 h-14 border-b bg-background z-50 transition-[left] duration-200 ease-linear",
        // On mobile: full width (left-0)
        // On desktop: adjust based on sidebar state via CSS variable
        "md:left-[var(--sidebar-topbar-offset)]"
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {t.feedback.button}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t.feedback.label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t.feedback.submitFeedback}</DropdownMenuItem>
              <DropdownMenuItem>{t.feedback.viewFeedback}</DropdownMenuItem>
              <DropdownMenuItem>{t.feedback.reportIssue}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {t.help.button}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t.help.label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t.help.documentation}</DropdownMenuItem>
              <DropdownMenuItem>{t.help.contactSupport}</DropdownMenuItem>
              <DropdownMenuItem>{t.help.keyboardShortcuts}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
