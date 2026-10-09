import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getAllBusinessesAsync } from "@/lib/business-store";
import { AdminNav } from "@/components/admin/AdminNav";
import { FleetOverview } from "@/components/admin/FleetOverview";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "revasy Ops | Super-Admin Fleet Command",
  description: "Global business provisioning, Place ID pinning, and fleet oversight.",
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  // Only super-admins have access to the fleet operations console
  if (!session.isSuperAdmin) {
    redirect("/dashboard");
  }

  const businesses = await getAllBusinessesAsync();

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <AdminNav userEmail={session.email} />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <FleetOverview initialBusinesses={businesses} />
      </main>
      <footer className="border-t border-hairline py-4 px-4 text-center text-xs text-muted">
        <p>
          &copy; {new Date().getFullYear()} revasy Ops Console &bull; Made and maintained by{" "}
          <a
            href="https://widox.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
          >
            widox
          </a>
        </p>
      </footer>
    </div>
  );
}
