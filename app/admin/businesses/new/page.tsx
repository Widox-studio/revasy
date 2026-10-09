import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { OnboardingWizard } from "@/components/admin/OnboardingWizard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Onboard Business | revasy Ops",
  description: "White-glove merchant onboarding and Google Place ID provisioning.",
};

export default async function NewBusinessPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (!session.isSuperAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <AdminNav userEmail={session.email} />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <OnboardingWizard />
      </main>
    </div>
  );
}
