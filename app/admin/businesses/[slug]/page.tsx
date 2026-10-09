import { redirect, notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getBusinessBySlugAsync } from "@/lib/business-store";
import { generateQrDataUrl } from "@/lib/qr";
import { AdminNav } from "@/components/admin/AdminNav";
import { BusinessManager } from "@/components/admin/BusinessManager";

export const dynamic = "force-dynamic";

interface BusinessDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BusinessDetailPageProps) {
  const business = await getBusinessBySlugAsync(params.slug);
  return {
    title: business ? `Configure ${business.name} | revasy Ops` : "Configure Business | revasy Ops",
    description: "Location telemetry, Place ID configuration, and stand URLs.",
  };
}

export default async function BusinessDetailPage({ params }: BusinessDetailPageProps) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (!session.isSuperAdmin) {
    redirect("/dashboard");
  }

  const business = await getBusinessBySlugAsync(params.slug);

  if (!business) {
    notFound();
  }

  const standUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/b/${business.slug}`;
  const qrDataUrl = await generateQrDataUrl(standUrl);

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <AdminNav userEmail={session.email} />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <BusinessManager
          initialBusiness={business}
          userAppUrl=""
          qrDataUrl={qrDataUrl}
        />
      </main>
    </div>
  );
}
