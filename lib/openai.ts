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

function getCloudflareAiBinding(): any {
  try {
    const env = (process.env as any) || {};
    return (globalThis as any).AI || env.AI || (globalThis as any).ai || env.ai || null;
  } catch {
    return null;
  }
}

/**
 * Call Cloudflare Workers AI (@cf/meta/llama-3.1-8b-instruct)
 */
async function callCloudflareWorkersAi(messages: Array<{ role: string; content: string }>): Promise<string | null> {
  // 1. Direct Edge Worker Binding if running in Cloudflare runtime
  const aiBinding = getCloudflareAiBinding();
  if (aiBinding && typeof aiBinding.run === "function") {
    try {
      const result = await aiBinding.run("@cf/meta/llama-3.1-8b-instruct", { messages });
      return result?.response || result?.choices?.[0]?.message?.content || null;
    } catch (e) {
      console.warn("Cloudflare Workers AI binding failed:", e);
    }
  }

  // 2. Cloudflare Workers AI HTTP API if credentials exist
  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || "38d1ceb6731de305dc93daf3659e371c";
  const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (cfAccountId && cfApiToken) {
    try {
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${cfApiToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages })
      });
      if (res.ok) {
        const data = await res.json() as any;
        return data?.result?.response || data?.result?.choices?.[0]?.message?.content || null;
      }
    } catch (e) {
      console.warn("Cloudflare AI HTTP API call failed:", e);
    }
  }

  return null;
}

/**
 * Secondary fallback using standard web fetch to OpenAI-compatible completions endpoint
 */
async function callOpenAiFallback(messages: Array<{ role: string; content: string }>): Promise<string | null> {
  const apiKey = config.openai.apiKey;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.openai.model || "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 600,
        response_format: { type: "json_object" },
        messages,
      }),
    });

    if (res.ok) {
      const data = await res.json() as any;
      return data?.choices?.[0]?.message?.content || null;
    }
  } catch (err) {
    console.warn("OpenAI fallback failed:", err);
  }
  return null;
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
 * Pipeline: Primary Cloudflare Workers AI -> Secondary OpenAI -> Fallback Template Engine
 */
export async function generateCustomerReviewDrafts(
  rating: number,
  customerText: string,
  businessName: string = "Cocova Cafe",
  businessCategory: string = "Cafe & Restaurant"
): Promise<ReviewDrafts> {
  const systemPrompt = `You are a helpful review writing assistant for customers of "${businessName}", a ${businessCategory}.
Your task is to take the customer's raw, genuine notes about their experience and their star rating (${rating} out of 5 stars) and organize them into 3 polished, natural Google review drafts.

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
   - "short": Short & simple, 1 to 2 concise sentences highlighting their core point.

Format strictly as JSON:
{
  "natural": "...",
  "warm": "...",
  "short": "..."
}`;

  const userPrompt = `Rating: ${rating} Stars\nCustomer's notes: "${customerText}"`;

  // 1. Primary: Cloudflare Workers AI
  try {
    const cfOutput = await callCloudflareWorkersAi([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);
    if (cfOutput) {
      const parsed = parseJsonOutput(cfOutput);
      if (parsed.natural && parsed.warm && parsed.short) {
        return {
          natural: parsed.natural,
          warm: parsed.warm,
          short: parsed.short
        };
      }
    }
  } catch (cfErr) {
    console.warn("Cloudflare Workers AI generation failed, checking fallback:", cfErr);
  }

  // 2. Secondary Fallback: OpenAI GPT via native fetch
  try {
    const openAiOutput = await callOpenAiFallback([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);
    if (openAiOutput) {
      const parsed = parseJsonOutput(openAiOutput);
      return {
        natural: parsed.natural || parsed.Natural || "",
        warm: parsed.warm || parsed.Warm || "",
        short: parsed.short || parsed.Short || "",
      };
    }
  } catch (openaiErr) {
    console.warn("OpenAI generation failed, using contextual generator fallback:", openaiErr);
  }

  // 3. Tertiary Fallback: Zero-Hallucination Template Engine
  return generateMockReviewDrafts(rating, customerText, businessName);
}

/**
 * Generate 3 owner reply drafts for Google reviews for any business.
 * Pipeline: Primary Cloudflare Workers AI -> Secondary OpenAI -> Fallback Template Engine
 */
export async function generateOwnerReplyDrafts(
  rating: number,
  customerReview: string,
  businessName: string = "Cocova Cafe",
  businessCategory: string = "Local Business",
  reviewerName?: string
): Promise<ReplyDrafts> {
  const nameGreeting = reviewerName ? `Address ${reviewerName} courteously.` : "Use a friendly general greeting.";

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

  // 1. Primary: Cloudflare Workers AI
  try {
    const cfOutput = await callCloudflareWorkersAi([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);
    if (cfOutput) {
      const parsed = parseJsonOutput(cfOutput);
      if (parsed.professional && parsed.warm && parsed.concise) {
        return {
          professional: parsed.professional,
          warm: parsed.warm,
          concise: parsed.concise
        };
      }
    }
  } catch (cfErr) {
    console.warn("Cloudflare Workers AI reply generation failed, checking fallback:", cfErr);
  }

  // 2. Secondary Fallback: OpenAI GPT via native fetch
  try {
    const openAiOutput = await callOpenAiFallback([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);
    if (openAiOutput) {
      const parsed = parseJsonOutput(openAiOutput);
      return {
        professional: parsed.professional || parsed.Professional || "",
        warm: parsed.warm || parsed.Warm || "",
        concise: parsed.concise || parsed.Concise || "",
      };
    }
  } catch (openaiErr) {
    console.warn("OpenAI reply generation failed, using contextual generator fallback:", openaiErr);
  }

  // 3. Tertiary Fallback: Zero-Hallucination Template Engine
  return generateMockReplyDrafts(rating, customerReview, businessName, reviewerName);
}

function generateMockReviewDrafts(
  rating: number,
  customerText: string,
  businessName: string
): ReviewDrafts {
  const cleanInput = customerText.replace(/\s+/g, " ").trim();
  const starWord = rating === 5 ? "5-star" : `${rating}-star`;

  if (rating >= 4) {
    return {
      natural: `Visited ${businessName} recently and had a great experience. ${cleanInput}. Definitely recommend checking them out!`,
      warm: `Really loved my experience at ${businessName}! ${cleanInput}. Huge thank you to the team for making it so memorable. Will definitely be returning soon!`,
      short: `${cleanInput} — really glad I visited ${businessName}, truly a ${starWord} experience!`,
    };
  } else if (rating === 3) {
    return {
      natural: `Tried ${businessName} recently. ${cleanInput}. A solid place with potential, though a couple of things could be improved.`,
      warm: `Appreciated my visit to ${businessName}. ${cleanInput}. Hope to see a few refinements next time.`,
      short: `${cleanInput} — an okay experience at ${businessName} with room for improvement.`,
    };
  } else {
    return {
      natural: `Sharing my honest feedback regarding ${businessName}: ${cleanInput}. Hopefully management takes this constructively.`,
      warm: `I wanted to share my experience with ${businessName}: ${cleanInput}. It unfortunately did not meet expectations this time.`,
      short: `${cleanInput} — disappointing visit to ${businessName}.`,
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
