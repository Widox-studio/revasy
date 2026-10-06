interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM businesses ORDER BY created_at DESC"
    ).all();

    const businesses = results.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline || "",
      category: row.category || "General Business",
      description: row.description || "",
      googleReviewUrl: row.google_review_url,
      logoUrl: row.logo_url || "",
      accentColor: row.accent_color || "teal",
      customPrompts: JSON.parse(row.custom_prompts || "[]"),
      ownerEmail: row.owner_email,
      createdAt: row.created_at,
      stats: {
        totalReviewsGenerated: row.total_reviews_generated || 0,
        totalRepliesGenerated: row.total_replies_generated || 0,
      },
    }));

    return new Response(JSON.stringify({ success: true, businesses }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const id = body.id || `biz_${Date.now()}`;
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const name = body.name;
    const tagline = body.tagline || "";
    const category = body.category || "General Business";
    const description = body.description || "";
    const googleReviewUrl = body.googleReviewUrl || "";
    const logoUrl = body.logoUrl || "";
    const accentColor = body.accentColor || "teal";
    const customPrompts = JSON.stringify(body.customPrompts || []);
    const ownerEmail = body.ownerEmail || "owner@cocovacafe.com";
    const createdAt = new Date().toISOString();

    await context.env.DB.prepare(`
      INSERT OR REPLACE INTO businesses (
        id, slug, name, tagline, category, description, google_review_url, logo_url, accent_color, custom_prompts, owner_email, total_reviews_generated, total_replies_generated, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?);
    `).bind(
      id, slug, name, tagline, category, description, googleReviewUrl, logoUrl, accentColor, customPrompts, ownerEmail, createdAt
    ).run();

    const business = {
      id,
      slug,
      name,
      tagline,
      category,
      description,
      googleReviewUrl,
      logoUrl,
      accentColor,
      customPrompts: JSON.parse(customPrompts),
      ownerEmail,
      createdAt,
      stats: { totalReviewsGenerated: 0, totalRepliesGenerated: 0 },
    };

    return new Response(JSON.stringify({ success: true, business }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
