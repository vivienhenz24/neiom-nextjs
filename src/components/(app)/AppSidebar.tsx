"use client"

import Link from "next/link"
import { Home, Languages, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { useLocale } from "@/components/LocaleProvider"
import { getNestedTranslations } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const { state } = useSidebar()
  const { locale } = useLocale()
  const t = getNestedTranslations(locale).pages.dashboard.sidebar

  const applicationItems = [
    {
      title: t.demoApplication,
      icon: Home,
      href: "/",
    },
    {
      title: t.translate,
      icon: Languages,
      href: "/translate",
    },
  ]
  
  const handleSignOut = async () => {
    await authClient.signOut()
    
    // In dev mode, set a cookie flag to prevent getDevSession from returning a mock session
    // Always set this cookie - getDevSession will only check it in dev mode
    document.cookie = "neiom-dev-signed-out=true; path=/; max-age=86400" // 24 hours
    
    window.location.href = "/"
  }
  
  const triggerClassName = state === "collapsed" ? "h-8 w-8" : "ml-auto"
  const headerInnerClassName = cn(
    "flex items-center gap-2",
    state === "collapsed" ? "py-2" : "px-2 py-2"
  )

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className={headerInnerClassName}>
          {state === "collapsed" ? (
            <SidebarTrigger className={triggerClassName} />
          ) : (
            <>
              <h2 className="text-lg font-semibold">Neiom</h2>
              <SidebarTrigger className={triggerClassName} />
            </>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.application}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {applicationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut />
              <span>{t.signOut}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
