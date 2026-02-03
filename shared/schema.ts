import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Import Auth and Chat models
export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"), // Lucide icon name
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  icon: text("icon"),
  offeringCount: integer("offering_count").default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  vendorName: text("vendor_name"),
  
  // Categorization & Metadata
  categoryId: integer("category_id").references(() => categories.id),
  pricingTier: text("pricing_tier"), // Free, Freemium, Paid, Enterprise
  integrationType: text("integration_type"), // API, Native, HL7, FHIR
  deploymentType: text("deployment_type"), // Cloud, On-premise, Hybrid
  
  // Detailed Specs (JSON for flexibility in MVP)
  specifications: jsonb("specifications").$type<{
    technicalDetails?: string;
    requirements?: string;
    licensing?: string;
  }>(),

  // AI Specific
  isAiCapable: boolean("is_ai_capable").default(false),
  aiCapabilities: jsonb("ai_capabilities").$type<string[]>(), // e.g., ["NLP", "Computer Vision"]
  
  // Stats
  rating: integer("rating").default(0), // scaled 0-50
  reviewCount: integer("review_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const productTopics = pgTable("product_topics", {
  productId: integer("product_id").notNull().references(() => products.id),
  topicId: integer("topic_id").notNull().references(() => topics.id),
}, (t) => [
  primaryKey({ columns: [t.productId, t.topicId] })
]);

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  userId: text("user_id").notNull().references(() => users.id),
  
  rating: integer("rating").notNull(), // 1-5
  content: text("content"),
  pros: text("pros"),
  cons: text("cons"),
  
  // Context
  organizationSize: text("organization_size"),
  usageDuration: text("usage_duration"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const comparisons = pgTable("comparisons", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comparisonProducts = pgTable("comparison_products", {
  comparisonId: integer("comparison_id").notNull().references(() => comparisons.id),
  productId: integer("product_id").notNull().references(() => products.id),
}, (t) => [
  primaryKey({ columns: [t.comparisonId, t.productId] })
]);

export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: integer("value").notNull(),
  label: text("label").notNull(),
});

// === RELATIONS ===

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  reviews: many(reviews),
  topics: many(productTopics),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  category: one(categories, {
    fields: [topics.categoryId],
    references: [categories.id],
  }),
  products: many(productTopics),
}));

export const productTopicsRelations = relations(productTopics, ({ one }) => ({
  product: one(products, {
    fields: [productTopics.productId],
    references: [products.id],
  }),
  topic: one(topics, {
    fields: [productTopics.topicId],
    references: [topics.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const comparisonsRelations = relations(comparisons, ({ many }) => ({
  products: many(comparisonProducts),
}));

export const comparisonProductsRelations = relations(comparisonProducts, ({ one }) => ({
  comparison: one(comparisons, {
    fields: [comparisonProducts.comparisonId],
    references: [comparisons.id],
  }),
  product: one(products, {
    fields: [comparisonProducts.productId],
    references: [products.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true, 
  createdAt: true, 
  rating: true, 
  reviewCount: true 
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ 
  id: true, 
  createdAt: true 
});

export const insertComparisonSchema = createInsertSchema(comparisons).omit({ 
  id: true, 
  createdAt: true 
});

export const insertTopicSchema = createInsertSchema(topics).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Comparison = typeof comparisons.$inferSelect;
export type Stat = typeof stats.$inferSelect;

export type ProductWithCategory = Product & { category: Category | null };
export type ReviewWithUser = Review & { user: typeof users.$inferSelect };

export type CreateProductRequest = z.infer<typeof insertProductSchema>;
export type CreateReviewRequest = z.infer<typeof insertReviewSchema>;

export type ProductDetailResponse = ProductWithCategory & {
  reviews?: ReviewWithUser[];
  topics?: Topic[];
};

export type ComparisonResponse = Comparison & {
  products: Product[];
};
