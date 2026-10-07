function parseGoogleMapsInput(input) {
  const trimmed = input.trim();

  // 1. Raw Place ID (ChIJ...)
  const chijMatch = trimmed.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
  if (chijMatch) {
    const pid = chijMatch[0];
    return {
      name: "Verified Google Place",
      placeId: pid,
      address: `Official Google Place ID: ${pid}`,
      googleReviewUrl: `https://search.google.com/local/writereview?placeid=${pid}`,
      embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(pid)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
      isExactPlaceId: true,
    };
  }

  // 2. Direct writereview URL
  if (trimmed.includes("search.google.com/local/writereview")) {
    try {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      const pid = url.searchParams.get("placeid");
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

  // 3. Google Maps Place URL (/maps/place/<Name>/...)
  if (trimmed.includes("/maps/place/")) {
    const nameMatch = trimmed.match(/\/maps\/place\/([^/@?#]+)/);
    let name = "Google Maps Pin";
    if (nameMatch) {
      name = decodeURIComponent(nameMatch[1].replace(/\+/g, " "));
    }

    // Check for hex CID: !1s0x...:0x...
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

    const reviewUrl = cidDec
      ? `https://maps.google.com/?cid=${cidDec}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;

    const embedQuery = coords || name;

    return {
      name,
      placeId: cidDec || undefined,
      address: `Google Maps Pin: ${name}`,
      googleReviewUrl: reviewUrl,
      embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(embedQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
      isExactPlaceId: Boolean(cidDec),
    };
  }

  // 4. CID URL (cid=...)
  if (trimmed.includes("cid=")) {
    try {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      const cid = url.searchParams.get("cid");
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

  // 5. Short g.page review link
  if (trimmed.includes("g.page/")) {
    return {
      name: "Google Review Page",
      address: trimmed,
      googleReviewUrl: trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
      embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
      isExactPlaceId: true,
    };
  }

  return null;
}

// Test various inputs
console.log("1. Place URL test:", parseGoogleMapsInput("https://www.google.com/maps/place/COCOVA/@21.1184646,73.1166418,17z/data=!4m6!3m5!1s0x3be05985860d5b9d:0x70529d3810a9f5d!8m2!3d21.1184646!4d73.1166418"));
console.log("2. CID test:", parseGoogleMapsInput("https://maps.google.com/?cid=505856521528844125"));
console.log("3. ChIJ test:", parseGoogleMapsInput("ChIJN1t_tDeuEmsRUsoyG83frY4"));
console.log("4. writereview test:", parseGoogleMapsInput("https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4"));
