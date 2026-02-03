import { z } from 'zod';
import { insertProductSchema, insertReviewSchema, products, reviews, categories, comparisons, topics, stats } from './schema';

export { insertProductSchema, insertReviewSchema };

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      input: z.object({
        search: z.string().optional(),
        categoryId: z.string().optional(),
        topicId: z.string().optional(),
        isAiCapable: z.string().optional(),
        sort: z.enum(['rating', 'newest', 'reviews']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
      responses: {
        200: z.custom<typeof products.$inferSelect & { category: typeof categories.$inferSelect | null, topics: typeof topics.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products',
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories',
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect>()),
      },
    },
  },
  topics: {
    list: {
      method: 'GET' as const,
      path: '/api/topics',
      input: z.object({
        categoryId: z.string().optional(),
        featured: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof topics.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/topics/:slug',
      responses: {
        200: z.custom<typeof topics.$inferSelect & { products: typeof products.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  stats: {
    list: {
      method: 'GET' as const,
      path: '/api/stats',
      responses: {
        200: z.array(z.custom<typeof stats.$inferSelect>()),
      },
    },
  },
  reviews: {
    list: {
      method: 'GET' as const,
      path: '/api/products/:id/reviews',
      responses: {
        200: z.array(z.custom<typeof reviews.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products/:id/reviews',
      input: insertReviewSchema.omit({ productId: true, userId: true }),
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.internal,
      },
    },
  },
  comparisons: {
    create: {
      method: 'POST' as const,
      path: '/api/comparisons',
      input: z.object({
        productIds: z.array(z.number()),
        title: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof comparisons.$inferSelect>(),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/comparisons/:id',
      responses: {
        200: z.custom<typeof comparisons.$inferSelect & { products: typeof products.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
