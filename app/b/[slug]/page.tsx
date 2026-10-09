
import { notFound } from "next/navigation";
import { getBusinessBySlugAsync } from "@/lib/business-store";
import { BusinessReviewClient } from "@/components/review/BusinessReviewClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const business = await getBusinessBySlugAsync(params.slug);
  if (!business) {
    return {
      title: "Business Not Found | revasy Review Assistant",
      description: "The requested business review page could not be found.",
    };
  }

  const title = `Review ${business.name} on Google | Powered by revasy`;
  const description =
    business.tagline ||
    `Leave genuine feedback for ${business.name}. AI organizes your thoughts into a polished Google review in 30 seconds.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "revasy Review Assistant",
      ...(business.logoUrl
        ? {
            images: [
              {
                url: business.logoUrl,
                alt: `${business.name} Logo`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@revasy",
      ...(business.logoUrl
        ? {
            images: [business.logoUrl],
          }
        : {}),
    },
  };
}

export default async function BusinessReviewPage({ params }: PageProps) {
  const business = await getBusinessBySlugAsync(params.slug);

  if (!business) {
    notFound();
  }

  return <BusinessReviewClient business={business} />;
}
