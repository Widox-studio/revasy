/**
 * Google Place ID Encoder & Decoder Utility
 * 
 * Google Place IDs starting with 'ChIJ' are 20-byte Protobuf messages:
 * - Field 1 (tag 0x0a): Length-delimited container (18 bytes = 0x12)
 *   - Subfield 1 (tag 0x09): 64-bit fixed little-endian integer (cell_id / location grid)
 *   - Subfield 2 (tag 0x11): 64-bit fixed little-endian integer (fprint / CID / ludocid)
 * Encoded as Base64 (URL-safe without padding).
 */

/**
 * Encodes two 64-bit integers (cellId and cid) into the official Google Place ID (ChIJ...)
 */
export function encodeGooglePlaceId(
  cellIdInput: string | bigint,
  cidInput: string | bigint
): string {
  try {
    const cellIdBig =
      typeof cellIdInput === "bigint"
        ? cellIdInput
        : cellIdInput.startsWith("0x") || cellIdInput.startsWith("0X")
        ? BigInt(cellIdInput)
        : BigInt(cellIdInput);

    const cidBig =
      typeof cidInput === "bigint"
        ? cidInput
        : cidInput.startsWith("0x") || cidInput.startsWith("0X")
        ? BigInt(cidInput)
        : BigInt(cidInput);

    const buf = Buffer.alloc(20);
    buf[0] = 0x0a; // Field 1, wire type 2 (length delimited)
    buf[1] = 0x12; // Length: 18 bytes
    buf[2] = 0x09; // Subfield 1, wire type 1 (fixed64)
    buf.writeBigUInt64LE(cellIdBig, 3);
    buf[11] = 0x11; // Subfield 2, wire type 1 (fixed64)
    buf.writeBigUInt64LE(cidBig, 12);

    // Google Place IDs use base64url or standard base64 without padding
    return buf.toString("base64url");
  } catch (err) {
    console.error("Failed to encode Google Place ID:", err);
    return "";
  }
}

/**
 * Encodes a pair of hex strings (e.g. from !1s0x3be067c764292f69:0x3aa71a8983300fac)
 */
export function encodeGooglePlaceIdFromHex(cellHex: string, cidHex: string): string {
  const normalizedCell = cellHex.startsWith("0x") ? cellHex : `0x${cellHex}`;
  const normalizedCid = cidHex.startsWith("0x") ? cidHex : `0x${cidHex}`;
  return encodeGooglePlaceId(normalizedCell, normalizedCid);
}

/**
 * Builds the official, clean Google 1-click review URL from a Place ID
 */
export function buildGoogleReviewUrl(placeId: string): string {
  if (!placeId) return "https://search.google.com";
  // If already a full URL, return as-is
  if (placeId.startsWith("http://") || placeId.startsWith("https://")) {
    return placeId;
  }
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}
