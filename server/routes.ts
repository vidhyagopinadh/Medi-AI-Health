import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Setup Chat
  registerChatRoutes(app);

  // === Products ===
  app.get(api.products.list.path, async (req, res) => {
    const filters = {
      search: req.query.search as string,
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      isAiCapable: req.query.isAiCapable === "true" ? true : (req.query.isAiCapable === "false" ? false : undefined),
      sort: req.query.sort as string,
    };
    const products = await storage.getProducts(filters);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === Categories ===
  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // === Reviews ===
  app.get(api.reviews.list.path, async (req, res) => {
    const reviews = await storage.getReviewsByProduct(Number(req.params.id));
    res.json(reviews);
  });

  app.post(api.reviews.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const input = api.reviews.create.input.parse(req.body);
      // @ts-ignore
      const userId = req.user!.claims.sub; // Replit Auth user ID
      const review = await storage.createReview({
        ...input,
        productId: Number(req.params.id),
        userId,
      });
      res.status(201).json(review);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === Comparisons ===
  app.post(api.comparisons.create.path, async (req, res) => {
    try {
      const { productIds, title } = req.body;
      // @ts-ignore
      const userId = req.isAuthenticated() ? req.user!.claims.sub : null;
      const comparison = await storage.createComparison(userId, productIds, title);
      res.status(201).json(comparison);
    } catch (err) {
      res.status(500).json({ message: "Failed to create comparison" });
    }
  });

  app.get(api.comparisons.get.path, async (req, res) => {
    const comparison = await storage.getComparison(Number(req.params.id));
    if (!comparison) {
      return res.status(404).json({ message: "Comparison not found" });
    }
    res.json(comparison);
  });

  // Seed data on startup
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  try {
    const existingCategories = await storage.getCategories();
    if (existingCategories.length === 0) {
      const cats = [
        { name: "Radiology AI", slug: "radiology-ai", description: "AI tools for medical imaging analysis" },
        { name: "Clinical Decision Support", slug: "cds", description: "Tools to assist clinical decision making" },
        { name: "Revenue Cycle Management", slug: "rcm", description: "AI for billing and coding" },
        { name: "Patient Engagement", slug: "patient-engagement", description: "Chatbots and patient portals" },
      ];
      
      // Insert categories
      const { db } = await import("./db");
      const { categories, products } = await import("@shared/schema");
      
      console.log("Seeding categories...");
      const insertedCatsResult = await db.insert(categories).values(cats).returning();
      console.log("Seeded categories:", insertedCatsResult.length);
      
      // Insert Products
      console.log("Seeding products...");
      await db.insert(products).values([
        {
          name: "RadAI Pro",
          slug: "radai-pro",
          description: "Advanced AI for radiology reporting and analysis.",
          shortDescription: "Automated radiology reports.",
          categoryId: insertedCatsResult[0].id,
          pricingTier: "Enterprise",
          integrationType: "HL7/FHIR",
          deploymentType: "Cloud",
          isAiCapable: true,
          aiCapabilities: ["Computer Vision", "NLP"],
          rating: 4,
          reviewCount: 12
        },
        {
          name: "MediCode AI",
          slug: "medicode-ai",
          description: "Automated medical coding using deep learning.",
          shortDescription: "AI for medical coding.",
          categoryId: insertedCatsResult[2].id,
          pricingTier: "Paid",
          integrationType: "API",
          deploymentType: "Hybrid",
          isAiCapable: true,
          aiCapabilities: ["NLP"],
          rating: 5,
          reviewCount: 8
        },
        {
          name: "PatientConnect",
          slug: "patient-connect",
          description: "AI-driven patient engagement platform.",
          shortDescription: "Engage patients automatically.",
          categoryId: insertedCatsResult[3].id,
          pricingTier: "Freemium",
          integrationType: "Native",
          deploymentType: "Cloud",
          isAiCapable: true,
          aiCapabilities: ["Chatbot"],
          rating: 3,
          reviewCount: 25
        }
      ]);
      console.log("Seeding complete.");
    } else {
        console.log("Database already seeded.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
