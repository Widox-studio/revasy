import { z } from "zod";

export const ReviewGenerateInputSchema = z.object({
  rating: z
    .number({
      required_error: "Rating is required",
      invalid_type_error: "Rating must be a number",
    })
    .int("Rating must be an integer")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  customerText: z
    .string({
      required_error: "Experience text is required",
    })
    .trim()
    .min(3, "Please describe your experience in at least 3 characters")
    .max(1000, "Feedback must not exceed 1000 characters"),
});

export type ReviewGenerateInput = z.infer<typeof ReviewGenerateInputSchema>;

export const AdminLoginInputSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .trim()
    .email("Please provide a valid email address"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(1, "Password cannot be empty"),
});

export type AdminLoginInput = z.infer<typeof AdminLoginInputSchema>;

export const AdminReplyGenerateInputSchema = z.object({
  customerReview: z
    .string({
      required_error: "Customer review text is required",
    })
    .trim()
    .min(5, "Customer review must be at least 5 characters long")
    .max(2500, "Customer review must not exceed 2500 characters"),
  rating: z
    .number({
      required_error: "Rating is required",
    })
    .int()
    .min(1)
    .max(5),
  reviewerName: z.string().trim().max(80).optional(),
});

export type AdminReplyGenerateInput = z.infer<typeof AdminReplyGenerateInputSchema>;

export function sanitizeText(text: string): string {
  if (!text) return "";
  // Strip control characters and HTML tags to prevent XSS and prompt injection tricks
  return text
    .replace(/<[^>]*>?/gm, "")
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}
