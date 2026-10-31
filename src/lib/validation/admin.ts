import { z } from 'zod';

const text = (maximum: number) => z.string().trim().min(1).max(maximum);
const imageUrl = z.string().url().max(2_048).refine((value) => {
  const url = new URL(value);
  return url.protocol === 'https:' && (url.hostname.endsWith('.supabase.co') || url.hostname === 'localhost');
}, 'Invalid image URL.');

export const materialImportSchema = z.object({
  items: z.array(z.object({
    code: text(64).regex(/^[A-Za-z0-9_-]+$/), name: text(255), displayName: text(255), productType: text(120), category: text(120),
    subcategory: z.string().trim().max(120).optional(), shortDescription: z.string().trim().max(2_000).optional(),
    detailedDescription: z.string().trim().max(20_000).optional(), seoTitle: z.string().trim().max(255).optional(), seoDescription: z.string().trim().max(500).optional(),
    colors: z.array(z.object({ code: text(64).regex(/^[A-Za-z0-9_-]+$/), name: text(255), imageUrl, storagePath: z.string().trim().min(1).max(1_024).regex(/^[A-Za-z0-9][A-Za-z0-9._/-]*$/) })).max(50),
  })).min(1).max(100),
});

export const liveContentSchema = z.object({
  content: z.record(z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/), z.string().max(50_000)).refine((value) => Object.keys(value).length <= 500),
});
