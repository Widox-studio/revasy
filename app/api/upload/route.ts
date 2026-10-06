
import { NextResponse } from "next/server";

let fs: any = null;
let path: any = null;
try {
  if (typeof process !== "undefined" && process.env.NEXT_RUNTIME !== "edge") {
    // @ts-ignore
    fs = require("fs");
    // @ts-ignore
    path = require("path");
  }
} catch (e) {
  // Ignore in edge environments
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Check if Cloudflare R2 binding is available
    const env = (process.env as any) || {};
    const r2Bucket = env.R2_BUCKET || env.BUCKET || (globalThis as any).R2_BUCKET;
    if (r2Bucket && typeof r2Bucket.put === "function") {
      const ext = path.extname(file.name) || ".png";
      const filename = `logo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      await r2Bucket.put(filename, bytes, {
        httpMetadata: { contentType: file.type || "image/png" },
      });
      const publicDomain = process.env.R2_PUBLIC_DOMAIN || "";
      const publicUrl = publicDomain ? `${publicDomain}/${filename}` : `/api/upload/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl });
    }

    // 2. Local Node.js filesystem storage (if available and writable)
    try {
      if (typeof fs !== "undefined" && typeof fs.existsSync === "function") {
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const ext = path.extname(file.name) || ".png";
        const filename = `logo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, buffer);
        return NextResponse.json({ success: true, url: `/uploads/${filename}` });
      }
    } catch (fsErr) {
      console.warn("Filesystem write unavailable, using edge data URL fallback:", fsErr);
    }

    // 3. Cloudflare Worker Edge fallback: Data URL
    const mime = file.type || "image/png";
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mime};base64,${base64Data}`;
    return NextResponse.json({ success: true, url: dataUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
