import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters." },
        { status: 400 }
      );
    }

    // 1. Direct Google Place ID check (starts with ChIJ...)
    const placeIdMatch = query.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
    if (placeIdMatch) {
      const pid = placeIdMatch[0];
      return NextResponse.json({
        success: true,
        type: "place_id",
        results: [
          {
            name: "Verified Google Place",
            placeId: pid,
            address: `Official Google Place ID: ${pid}`,
            googleReviewUrl: `https://search.google.com/local/writereview?placeid=${pid}`,
            embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(pid)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
            isExactPlaceId: true,
          },
        ],
      });
    }

    // 2. Google Maps URL parsing
    if (query.includes("google.com/maps") || query.includes("maps.app.goo.gl") || query.includes("g.page")) {
      // Check for placeid in query param
      const urlPlaceId = new URL(query.startsWith("http") ? query : `https://${query}`).searchParams.get("placeid");
      if (urlPlaceId) {
        return NextResponse.json({
          success: true,
          type: "url_extracted",
          results: [
            {
              name: "Extracted Business",
              placeId: urlPlaceId,
              address: `Google Maps Link: ${query}`,
              googleReviewUrl: `https://search.google.com/local/writereview?placeid=${urlPlaceId}`,
              embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(urlPlaceId)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
              isExactPlaceId: true,
            },
          ],
        });
      }
    }

    // 3. Search via Photon / OpenStreetMap Geocoding API
    const results: Array<{
      name: string;
      placeId?: string;
      address: string;
      category?: string;
      lat?: number;
      lng?: number;
      embedMapUrl: string;
      googleReviewUrl: string;
      isExactPlaceId: boolean;
    }> = [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`,
        {
          headers: { "User-Agent": "WidoxReviewAssistant/1.0" },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.features)) {
          for (const feat of data.features) {
            const props = feat.properties || {};
            const coords = feat.geometry?.coordinates || [];
            const name = props.name || props.street || query;
            const addressParts = [
              props.street,
              props.housenumber,
              props.district,
              props.city,
              props.state,
              props.country,
            ].filter(Boolean);
            const address = addressParts.join(", ") || name;

            const searchQueryForGoogle = `${name} ${props.city || ""}`.trim();
            const embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
              coords.length === 2 ? `${coords[1]},${coords[0]}` : searchQueryForGoogle
            )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

            // If an OSM ID or hash is available, provide deterministic ID or Google maps search link
            const osmId = props.osm_id ? `OSM_${props.osm_id}` : undefined;

            results.push({
              name,
              placeId: osmId,
              address,
              category: props.osm_value,
              lat: coords[1],
              lng: coords[0],
              embedMapUrl,
              googleReviewUrl: `https://search.google.com/local/writereview?placeid=${
                props.osm_id ? `OSM_${props.osm_id}` : encodeURIComponent(searchQueryForGoogle)
              }`,
              isExactPlaceId: false,
            });
          }
        }
      }
    } catch {
      // Graceful fallback if geocoding service is unavailable
    }

    // Always include the query itself as a direct Google Maps pin candidate
    const queryEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
      query
    )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

    results.unshift({
      name: query,
      address: `Google Maps Search: "${query}"`,
      embedMapUrl: queryEmbedUrl,
      googleReviewUrl: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
        query.toLowerCase().replace(/[^a-z0-9]/g, "-")
      )}`,
      isExactPlaceId: false,
    });

    return NextResponse.json({
      success: true,
      query,
      results,
    });
  } catch (error) {
    console.error("Places search error:", error);
    return NextResponse.json(
      { error: "Failed to search places" },
      { status: 500 }
    );
  }
}
