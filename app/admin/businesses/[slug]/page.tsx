import { redirect, notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getBusinessBySlugAsync } from "@/lib/business-store";
import { AdminNav } from "@/components/admin/AdminNav";
import { BusinessManager } from "@/components/admin/BusinessManager";

export const dynamic = "force-dynamic";

interface BusinessDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BusinessDetailPageProps) {
  try {
    const slug = params?.slug;
    const business = slug ? await getBusinessBySlugAsync(slug) : null;
    return {
      title: business ? `Configure ${business.name} | revasy Ops` : "Configure Business | revasy Ops",
      description: "Location telemetry, Place ID configuration, and stand URLs.",
    };
  } catch {
    return {
      title: "Configure Business | revasy Ops",
      description: "Location telemetry, Place ID configuration, and stand URLs.",
    };
  }
}

export default async function BusinessDetailPage({ params }: BusinessDetailPageProps) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (!session.isSuperAdmin) {
    redirect("/dashboard");
  }

  const slug = params?.slug;
  if (!slug) {
    notFound();
  }

  const business = await getBusinessBySlugAsync(slug);

  if (!business) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://revasy.widox.in";

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <AdminNav userEmail={session.email} />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <BusinessManager
          initialBusiness={business}
          userAppUrl={appUrl}
        />
      </main>
    </div>
  );
}
