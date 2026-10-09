import { config } from "./config";

export interface ReviewDrafts {
  natural: string;
  warm: string;
  short: string;
}

export interface ReplyDrafts {
  professional: string;
  warm: string;
  concise: string;
}

export interface ExtractedAspects {
  chips: string[];
  notes: string;
}

/**
 * Deduplicate repeated phrases or sentences in raw customer text
 */
export function deduplicatePhrases(text: string): string {
  if (!text) return "";
  const parts = text.split(/(?<=[.!?\n])\s+/);
  const seen = new Set<string>();
  const uniqueParts: string[] = [];

  for (const part of parts) {
    const norm = part.replace(/[.!?]+$/, "").trim().toLowerCase();
    if (!norm) continue;
    if (!seen.has(norm)) {
      seen.add(norm);
      uniqueParts.push(part.trim());
    }
  }

  return uniqueParts.length > 0 ? uniqueParts.join(" ") : text;
}

/**
 * Extract distinct highlight chips and free-form notes from customer input.
 * When multiple prompt chips are tapped, they are joined with periods or commas.
 */
export function extractChipsAndNotes(text: string): ExtractedAspects {
  if (!text) return { chips: [], notes: "" };

  const rawParts = text
    .split(/(?:[.;\n•]+|\s{2,})/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chips: string[] = [];
  const notesParts: string[] = [];
  const seen = new Set<string>();

  for (const part of rawParts) {
    const normalized = part.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    // If it's a concise phrase (<= 55 characters) without narrative conjunctions,
    // it represents an explicit highlight chip selected by the guest
    if (part.length <= 55 && !part.includes(" because ") && !part.includes(" however ")) {
      chips.push(part);
    } else {
      notesParts.push(part);
    }
  }

  if (chips.length === 0 && rawParts.length > 0) {
    chips.push(rawParts[0]);
    if (rawParts.length > 1) {
      notesParts.push(...rawParts.slice(1));
    }
  }

  return {
    chips,
    notes: notesParts.join(". "),
  };
}

function getCloudflareAiBinding(): any {
  try {
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env?.AI) return ctx.env.AI;
  } catch {}
  try {
    const env = (process.env as any) || {};
    return (
      (globalThis as any).AI ||
      env.AI ||
      (globalThis as any).ai ||
      env.ai ||
      (globalThis as any).__env__?.AI ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Call Cloudflare Workers AI (@cf/meta/llama-3-8b-instruct or @cf/meta/llama-3.2-3b-instruct)
 * Supported channels:
 * 1. Direct Edge Worker Binding (env.AI) when running in Cloudflare Pages / Workers runtime
 * 2. Dedicated revasy Cloudflare Edge Worker API (https://revasy-api.widoxstudio.workers.dev/api/ai)
 * 3. Direct Cloudflare Workers AI REST API
 */
async function callCloudflareWorkersAi(
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.85
): Promise<string | null> {
  const model = config.cloudflare.model || "@cf/meta/llama-3-8b-instruct";

  // 1. Direct Edge Worker Binding if running in Cloudflare Pages / OpenNext runtime
  const aiBinding = getCloudflareAiBinding();
  if (aiBinding && typeof aiBinding.run === "function") {
    try {
      const result = await aiBinding.run(model, {
        messages,
        temperature,
      });
      return result?.response || result?.choices?.[0]?.message?.content || null;
    } catch (e) {
      console.warn("Cloudflare Workers AI binding failed:", e);
    }
  }

  // 2. Dedicated revasy Cloudflare Edge Worker API endpoint
  const workerUrl = config.cloudflare.workerUrl || "https://revasy-api.widoxstudio.workers.dev";
  if (workerUrl) {
    try {
      const res = await fetch(`${workerUrl}/api/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          model,
          temperature,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        if (data?.result) {
          return typeof data.result === "string" ? data.result : JSON.stringify(data.result);
        }
      }
    } catch (e) {
      console.warn("revasy Cloudflare Worker AI call failed, trying direct REST API:", e);
    }
  }

  // 3. Cloudflare Workers AI direct HTTP API if credentials exist
  const cfAccountId = config.cloudflare.accountId || process.env.CLOUDFLARE_ACCOUNT_ID || "38d1ceb6731de305dc93daf3659e371c";
  const cfApiToken = config.cloudflare.apiToken || process.env.CLOUDFLARE_API_TOKEN;

  if (cfAccountId && cfApiToken) {
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cfApiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages, temperature }),
        }
      );
      if (res.ok) {
        const data = (await res.json()) as any;
        return data?.result?.response || data?.result?.choices?.[0]?.message?.content || null;
      }
    } catch (e) {
      console.warn("Cloudflare AI HTTP API call failed:", e);
    }
  }

  return null;
}

/**
 * Fallback: Groq Cloud API (llama-3.3-70b-versatile)
 */
async function callGroqFallback(
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.85
): Promise<string | null> {
  const apiKey = config.groq.apiKey;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.groq.model || "llama-3.3-70b-versatile",
        temperature,
        max_tokens: 750,
        response_format: { type: "json_object" },
        messages,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      return data?.choices?.[0]?.message?.content || null;
    } else {
      const err = await res.text();
      console.warn(`Groq API returned status ${res.status}:`, err);
    }
  } catch (err) {
    console.warn("Groq fallback call failed:", err);
  }
  return null;
}

/**
 * Fallback: Google Gemini API (gemini-1.5-flash)
 */
async function callGeminiFallback(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.85
): Promise<string | null> {
  const apiKey = config.gemini.apiKey;
  if (!apiKey) return null;

  try {
    const model = config.gemini.model || "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature,
          responseMimeType: "application/json",
        },
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } else {
      const err = await res.text();
      console.warn(`Gemini API returned status ${res.status}:`, err);
    }
  } catch (err) {
    console.warn("Gemini fallback call failed:", err);
  }
  return null;
}

/**
 * Fallback: OpenRouter API (meta-llama/llama-3.3-70b-instruct or configured)
 */
async function callOpenRouterFallback(
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.85
): Promise<string | null> {
  const apiKey = config.openrouter.apiKey;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://revasy.com",
        "X-Title": "revasy",
      },
      body: JSON.stringify({
        model: config.openrouter.model || "meta-llama/llama-3.3-70b-instruct",
        temperature,
        max_tokens: 750,
        response_format: { type: "json_object" },
        messages,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      return data?.choices?.[0]?.message?.content || null;
    } else {
      const err = await res.text();
      console.warn(`OpenRouter API returned status ${res.status}:`, err);
    }
  } catch (err) {
    console.warn("OpenRouter fallback call failed:", err);
  }
  return null;
}

/**
 * Fallback: OpenAI GPT API (gpt-4o-mini)
 */
async function callOpenAiFallback(
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.85
): Promise<string | null> {
  const apiKey = config.openai.apiKey;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.openai.model || "gpt-4o-mini",
        temperature,
        max_tokens: 600,
        response_format: { type: "json_object" },
        messages,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      return data?.choices?.[0]?.message?.content || null;
    } else {
      const err = await res.text();
      console.warn(`OpenAI API returned status ${res.status}:`, err);
    }
  } catch (err) {
    console.warn("OpenAI fallback call failed:", err);
  }
  return null;
}

/**
 * Unified AI Orchestrator with cascading fallback chain:
 * 1. Cloudflare Workers AI (@cf/meta/llama-3-8b-instruct / Edge binding & revasy-api)
 * 2. Groq Cloud API (llama-3.3-70b-versatile)
 * 3. Google Gemini API (gemini-1.5-flash)
 * 4. OpenRouter (meta-llama/llama-3.3-70b-instruct)
 * 5. OpenAI (gpt-4o-mini)
 */
async function callAiWithFallbacks(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.85
): Promise<{ result: string | null; provider: string | null }> {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  // 1. Cloudflare Workers AI (Edge Binding or revasy-api Worker)
  try {
    const cfOut = await callCloudflareWorkersAi(messages, temperature);
    if (cfOut) {
      try {
        const parsed = parseJsonOutput(cfOut);
        if (parsed && typeof parsed === "object") {
          return { result: cfOut, provider: "cloudflare-workers-ai" };
        }
      } catch {
        // Output was not structured JSON, cascade to next provider
      }
    }
  } catch (e) {
    console.warn("Cloudflare Workers AI attempt failed, cascading:", e);
  }

  // 2. Groq
  if (config.groq.apiKey) {
    try {
      const groqOut = await callGroqFallback(messages, temperature);
      if (groqOut) return { result: groqOut, provider: "groq" };
    } catch (e) {
      console.warn("Groq attempt failed, cascading:", e);
    }
  }

  // 3. Google Gemini
  if (config.gemini.apiKey) {
    try {
      const geminiOut = await callGeminiFallback(systemPrompt, userPrompt, temperature);
      if (geminiOut) return { result: geminiOut, provider: "gemini" };
    } catch (e) {
      console.warn("Gemini attempt failed, cascading:", e);
    }
  }

  // 4. OpenRouter
  if (config.openrouter.apiKey) {
    try {
      const openRouterOut = await callOpenRouterFallback(messages, temperature);
      if (openRouterOut) return { result: openRouterOut, provider: "openrouter" };
    } catch (e) {
      console.warn("OpenRouter attempt failed, cascading:", e);
    }
  }

  // 5. OpenAI
  if (config.openai.apiKey) {
    try {
      const openAiOut = await callOpenAiFallback(messages, temperature);
      if (openAiOut) return { result: openAiOut, provider: "openai" };
    } catch (e) {
      console.warn("OpenAI attempt failed, cascading:", e);
    }
  }

  return { result: null, provider: null };
}

/**
 * Clean and parse JSON from AI outputs
 */
function parseJsonOutput(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    // Attempt extracting json from markdown codeblocks
    const match = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/```\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch {}
    }
    // Attempt finding outer { and }
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(raw.substring(firstBrace, lastBrace + 1));
      } catch {}
    }
    throw new Error("Unable to parse AI response as JSON");
  }
}

/**
 * Generate 3 customer review options based on genuine feedback, rating, and business context.
 * Features full multi-chip synthesis and cascading AI fallback architecture.
 */
export async function generateCustomerReviewDrafts(
  rating: number,
  customerText: string,
  businessName: string = "Cocova Cafe",
  businessCategory: string = "Cafe & Restaurant",
  variationIndex: number = 0
): Promise<ReviewDrafts> {
  const variationDirective =
    variationIndex > 0
      ? `\nVARIATION INSTRUCTION #${variationIndex}: The user requested fresh draft variations. Ensure distinctly different sentence openers, varied phrasing, and creative synonyms compared to common drafts.`
      : "";

  const { chips, notes } = extractChipsAndNotes(customerText);

  let multiChipInstruction = "";
  if (chips.length > 1) {
    multiChipInstruction = `
CRITICAL MULTI-CHIP COVERAGE & SYNTHESIS REQUIREMENT:
The customer explicitly highlighted ${chips.length} key aspects of their experience:
${chips.map((c, i) => `  - Highlight #${i + 1}: "${c}"`).join("\n")}
${notes ? `Customer's additional notes: "${notes}"\n` : ""}

MANDATORY RULES:
1. You MUST incorporate and reflect ALL ${chips.length} selected highlights into EACH of the 3 drafts ("natural", "warm", "short").
2. DO NOT omit, ignore, or overlook ANY selected highlight.
3. DO NOT output a mechanical bullet list. Synthesize all points into a smooth, cohesive review as a real customer would write it.
4. Ensure the draft mentions every highlight while keeping the flow completely organic and conversational.`;
  } else if (chips.length === 1) {
    multiChipInstruction = `
CORE HIGHLIGHT:
The customer highlighted: "${chips[0]}"${notes ? ` with notes: "${notes}"` : ""}.
Ensure this core highlight is naturally featured in all drafts.`;
  }

  const systemPrompt = `You are a helpful review writing assistant for customers of "${businessName}", a ${businessCategory}.
Your task is to take the customer's raw, genuine notes and selected highlight chips and star rating (${rating} out of 5 stars) and organize them into 3 polished, natural Google review drafts.
${variationDirective}
${multiChipInstruction}

CRITICAL INSTRUCTIONS:
1. STRICT TRUTHFULNESS: Only polish, clarify, and format the facts, items, impressions, and details supplied by the customer.
2. DO NOT INVENT or hallucinate any services, products, prices, staff names, or events not mentioned by the customer.
3. RESPECT THE RATING:
   - For 4-5 stars: Reflect their positive experience genuinely.
   - For 3 stars: Reflect the mixed or average experience accurately and fairly.
   - For 1-2 stars: Keep it polite, constructive, and honest about what fell short as described by the customer. DO NOT twist negative feedback into false praise.
4. Output must be valid JSON with exactly 3 keys:
   - "natural": Natural, conversational review written in first person ("I / We").
   - "warm": Warm, friendly, and appreciative (or empathetic if lower rating) tone.
   - "short": Short & simple, 1 to 2 concise sentences highlighting all their core points.

Format strictly as JSON:
{
  "natural": "...",
  "warm": "...",
  "short": "..."
}`;

  const deduplicatedNotes = deduplicatePhrases(customerText);
  const userPrompt = `Rating: ${rating} Stars\nSelected Highlights & Notes: "${deduplicatedNotes}"\nNumber of Highlight Chips: ${chips.length}\nIteration: ${variationIndex}`;

  try {
    const { result, provider } = await callAiWithFallbacks(systemPrompt, userPrompt, 0.85);
    if (result) {
      const parsed = parseJsonOutput(result);
      if (parsed.natural && parsed.warm && parsed.short) {
        return {
          natural: parsed.natural,
          warm: parsed.warm,
          short: parsed.short,
        };
      }
    }
  } catch (err) {
    console.warn("AI generation with fallbacks encountered an error:", err);
  }

  // Final fallback: Smart Contextual Multi-Chip Template Engine
  return generateMockReviewDrafts(rating, customerText, businessName, variationIndex);
}

/**
 * Generate 3 owner reply drafts for Google reviews for any business.
 * Powered by cascading AI fallbacks.
 */
export async function generateOwnerReplyDrafts(
  rating: number,
  customerReview: string,
  businessName: string = "Cocova Cafe",
  businessCategory: string = "Local Business",
  reviewerName?: string
): Promise<ReplyDrafts> {
  const nameGreeting = reviewerName
    ? `Address ${reviewerName} courteously.`
    : "Use a friendly general greeting.";

  const systemPrompt = `You are writing replies on behalf of the owner/management of "${businessName}" (${businessCategory}) to Google reviews.
${nameGreeting}

CRITICAL RULES:
1. Directly acknowledge the specific details, compliments, or concerns mentioned in the customer's review.
2. DO NOT invent policies, fake excuses, or unapproved promises (such as "your next visit is free").
3. TONE BY RATING:
   - 4-5 stars: Express warm gratitude, mention their specific highlight, invite them back.
   - 3 stars: Thank them for the balanced feedback, acknowledge where things could be better, invite them to visit again.
   - 1-2 stars: Express sincere empathy and apology for failing to meet expectations, thank them for bringing it to attention, and offer a professional channel to talk further without defensive arguments.
4. Output must be valid JSON with exactly 3 keys:
   - "professional": Formal, respectful, polished hospitality response.
   - "warm": Heartfelt, personal, warm business owner tone.
   - "concise": Brief, clear, direct acknowledgement (2-3 sentences).

Format strictly as JSON:
{
  "professional": "...",
  "warm": "...",
  "concise": "..."
}`;

  const userPrompt = `Customer Rating: ${rating} Stars\nReview: "${customerReview}"\nReviewer: ${reviewerName || "Customer"}`;

  try {
    const { result, provider } = await callAiWithFallbacks(systemPrompt, userPrompt, 0.7);
    if (result) {
      const parsed = parseJsonOutput(result);
      if (parsed.professional && parsed.warm && parsed.concise) {
        return {
          professional: parsed.professional || parsed.Professional || "",
          warm: parsed.warm || parsed.Warm || "",
          concise: parsed.concise || parsed.Concise || "",
        };
      }
    }
  } catch (err) {
    console.warn("Owner reply generation encountered error:", err);
  }

  // Final Fallback: Zero-Hallucination Template Engine
  return generateMockReplyDrafts(rating, customerReview, businessName, reviewerName);
}

/**
 * Zero-Hallucination Multi-Chip Synthesis Template Engine
 * Guarantees 100% uptime and synthesizes ALL selected highlight chips
 */
function generateMockReviewDrafts(
  rating: number,
  customerText: string,
  businessName: string,
  variationIndex: number = 0
): ReviewDrafts {
  const { chips, notes } = extractChipsAndNotes(customerText);
  const cleanInput = deduplicatePhrases(customerText)
    .replace(/\s+/g, " ")
    .replace(/[.,;!?]+$/, "")
    .trim();

  // Multi-chip synthesis phrase
  let synthesizedHighlights = cleanInput;
  if (chips.length > 1) {
    const cleanChips = chips.map((c) => c.replace(/[.!?]+$/, "").trim());
    if (cleanChips.length === 2) {
      synthesizedHighlights = `${cleanChips[0]} and ${cleanChips[1]}`;
    } else {
      synthesizedHighlights = `${cleanChips.slice(0, -1).join(", ")}, and ${cleanChips[cleanChips.length - 1]}`;
    }
    if (notes) {
      synthesizedHighlights += ` (${notes})`;
    }
  }

  const starWord = rating === 5 ? "5-star" : `${rating}-star`;
  const idx = Math.abs(variationIndex);

  if (rating >= 4) {
    const naturalTemplates = [
      `Visited ${businessName} recently and had a great experience. Really appreciated the ${synthesizedHighlights}. Definitely recommend checking them out!`,
      `Had a wonderful visit to ${businessName}. Everything including the ${synthesizedHighlights} made it memorable and seamless from beginning to end.`,
      `Stopped by ${businessName} today and thoroughly enjoyed it. Loved the ${synthesizedHighlights}. Five stars from me!`,
      `So glad I came to ${businessName}! The ${synthesizedHighlights} stood out in the best way. Everything went smoothly and I'll certainly be back.`,
      `Really impressed with ${businessName}. Particularly enjoyed the ${synthesizedHighlights}. Consistently great quality and wonderful atmosphere.`,
      `Great experience overall at ${businessName}. The ${synthesizedHighlights} made it well worth the visit. Will gladly recommend to friends.`,
      `Checked out ${businessName} based on recommendations and wasn't disappointed. The ${synthesizedHighlights} was top-tier. Looking forward to next time!`,
      `${businessName} truly delivered today. The ${synthesizedHighlights} was fantastic. A wonderful experience all around.`,
    ];

    const warmTemplates = [
      `Really loved my experience at ${businessName}! The ${synthesizedHighlights} made my day. Huge thank you to the team for making it so special. Will definitely be returning soon!`,
      `What a delightful place! ${businessName} blew me away with their ${synthesizedHighlights}. So grateful for the wonderful hospitality and attention to detail.`,
      `Heartfelt thanks to everyone at ${businessName}! You can truly feel how much care goes into their ${synthesizedHighlights}.`,
      `Had the warmest, most wonderful time at ${businessName}. The ${synthesizedHighlights} left me with a big smile on my face!`,
      `Can't say enough good things about ${businessName}! The ${synthesizedHighlights} was outstanding and the team is so kind and welcoming throughout.`,
      `Such a lovely spot! Visiting ${businessName} was definitely a highlight of my week. The ${synthesizedHighlights} was exceptional. Keep up the fantastic work!`,
      `Loved every minute spent at ${businessName}. The ${synthesizedHighlights} was truly appreciated. Big thanks to the staff!`,
      `Five glowing stars for ${businessName}! From the ${synthesizedHighlights} to the warm hospitality, thank you for making our visit so enjoyable!`,
    ];

    const shortTemplates = [
      `Loved the ${synthesizedHighlights} at ${businessName} — truly a ${starWord} experience!`,
      `Terrific visit to ${businessName}! The ${synthesizedHighlights} was spot-on. Highly recommended.`,
      `Great ${synthesizedHighlights} at ${businessName}. Completely exceeded expectations!`,
      `Super impressed by ${businessName} — especially the ${synthesizedHighlights}. Will definitely return!`,
      `Top-tier quality at ${businessName}: ${synthesizedHighlights}! A must-visit.`,
      `Loved the ${synthesizedHighlights} — a solid 10/10 visit to ${businessName}.`,
      `Fantastic ${synthesizedHighlights} at ${businessName}! Can't wait to visit again.`,
      `Fast, friendly, and great: ${synthesizedHighlights}. Kudos to ${businessName}!`,
    ];

    return {
      natural: naturalTemplates[idx % naturalTemplates.length],
      warm: warmTemplates[(idx + 2) % warmTemplates.length],
      short: shortTemplates[(idx + 4) % shortTemplates.length],
    };
  } else if (rating === 3) {
    const naturalTemplates = [
      `Tried ${businessName} recently. The ${synthesizedHighlights} had good moments, though a couple of things could be improved.`,
      `Visited ${businessName} today. Noting the ${synthesizedHighlights} — overall an average experience with some decent highlights and room to grow.`,
      `My visit to ${businessName} was okay. Appreciated the ${synthesizedHighlights}, but there is definitely promise here with some fine-tuning.`,
      `Fairly balanced visit at ${businessName}. Had a mixed impression regarding ${synthesizedHighlights}. Not bad, but could have been smoother.`,
      `Checked out ${businessName}. The ${synthesizedHighlights} was decent overall, though not quite at peak performance yet.`,
      `An acceptable experience at ${businessName} regarding ${synthesizedHighlights}. Hope to see ongoing improvements in future visits.`,
    ];

    const warmTemplates = [
      `Appreciated my visit to ${businessName}. While I noted ${synthesizedHighlights}, I hope to see a few refinements next time.`,
      `Thank you to ${businessName} for having us. Shared my honest thoughts on ${synthesizedHighlights}. Wishing the team all the best as they continue to polish the experience.`,
      `Had an okay visit at ${businessName}. Experienced ${synthesizedHighlights}. With a little more attention to detail, this could be wonderful.`,
      `Sharing constructive thoughts on ${businessName}: ${synthesizedHighlights}. Good foundation and I look forward to seeing how they evolve.`,
      `Decent atmosphere at ${businessName} with ${synthesizedHighlights}. Hopeful for an even stronger visit next time around.`,
      `Thanks to the staff at ${businessName} for their effort with ${synthesizedHighlights}. A decent spot that has good potential.`,
    ];

    const shortTemplates = [
      `Mixed visit regarding ${synthesizedHighlights} — an okay experience at ${businessName} with room for improvement.`,
      `Decent overall at ${businessName}: ${synthesizedHighlights}. Some highlights, some things to tune.`,
      `Average experience with ${synthesizedHighlights}. A fair 3-star visit to ${businessName}.`,
      `Balanced thoughts on ${businessName} — ${synthesizedHighlights}.`,
      `${businessName} was alright today regarding ${synthesizedHighlights}.`,
      `Fair visit to ${businessName} with potential: ${synthesizedHighlights}.`,
    ];

    return {
      natural: naturalTemplates[idx % naturalTemplates.length],
      warm: warmTemplates[(idx + 2) % warmTemplates.length],
      short: shortTemplates[(idx + 4) % shortTemplates.length],
    };
  } else {
    const naturalTemplates = [
      `Sharing my honest feedback regarding ${businessName}: had issues with ${synthesizedHighlights}. Hopefully management takes this constructively.`,
      `Visited ${businessName} and unfortunately came away disappointed regarding ${synthesizedHighlights}. Hope this helps the team make necessary fixes.`,
      `Had an underwhelming experience at ${businessName}. The ${synthesizedHighlights} unfortunately fell short of expectations.`,
      `Disappointed with my recent visit to ${businessName}. The ${synthesizedHighlights} needs significant attention to quality and service.`,
      `Writing this feedback about ${businessName} so the owners are aware: ${synthesizedHighlights} was not up to par. Hoping they address these concerns.`,
      `Unfortunately my time at ${businessName} was not standard regarding ${synthesizedHighlights}. Hope things improve soon.`,
    ];

    const warmTemplates = [
      `I wanted to share my experience with ${businessName}: the ${synthesizedHighlights} unfortunately did not meet expectations this time.`,
      `I really wanted to like ${businessName}, but was let down by the ${synthesizedHighlights}. Sincerely hope the team takes this to heart.`,
      `Sharing this with ${businessName} in hopes of constructive change: experienced issues with ${synthesizedHighlights}. Disappointed by how things unfolded today.`,
      `It pains me to write this, but my visit to ${businessName} was frustrating regarding ${synthesizedHighlights}. Hoping for better standards in future.`,
      `Hoping management at ${businessName} takes note of this: we expected much better care regarding ${synthesizedHighlights}.`,
      `Left ${businessName} feeling disappointed today about ${synthesizedHighlights}. Sincere feedback for the management to review.`,
    ];

    const shortTemplates = [
      `Disappointing visit to ${businessName} regarding ${synthesizedHighlights}.`,
      `Unfortunately did not have a good experience with ${synthesizedHighlights} at ${businessName}.`,
      `The ${synthesizedHighlights} fell well below expectations at ${businessName}.`,
      `Not satisfied with ${synthesizedHighlights} at ${businessName}.`,
      `Underwhelming visit to ${businessName}: ${synthesizedHighlights}.`,
      `Needs improvement at ${businessName} — ${synthesizedHighlights}.`,
    ];

    return {
      natural: naturalTemplates[idx % naturalTemplates.length],
      warm: warmTemplates[(idx + 2) % warmTemplates.length],
      short: shortTemplates[(idx + 4) % shortTemplates.length],
    };
  }
}

function generateMockReplyDrafts(
  rating: number,
  customerReview: string,
  businessName: string,
  reviewerName?: string
): ReplyDrafts {
  const formalGreeting = reviewerName ? `Dear ${reviewerName}` : "Dear valued customer";
  const warmGreeting = reviewerName ? `Hi ${reviewerName}!` : "Hi there!";
  const conciseGreeting = reviewerName ? ` ${reviewerName}` : "";

  if (rating >= 4) {
    return {
      professional: `${formalGreeting}, thank you for taking the time to share your review of ${businessName}. We are delighted to hear your thoughts and appreciate your patronage. We look forward to welcoming you back soon.`,
      warm: `${warmGreeting} Thank you so much for the kind words and support! It means the world to our team at ${businessName}. Can't wait to see you again soon!`,
      concise: `Thanks for the great review${conciseGreeting}! We're thrilled you had a wonderful experience at ${businessName} and hope to see you again soon.`,
    };
  } else if (rating === 3) {
    return {
      professional: `${formalGreeting}, thank you for your candid feedback. At ${businessName}, we strive for consistency and quality with every guest, and we've taken note of your comments to help us improve. We hope to serve you better next time.`,
      warm: `${warmGreeting} Thank you for sharing your thoughts with us. We always want to provide a stellar experience, and we appreciate your constructive feedback as we work to keep getting better.`,
      concise: `Thank you for your feedback${conciseGreeting}. We appreciate you letting us know where we can do better, and we hope to welcome you back soon.`,
    };
  } else {
    return {
      professional: `${formalGreeting}, thank you for bringing this to our attention. We are genuinely sorry to hear that your experience did not meet our usual standards at ${businessName}. We take your feedback seriously and are addressing this with our team. If you'd like to share further details, please reach out to us directly.`,
      warm: `${warmGreeting} We are so sorry your experience fell short. That is never what we want for anyone who visits ${businessName}. We'd truly appreciate the chance to learn more and make things right if you could get in touch with our team.`,
      concise: `We apologize for your disappointing experience${conciseGreeting}. We appreciate you speaking up, and we are actively working with our team to address this issue.`,
    };
  }
}
