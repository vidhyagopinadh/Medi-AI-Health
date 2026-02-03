import { 
  products, categories, reviews, comparisons, comparisonProducts, topics, productTopics, stats,
  type Product, type Category, type Review, type Comparison, type Topic, type Stat,
  type CreateProductRequest, type CreateReviewRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, desc, and, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(filters?: { search?: string; categoryId?: number; topicId?: number; isAiCapable?: boolean; sort?: string }): Promise<Product[]>;
  getProduct(id: number): Promise<(Product & { category: Category | null, topics: Topic[] }) | undefined>;
  createProduct(product: CreateProductRequest): Promise<Product>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  
  // Topics
  getTopics(filters?: { categoryId?: number; featured?: boolean }): Promise<Topic[]>;
  getTopicBySlug(slug: string): Promise<(Topic & { products: Product[] }) | undefined>;

  // Stats
  getStats(): Promise<Stat[]>;
  
  // Reviews
  getReviewsByProduct(productId: number): Promise<Review[]>;
  createReview(review: CreateReviewRequest & { productId: number; userId: string }): Promise<Review>;
  
  // Comparisons
  createComparison(userId: string | null, productIds: number[], title?: string): Promise<Comparison>;
  getComparison(id: number): Promise<(Comparison & { products: Product[] }) | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(filters?: { search?: string; categoryId?: number; topicId?: number; isAiCapable?: boolean; sort?: string }): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    if (filters?.search) {
      conditions.push(ilike(products.name, `%${filters.search}%`));
    }
    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    if (filters?.isAiCapable !== undefined) {
      conditions.push(eq(products.isAiCapable, filters.isAiCapable));
    }
    
    if (filters?.topicId) {
      const topicSubquery = db.select({ productId: productTopics.productId })
        .from(productTopics)
        .where(eq(productTopics.topicId, filters.topicId));
      conditions.push(inArray(products.id, topicSubquery));
    }

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }
    
    if (filters?.sort === 'rating') {
      query = query.orderBy(desc(products.rating));
    } else if (filters?.sort === 'reviews') {
      query = query.orderBy(desc(products.reviewCount));
    } else {
      query = query.orderBy(desc(products.createdAt));
    }
    
    return await query;
  }

  async getProduct(id: number): Promise<(Product & { category: Category | null, topics: Topic[] }) | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return undefined;

    const category = product.categoryId ? await this.getCategory(product.categoryId) : null;
    
    const linkedTopics = await db
      .select({ topic: topics })
      .from(productTopics)
      .innerJoin(topics, eq(productTopics.topicId, topics.id))
      .where(eq(productTopics.productId, id));

    return {
      ...product,
      category: category || null,
      topics: linkedTopics.map(lt => lt.topic)
    };
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getTopics(filters?: { categoryId?: number; featured?: boolean }): Promise<Topic[]> {
    let query = db.select().from(topics);
    if (filters?.categoryId) {
      query = query.where(eq(topics.categoryId, filters.categoryId)) as any;
    }
    return await query;
  }

  async getTopicBySlug(slug: string): Promise<(Topic & { products: Product[] }) | undefined> {
    const [topic] = await db.select().from(topics).where(eq(topics.slug, slug));
    if (!topic) return undefined;

    const linkedProducts = await db
      .select({ product: products })
      .from(productTopics)
      .innerJoin(products, eq(productTopics.productId, products.id))
      .where(eq(productTopics.topicId, topic.id));

    return {
      ...topic,
      products: linkedProducts.map(lp => lp.product)
    };
  }

  async getStats(): Promise<Stat[]> {
    return await db.select().from(stats);
  }

  async getReviewsByProduct(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId));
  }

  async createReview(review: CreateReviewRequest & { productId: number; userId: string }): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    await db.execute(sql`
      UPDATE products 
      SET review_count = review_count + 1,
          rating = (rating * review_count + ${review.rating}) / (review_count + 1)
      WHERE id = ${review.productId}
    `);
    
    return newReview;
  }

  async createComparison(userId: string | null, productIds: number[], title?: string): Promise<Comparison> {
    const [comparison] = await db.insert(comparisons).values({
      userId,
      title: title || "Product Comparison"
    }).returning();

    if (productIds.length > 0) {
      await db.insert(comparisonProducts).values(
        productIds.map(pid => ({
          comparisonId: comparison.id,
          productId: pid
        }))
      );
    }

    return comparison;
  }

  async getComparison(id: number): Promise<(Comparison & { products: Product[] }) | undefined> {
    const [comparison] = await db.select().from(comparisons).where(eq(comparisons.id, id));
    if (!comparison) return undefined;

    const linkedProducts = await db
      .select({
        product: products
      })
      .from(comparisonProducts)
      .innerJoin(products, eq(comparisonProducts.productId, products.id))
      .where(eq(comparisonProducts.comparisonId, id));

    return {
      ...comparison,
      products: linkedProducts.map(lp => lp.product)
    };
  }
}

export const storage = new DatabaseStorage();
