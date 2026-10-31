import { z } from 'zod';

const slug = z.string().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang.');
const status = z.enum(['draft', 'in_review', 'approved', 'scheduled', 'published', 'archived']);

export const postInputSchema = z.object({
  title: z.string().trim().min(5).max(180), slug, excerpt: z.string().trim().max(500).default(''),
  content: z.object({ blocks: z.array(z.object({ type: z.enum(['heading','paragraph','quote','list','image','cta','faq']), text: z.string().max(10_000).optional(), level: z.number().int().min(1).max(3).optional(), items: z.array(z.string().max(2_000)).max(50).optional(), url: z.string().url().optional(), alt: z.string().max(250).optional() })).max(250) }).default({ blocks: [] }),
  featuredImageUrl: z.string().url().or(z.literal('')).default(''), featuredImageAlt: z.string().max(250).default(''),
  categoryId: z.string().uuid().nullable().optional(), tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  status: status.default('draft'), scheduledAt: z.string().datetime().nullable().optional(),
  seoTitle: z.string().max(70).default(''), metaDescription: z.string().max(160).default(''), canonicalUrl: z.string().url().or(z.literal('')).default(''),
  ogTitle: z.string().max(95).default(''), ogDescription: z.string().max(200).default(''), ogImageUrl: z.string().url().or(z.literal('')).default(''),
});

export type PostInput = z.infer<typeof postInputSchema>;
