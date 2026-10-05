import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/business-store";
import { BusinessReviewClient } from "@/components/review/BusinessReviewClient";
import type { Metadata } from "next";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const business = getBusinessBySlug(params.slug);
  if (!business) {
    return {
      title: "Business Not Found | Widox Review Assistant",
    };
  }

  return {
    title: `${business.name} | Google Review Assistant`,
    description: `Leave genuine feedback for ${business.name}. AI organizes your thoughts into a polished Google review in 30 seconds.`,
  };
}

export default async function BusinessReviewPage({ params }: PageProps) {
  const business = getBusinessBySlug(params.slug);

  if (!business) {
    notFound();
  }

  return <BusinessReviewClient business={business} />;
}
