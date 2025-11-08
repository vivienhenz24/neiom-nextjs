import { NextRequest, NextResponse } from "next/server";

import { getDevSession } from "@/lib/dev-session";

export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for root path - it handles auth checks itself
  if (pathname === "/") {
    return NextResponse.next();
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log(`[${timestamp}] [Middleware] === MIDDLEWARE EXECUTION START ===`);
  console.log(`[${timestamp}] [Middleware] Path: ${pathname}`);
  console.log(`[${timestamp}] [Middleware] Method: ${request.method}`);
  console.log(`[${timestamp}] [Middleware] URL: ${request.url}`);
  
  const allCookies = request.cookies.getAll();
  console.log(`[${timestamp}] [Middleware] Total cookies received: ${allCookies.length}`);
  allCookies.forEach((cookie, index) => {
    console.log(`[${timestamp}] [Middleware] Cookie ${index + 1}: ${cookie.name} = ${cookie.value.substring(0, 50)}${cookie.value.length > 50 ? '...' : ''}`);
  });
  
  const cookieHeader = request.headers.get("cookie");
  console.log(`[${timestamp}] [Middleware] Cookie header string: ${cookieHeader ? cookieHeader.substring(0, 100) + '...' : 'null'}`);
  
  console.log(`[${timestamp}] [Middleware] Calling getDevSession...`);
  const session = await getDevSession(request.headers);

  console.log(`[${timestamp}] [Middleware] Session check completed`);
  console.log(`[${timestamp}] [Middleware] Session exists: ${session ? 'YES' : 'NO'}`);
  if (session) {
    console.log(`[${timestamp}] [Middleware] Session user ID: ${session.user?.id}`);
    console.log(`[${timestamp}] [Middleware] Session user email: ${session.user?.email}`);
    console.log(`[${timestamp}] [Middleware] Session user name: ${session.user?.name}`);
    console.log(`[${timestamp}] [Middleware] Session ID: ${session.session?.id}`);
  }

  if (!session) {
    console.log(`[${timestamp}] [Middleware] ❌ No session found, redirecting to /login`);
    console.log(`[${timestamp}] [Middleware] === MIDDLEWARE EXECUTION END (REDIRECT) ===\n`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  console.log(`[${timestamp}] [Middleware] ✅ Session valid, allowing request to proceed`);
  console.log(`[${timestamp}] [Middleware] === MIDDLEWARE EXECUTION END (SUCCESS) ===\n`);
  return NextResponse.next();
}
