import { headers } from "next/headers";

import Footer from "@/components/landing_page/Footer";
import Hero from "@/components/landing_page/Hero";
import TopBar from "@/components/landing_page/TopBar";
import { AuthenticatedLayout } from "@/components/(app)/AuthenticatedLayout";
import { getSession } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession(await headers());

  if (!session) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <Hero />
        <Footer />
      </div>
    );
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
