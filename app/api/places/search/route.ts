import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Parse any direct Google Maps link, place URL, CID, or Place ID
 */
async function parseDirectGoogleMapsInput(input: string): Promise<any | null> {
  let trimmed = input.trim();

  // 1. Follow short link redirect (maps.app.goo.gl or goo.gl/maps)
  if (trimmed.includes("maps.app.goo.gl") || trimmed.includes("goo.gl/maps")) {
    try {
      const fullUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      const headRes = await fetch(fullUrl, {
        method: "HEAD",
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (headRes.url && headRes.url !== fullUrl) {
        trimmed = headRes.url;
      }
    } catch (e) {
      console.warn("Could not follow short maps redirect:", e);
    }
  }

  // 2. Direct Google Place ID check (starts with ChIJ...)
  const placeIdMatch = trimmed.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
  if (placeIdMatch) {
    const pid = placeIdMatch[0];
    return {
      name: "Verified Google Place",
      placeId: pid,
      address: `Official Google Place ID: ${pid}`,
      googleReviewUrl: `https://search.google.com/local/writereview?placeid=${pid}`,
      embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(pid)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
      isExactPlaceId: true,
    };
  }

  // 3. Direct Google writereview URL
  if (trimmed.includes("search.google.com/local/writereview")) {
    try {
      const parsedUrl = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      const pid = parsedUrl.searchParams.get("placeid");
      if (pid) {
        return {
          name: "Verified Google Place",
          placeId: pid,
          address: `Google Review Place ID: ${pid}`,
          googleReviewUrl: `https://search.google.com/local/writereview?placeid=${pid}`,
          embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(pid)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
          isExactPlaceId: true,
        };
      }
    } catch {}
  }

  // 4. Google Maps Place URL (/maps/place/<Name>/...)
  if (trimmed.includes("/maps/place/")) {
    const nameMatch = trimmed.match(/\/maps\/place\/([^/@?#]+)/);
    let name = "Google Maps Pin";
    if (nameMatch) {
      name = decodeURIComponent(nameMatch[1].replace(/\+/g, " "));
    }

    // Check for hex CID: !1s0x...:0x<cidHex>
    const hexMatch = trimmed.match(/1s(0x[0-9a-fA-F]+:0x([0-9a-fA-F]+))/);
    let cidDec = "";
    if (hexMatch && hexMatch[2]) {
      try {
        cidDec = BigInt("0x" + hexMatch[2]).toString();
      } catch {}
    }

    // Check for coordinates
    const coordsMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const coords = coordsMatch ? `${coordsMatch[1]},${coordsMatch[2]}` : "";
    const embedQuery = coords || name;

    const reviewUrl = cidDec
      ? `https://maps.google.com/?cid=${cidDec}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;

    return {
      name,
      placeId: cidDec || undefined,
      address: `Google Maps Pin: ${name}`,
      googleReviewUrl: reviewUrl,
      embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(embedQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
      isExactPlaceId: Boolean(cidDec),
    };
  }

  // 5. Google Maps CID link (cid=...)
  if (trimmed.includes("cid=")) {
    try {
      const parsedUrl = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      const cid = parsedUrl.searchParams.get("cid");
      if (cid) {
        return {
          name: "Google Business Pin",
          placeId: cid,
          address: `Google Business CID: ${cid}`,
          googleReviewUrl: `https://maps.google.com/?cid=${cid}`,
          embedMapUrl: `https://maps.google.com/maps?q=cid:${cid}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
          isExactPlaceId: true,
        };
      }
    } catch {}
  }

  // 6. Short g.page link
  if (trimmed.includes("g.page/")) {
    const fullUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    return {
      name: "Google Review Page",
      address: trimmed,
      googleReviewUrl: fullUrl,
      embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
      isExactPlaceId: true,
    };
  }

  return null;
}

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

    // 1. Check if the query is a direct Google Maps link or Place ID
    const directResult = await parseDirectGoogleMapsInput(query);
    if (directResult) {
      return NextResponse.json({
        success: true,
        type: "direct_match",
        results: [directResult],
      });
    }

    // 2. Search via Photon / OpenStreetMap Geocoding API
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

            results.push({
              name,
              placeId: props.osm_id ? `OSM_${props.osm_id}` : undefined,
              address,
              category: props.osm_value,
              lat: coords[1],
              lng: coords[0],
              embedMapUrl,
              googleReviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQueryForGoogle)}`,
              isExactPlaceId: false,
            });
          }
        }
      }
    } catch {
      // Graceful fallback if geocoding service is unavailable
    }

    // 3. Always include the primary search query as the leading Google Maps pin candidate
    const queryEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
      query
    )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

    results.unshift({
      name: query,
      address: `Google Maps Pin: "${query}"`,
      embedMapUrl: queryEmbedUrl,
      googleReviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
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
