import { headers } from "next/headers";

import Footer from "@/components/landing_page/Footer";
import Hero from "@/components/landing_page/Hero";
import TopBar from "@/components/landing_page/TopBar";
import { AuthenticatedLayout } from "@/components/(app)/AuthenticatedLayout";
import { getDevSession } from "@/lib/dev-session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const timestamp = new Date().toISOString();
  console.log(`\n${"=".repeat(80)}`);
  console.log(`[${timestamp}] [AppLayout] === APP LAYOUT START ===`);
  
  const headersList = await headers();
  console.log(`[${timestamp}] [AppLayout] Checking authentication...`);
  
  const session = await getDevSession(headersList);
  
  console.log(`[${timestamp}] [AppLayout] Session check completed`);
  console.log(`[${timestamp}] [AppLayout] Session exists: ${session ? 'YES' : 'NO'}`);
  
  // If not authenticated, show landing page
  if (!session) {
    console.log(`[${timestamp}] [AppLayout] ⚪ No session, rendering landing page`);
    console.log(`[${timestamp}] [AppLayout] === APP LAYOUT END (LANDING PAGE) ===\n`);
    return (
      <div className="min-h-screen">
        <TopBar />
        <Hero />
        <Footer />
      </div>
    );
  }

  console.log(`[${timestamp}] [AppLayout] ✅ Session valid, rendering authenticated layout with sidebar`);
  console.log(`[${timestamp}] [AppLayout] Session user: ${session.user?.email}`);
  console.log(`[${timestamp}] [AppLayout] === APP LAYOUT END (AUTHENTICATED) ===\n`);
  
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

