"use client"

import Link from "next/link"
import { Home, Volume2, Mic, LogOut } from "lucide-react"
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

const applicationItems = [
  {
    title: "Home",
    icon: Home,
    href: "/",
  },
]

const playgroundItems = [
  {
    title: "Text to Speech",
    icon: Volume2,
    href: "/playground/text-to-speech",
  },
  {
    title: "Automatic Speech Recognition",
    icon: Mic,
    href: "/playground/automatic-speech-recognition",
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  
  const handleSignOut = async () => {
    await authClient.signOut()
    
    // In dev mode, set a cookie flag to prevent getDevSession from returning a mock session
    // Always set this cookie - getDevSession will only check it in dev mode
    document.cookie = "neiom-dev-signed-out=true; path=/; max-age=86400" // 24 hours
    
    window.location.href = "/"
  }
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          {state === "collapsed" ? (
            <SidebarTrigger />
          ) : (
            <>
              <h2 className="text-lg font-semibold">Neiom</h2>
              <SidebarTrigger className="ml-auto" />
            </>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
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
        
        <SidebarGroup>
          <SidebarGroupLabel>Playground</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {playgroundItems.map((item) => (
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
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

