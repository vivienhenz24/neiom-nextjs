"use client"

import * as React from "react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLocale } from "@/components/LocaleProvider"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
          <div className="text-sm leading-none font-normal">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

export default function TopBar() {
  const isMobile = useIsMobile()
  const { t } = useLocale()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [solutionsOpen, setSolutionsOpen] = React.useState(false)

  if (isMobile) {
    return (
      <nav className="w-full px-4 sm:px-6 py-4 bg-white border-b border-gray-200">
        {/* Mobile Header */}
        <div className="flex justify-between items-center">
          <Link href="/" className="text-lg sm:text-xl font-normal text-black hover:underline transition-all">
            {t.brand}
          </Link>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 pb-4 border-t border-gray-200 pt-4 animate-fadeIn">
            <div className="space-y-4">
              {/* Solutions Dropdown */}
              <div>
                <button 
                  onClick={() => setSolutionsOpen(!solutionsOpen)}
                  className="flex items-center justify-between w-full text-left py-2 text-base font-normal text-black"
                >
                  {t.solutions}
                  <svg 
                    className={`w-4 h-4 transition-transform ${solutionsOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {solutionsOpen && (
                  <div className="ml-4 mt-2 space-y-2">
                    <Link 
                      href="/solutions/advertisements" 
                      className="block py-2 text-sm text-gray-600 hover:text-black transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t.advertisements}
                    </Link>
                    <Link 
                      href="/solutions/accessibility" 
                      className="block py-2 text-sm text-gray-600 hover:text-black transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t.accessibility}
                    </Link>
                    <Link 
                      href="/solutions/announcements" 
                      className="block py-2 text-sm text-gray-600 hover:text-black transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t.announcements}
                    </Link>
                    <Link 
                      href="/solutions/call-centers" 
                      className="block py-2 text-sm text-gray-600 hover:text-black transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t.callCenters}
                    </Link>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                <Link 
                  href="/contact"
                  className="block w-full px-4 py-3 bg-black text-white text-center border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 text-sm font-normal"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.contact}
                </Link>
                <Link 
                  href="/login"
                  className="block w-full px-4 py-3 bg-white text-black text-center border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 text-sm font-normal"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.login}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    )
  }

  // Desktop version remains the same
  return (
    <nav className="w-full px-4 sm:px-8 lg:px-16 py-4 sm:py-6 flex justify-between items-center">
      <div className="flex items-baseline gap-4 sm:gap-8">
        <Link href="/" className="text-lg sm:text-xl lg:text-2xl font-normal text-black hover:underline transition-all">
          {t.brand}
        </Link>
        
        <NavigationMenu viewport={isMobile}>
          <NavigationMenuList className="items-baseline">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-sm sm:text-base lg:text-lg py-0">{t.solutions}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid grid-cols-1 sm:grid-cols-2 w-[300px] sm:w-[600px] gap-3 p-4">
                  <ListItem href="/solutions/advertisements" title={t.advertisements}>
                    {t.advertisementsDesc}
                  </ListItem>
                  <ListItem href="/solutions/accessibility" title={t.accessibility}>
                    {t.accessibilityDesc}
                  </ListItem>
                  <ListItem href="/solutions/announcements" title={t.announcements}>
                    {t.announcementsDesc}
                  </ListItem>
                  <ListItem href="/solutions/call-centers" title={t.callCenters}>
                    {t.callCentersDesc}
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} text-sm sm:text-base lg:text-lg py-0`}>
                <Link href="/careers">{t.careers}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      
      <div className="flex gap-2">
        <Link 
          href="/contact"
          className="px-2 py-1.5 sm:px-3 sm:py-2 bg-black text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 text-xs sm:text-sm font-normal leading-none"
        >
          {t.contact}
        </Link>
        <Link 
          href="/login"
          className="px-2 py-1.5 sm:px-3 sm:py-2 bg-white text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 text-xs sm:text-sm font-normal leading-none"
        >
          {t.login}
        </Link>
      </div>
    </nav>
  )
}
