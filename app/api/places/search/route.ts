import { NextResponse } from "next/server";
import {
  encodeGooglePlaceId,
  encodeGooglePlaceIdFromHex,
  buildGoogleReviewUrl,
} from "@/lib/google-place-id";

export const dynamic = "force-dynamic";

/**
 * Strict validator for Google Maps short links to prevent Server-Side Request Forgery (SSRF).
 * Only allows https protocol and strictly whitelisted Google short link hostnames.
 */
function getValidGoogleMapsShortLink(inputUrl: string): URL | null {
  try {
    const raw = inputUrl.trim();
    const fullUrl = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    const parsed = new URL(fullUrl);

    // 1. Strictly enforce HTTPS (reject http, ftp, file, gopher, etc.)
    if (parsed.protocol !== "https:") {
      return null;
    }

    const hostname = parsed.hostname.toLowerCase();

    // 2. Reject IP addresses directly (e.g. 169.254.169.254, 127.0.0.1, internal subnets)
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname === "localhost" || hostname.includes("[")) {
      return null;
    }

    // 3. Exact hostname whitelist for Google Maps shortlinks
    if (hostname === "maps.app.goo.gl") {
      return parsed;
    }

    if (hostname === "goo.gl" && parsed.pathname.startsWith("/maps")) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Parse any direct Google Maps link, place URL, CID, or Place ID
 */
async function parseDirectGoogleMapsInput(input: string): Promise<any | null> {
  let trimmed = input.trim();

  // 1. Follow short link redirect (maps.app.goo.gl or goo.gl/maps) with strict SSRF defense
  const validShortLink = getValidGoogleMapsShortLink(trimmed);
  if (validShortLink) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(validShortLink.toString(), {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      clearTimeout(timeoutId);
      if (res.url && res.url !== validShortLink.toString()) {
        try {
          const destUrl = new URL(res.url);
          const destHost = destUrl.hostname.toLowerCase();
          // Verify redirect destination domain is legitimately Google
          if (destHost.endsWith(".google.com") || destHost === "google.com") {
            trimmed = res.url;
          }
        } catch {}
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

    // Check for hex cell + CID: !1s0x<cellHex>:0x<cidHex>
    const hexMatch = trimmed.match(/1s(0x[0-9a-fA-F]+):(0x[0-9a-fA-F]+)/);
    let resolvedPlaceId = "";
    let cidDec = "";

    if (hexMatch && hexMatch[1] && hexMatch[2]) {
      resolvedPlaceId = encodeGooglePlaceIdFromHex(hexMatch[1], hexMatch[2]);
      try {
        cidDec = BigInt(hexMatch[2].startsWith("0x") ? hexMatch[2] : "0x" + hexMatch[2]).toString();
      } catch {}
    }

    // Check for coordinates
    const coordsMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const coords = coordsMatch ? `${coordsMatch[1]},${coordsMatch[2]}` : "";
    const embedQuery = coords || name;

    const reviewUrl = resolvedPlaceId
      ? `https://search.google.com/local/writereview?placeid=${resolvedPlaceId}`
      : cidDec
      ? `https://maps.google.com/?cid=${cidDec}`
      : coords
      ? `https://maps.google.com/?q=${coords}`
      : `https://maps.google.com/?q=${encodeURIComponent(name)}`;

    return {
      name,
      placeId: resolvedPlaceId || cidDec || undefined,
      address: resolvedPlaceId ? `Google Place ID: ${resolvedPlaceId}` : `Google Maps Pin: ${name}`,
      googleReviewUrl: reviewUrl,
      embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(embedQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
      isExactPlaceId: Boolean(resolvedPlaceId || cidDec),
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

/**
 * Extract pinned business entities from Google Maps live embed response.
 * Generates valid iframe preview URLs centered on the pinned location and
 * returns matching candidates for autocomplete dropdowns.
 */
async function extractFromGoogleMapsEmbed(query: string): Promise<any[]> {
  try {
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const html = await res.text();
    const results: any[] = [];

    // 1. Direct Place ID match in HTML (ChIJ...)
    const placeIdMatch = html.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
    let primaryPlaceId = placeIdMatch ? placeIdMatch[0] : null;

    // 2. Check for hex cell + CID pair e.g. 0x3be067c764292f69:0x3aa71a8983300fac
    const hexPairMatch = html.match(/(0x[0-9a-fA-F]+):(0x[0-9a-fA-F]+)/);
    if (!primaryPlaceId && hexPairMatch && hexPairMatch[1] && hexPairMatch[2]) {
      const encoded = encodeGooglePlaceIdFromHex(hexPairMatch[1], hexPairMatch[2]);
      if (encoded) primaryPlaceId = encoded;
    }

    // 3. Decimal cell + CID pair from JSON arrays e.g. ["4314562549097508713","4226375953224306604"]
    let primaryCidDec = "";
    if (!primaryPlaceId) {
      const decPairMatch = html.match(/\["(\d{15,22})","(\d{15,22})"\]/);
      if (decPairMatch && decPairMatch[1] && decPairMatch[2]) {
        const encoded = encodeGooglePlaceId(decPairMatch[1], decPairMatch[2]);
        if (encoded) {
          primaryPlaceId = encoded;
        }
        primaryCidDec = decPairMatch[2];
      }
    }

    // 4. Spotlit Entity Extraction
    const spotlitPattern = /\["(0x[0-9a-fA-F]+):(0x[0-9a-fA-F]+)","([^"]+)",\[(-?\d+\.\d+),(-?\d+\.\d+)\],[^\]]*\],(?:"([^"]+)"|\[)/;
    const matchSpotlit = html.match(spotlitPattern);
    if (matchSpotlit) {
      const address = matchSpotlit[3];
      const lat = parseFloat(matchSpotlit[4]);
      const lng = parseFloat(matchSpotlit[5]);
      const name = matchSpotlit[6] || query;

      const spotlitPlaceId =
        primaryPlaceId ||
        encodeGooglePlaceIdFromHex(matchSpotlit[1], matchSpotlit[2]);

      const reviewUrl = spotlitPlaceId
        ? `https://search.google.com/local/writereview?placeid=${spotlitPlaceId}`
        : primaryCidDec
        ? `https://maps.google.com/?cid=${primaryCidDec}`
        : `https://maps.google.com/?q=${lat},${lng}`;

      // IMPORTANT: Google free iframe requires query text or coordinates, NOT place_id:
      const embedQuery = `${name} ${address}`.trim() || `${lat},${lng}`;
      const embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(embedQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

      results.push({
        name,
        placeId: spotlitPlaceId || primaryCidDec || undefined,
        address,
        lat,
        lng,
        embedMapUrl,
        googleReviewUrl: reviewUrl,
        isExactPlaceId: true,
        source: "google_maps_pinned",
      });
    } else if (primaryPlaceId || primaryCidDec) {
      // Direct Place ID or CID found without full spotlit wrapper
      const reviewUrl = primaryPlaceId
        ? `https://search.google.com/local/writereview?placeid=${primaryPlaceId}`
        : `https://maps.google.com/?cid=${primaryCidDec}`;

      const embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

      results.push({
        name: query,
        placeId: primaryPlaceId || primaryCidDec,
        address: `Google Maps Pin: ${query}`,
        embedMapUrl,
        googleReviewUrl: reviewUrl,
        isExactPlaceId: true,
        source: "google_maps_pinned",
      });
    }

    // 5. Check multi-pin list from categorical search results: [["<cell_id>","<cid>"],"/g/<mid>",null,[lat,lng]...
    const multiPinRegex = /\[\["(\d{15,22})","(\d{15,22})"\]\s*,\s*"\/g\/[a-zA-Z0-9_]+"\s*,\s*null\s*,\s*\[(\d+),(\d+)\]/g;
    const multiMatches = [...html.matchAll(multiPinRegex)];
    for (const m of multiMatches.slice(0, 5)) {
      const cellId = m[1];
      const cid = m[2];
      const lat = parseInt(m[3]) / 10000000;
      const lng = parseInt(m[4]) / 10000000;
      const encodedPlaceId = encodeGooglePlaceId(cellId, cid);
      const placeIdToUse = encodedPlaceId || cid;

      if (!results.some((r) => r.placeId === placeIdToUse)) {
        results.push({
          name: query,
          placeId: placeIdToUse,
          address: `Google Maps Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          lat,
          lng,
          embedMapUrl: `https://maps.google.com/maps?q=${lat},${lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
          googleReviewUrl: encodedPlaceId
            ? `https://search.google.com/local/writereview?placeid=${encodedPlaceId}`
            : `https://maps.google.com/?cid=${cid}`,
          isExactPlaceId: true,
          source: "google_maps_list",
        });
      }
    }

    return results;
  } catch (err: any) {
    if (err?.name !== "AbortError") {
      console.warn("Google Maps embed check note:", err?.message || err);
    }
    return [];
  }
}

async function fetchPhotonResults(query: string): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

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
        return data.features.map((feat: any) => {
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

          const exactPinUrl = coords.length === 2
            ? `https://maps.google.com/?q=${coords[1]},${coords[0]}`
            : `https://maps.google.com/?q=${encodeURIComponent(searchQueryForGoogle)}`;

          return {
            name,
            placeId: props.osm_id ? `OSM_${props.osm_id}` : undefined,
            address,
            category: props.osm_value,
            lat: coords[1],
            lng: coords[0],
            embedMapUrl,
            googleReviewUrl: exactPinUrl,
            isExactPlaceId: false,
            source: "photon_osm",
          };
        });
      }
    }
    return [];
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();
    const apiKey = searchParams.get("key")?.trim() || process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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

    // 2. If Google Maps API Key is provided, query Google Places API Find Place from Text
    if (apiKey) {
      try {
        const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
          query
        )}&inputtype=textquery&fields=place_id,name,formatted_address,geometry&key=${encodeURIComponent(apiKey)}`;

        const gRes = await fetch(findUrl);
        if (gRes.ok) {
          const gData = await gRes.json();
          if (Array.isArray(gData.candidates) && gData.candidates.length > 0) {
            const googleResults = gData.candidates.map((cand: any) => {
              const pid = cand.place_id;
              const coords = cand.geometry?.location;
              const name = cand.name || query;
              const address = cand.formatted_address || query;
              const embedQuery = `${name} ${address}`.trim();
              return {
                name,
                placeId: pid,
                address,
                lat: coords?.lat,
                lng: coords?.lng,
                embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(embedQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
                googleReviewUrl: `https://search.google.com/local/writereview?placeid=${pid}`,
                isExactPlaceId: true,
              };
            });

            return NextResponse.json({
              success: true,
              type: "google_places_api",
              results: googleResults,
            });
          }
        }
      } catch (gErr) {
        console.warn("Server-side Google Places API fetch failed:", gErr);
      }
    }

    // 3. Concurrently fetch Google Maps live embed pins and Photon OSM suggestions
    const [pinnedSettled, photonSettled] = await Promise.allSettled([
      extractFromGoogleMapsEmbed(query),
      fetchPhotonResults(query),
    ]);

    const pinnedPlaces: any[] =
      pinnedSettled.status === "fulfilled" ? pinnedSettled.value : [];
    const photonPlaces: any[] =
      photonSettled.status === "fulfilled" ? photonSettled.value : [];

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
      source?: string;
    }> = [...pinnedPlaces, ...photonPlaces];

    // 5. Fallback item if no pinned place or results found
    if (results.length === 0) {
      const queryEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
        query
      )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

      results.push({
        name: query,
        address: `Google Maps Pin: "${query}"`,
        embedMapUrl: queryEmbedUrl,
        googleReviewUrl: `https://maps.google.com/?q=${encodeURIComponent(query)}`,
        isExactPlaceId: false,
        source: "query_fallback",
      });
    }

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
