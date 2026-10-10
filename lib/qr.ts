import QRCode from "qrcode";

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    if (typeof window !== "undefined") {
      // In the browser, use standard canvas-based PNG data URL
      const dataUrl = await QRCode.toDataURL(text, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0a0a0a",
          light: "#ffffff",
        },
      });
      return dataUrl;
    }

    // In edge/server environments (Cloudflare Workers / OpenNext), avoid Node pngjs/zlib
    // Generate pure vector SVG data URL which is 100% portable and has zero native dependencies
    const svg = await QRCode.toString(text, {
      type: "svg",
      width: 320,
      margin: 2,
      color: {
        dark: "#0a0a0a",
        light: "#ffffff",
      },
    });
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  } catch (err) {
    console.error("Error generating QR code:", err);
    return "";
  }
}
