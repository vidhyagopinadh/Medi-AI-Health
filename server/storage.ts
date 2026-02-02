import { 
  products, categories, reviews, comparisons, comparisonProducts,
  type Product, type Category, type Review, type Comparison,
  type CreateProductRequest, type CreateReviewRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, desc, and, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(filters?: { search?: string; categoryId?: number; isAiCapable?: boolean; sort?: string }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: CreateProductRequest): Promise<Product>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  
  // Reviews
  getReviewsByProduct(productId: number): Promise<Review[]>;
  createReview(review: CreateReviewRequest & { productId: number; userId: string }): Promise<Review>;
  
  // Comparisons
  createComparison(userId: string | null, productIds: number[], title?: string): Promise<Comparison>;
  getComparison(id: number): Promise<(Comparison & { products: Product[] }) | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(filters?: { search?: string; categoryId?: number; isAiCapable?: boolean; sort?: string }): Promise<Product[]> {
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

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
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

  async getReviewsByProduct(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId));
  }

  async createReview(review: CreateReviewRequest & { productId: number; userId: string }): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update product stats (simple increment for now)
    // Ideally use aggregation, but this is MVP
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
