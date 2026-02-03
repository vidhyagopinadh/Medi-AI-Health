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
  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);

  app.get(api.products.list.path, async (req, res) => {
    const filters = {
      search: req.query.search as string,
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      topicId: req.query.topicId ? Number(req.query.topicId) : undefined,
      isAiCapable: req.query.isAiCapable === "true" ? true : (req.query.isAiCapable === "false" ? false : undefined),
      sort: req.query.sort as any,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
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

  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get(api.topics.list.path, async (req, res) => {
    const filters = {
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
    };
    const topics = await storage.getTopics(filters);
    res.json(topics);
  });

  app.get(api.topics.get.path, async (req, res) => {
    const topic = await storage.getTopicBySlug(req.params.slug);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }
    res.json(topic);
  });

  app.get(api.stats.list.path, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.get(api.articles.list.path, async (req, res) => {
    const filters = {
      type: req.query.type as string,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const articles = await storage.getArticles(filters);
    res.json(articles);
  });

  app.get(api.events.list.path, async (req, res) => {
    const filters = {
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const events = await storage.getEvents(filters);
    res.json(events);
  });

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
      const userId = (req.user as any).claims.sub;
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

  app.post(api.comparisons.create.path, async (req, res) => {
    try {
      const { productIds, title } = req.body;
      const userId = req.isAuthenticated() ? (req.user as any).claims.sub : null;
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

  seedDatabase();
  return httpServer;
}

async function seedDatabase() {
  try {
    const { db } = await import("./db");
    const { categories, products, topics, productTopics, stats, articles, events } = await import("@shared/schema");
    
    const existingCategories = await storage.getCategories();
    if (existingCategories.length === 0) {
      console.log("Seeding advanced data...");
      
      const cats = [
        { name: "Interoperability", slug: "interoperability", description: "Seamless data exchange", icon: "Share2" },
        { name: "AI & Cybersecurity", slug: "ai-cybersecurity", description: "Secure intelligent systems", icon: "ShieldCheck" },
        { name: "Remote Patient Monitoring", slug: "rpm", description: "Continuous patient tracking", icon: "Activity" },
        { name: "Patient Experience", slug: "patient-experience", description: "Better care journeys", icon: "Heart" },
        { name: "Imaging Technology", slug: "imaging", description: "Advanced medical imaging", icon: "Camera" },
        { name: "Compliance", slug: "compliance", description: "HIPAA & Regulatory tools", icon: "FileCheck" },
      ];
      const insertedCats = await db.insert(categories).values(cats).returning();

      const topicList = [
        { name: "HL7 Integration", slug: "hl7", categoryId: insertedCats[0].id, offeringCount: 15 },
        { name: "Threat Detection", slug: "threat-detection", categoryId: insertedCats[1].id, offeringCount: 8 },
        { name: "Cardiac Monitoring", slug: "cardiac", categoryId: insertedCats[2].id, offeringCount: 12 },
      ];
      const insertedTopics = await db.insert(topics).values(topicList).returning();

      const productList = [
        {
          name: "RadAI Pro",
          slug: "radai-pro",
          vendorName: "RadTech Solutions",
          description: "Advanced AI for radiology reporting and analysis.",
          shortDescription: "Automated radiology reports.",
          categoryId: insertedCats[4].id,
          pricingTier: "Enterprise",
          integrationType: "HL7/FHIR",
          deploymentType: "Cloud",
          isAiCapable: true,
          aiCapabilities: ["Computer Vision", "NLP"],
          specifications: { technicalDetails: "Supports DICOM standards", licensing: "SaaS Subscription" },
          rating: 45,
          reviewCount: 12
        },
        {
          name: "MediCode AI",
          slug: "medicode-ai",
          vendorName: "SecureHealth",
          description: "Automated medical coding using deep learning.",
          shortDescription: "AI for medical coding.",
          categoryId: insertedCats[1].id,
          pricingTier: "Paid",
          integrationType: "API",
          deploymentType: "Hybrid",
          isAiCapable: true,
          aiCapabilities: ["NLP"],
          rating: 48,
          reviewCount: 8
        }
      ];
      const insertedProducts = await db.insert(products).values(productList).returning();

      await db.insert(productTopics).values([
        { productId: insertedProducts[0].id, topicId: insertedTopics[0].id },
        { productId: insertedProducts[1].id, topicId: insertedTopics[1].id },
      ]);

      await db.insert(stats).values([
        { key: "offerings", value: 4100, label: "Healthcare Offerings Catalogued" },
        { key: "topics", value: 1300, label: "Healthcare Innovation Topics" },
        { key: "members", value: 50000, label: "Active Community Members" },
        { key: "research", value: 1200, label: "Published Case Studies & Research" },
      ]);

      await db.insert(articles).values([
        {
          title: "Investing in the Future - Ensuring Positive ROI in Healthcare Innovations",
          slug: "roi-healthcare-innovations",
          content: "Comprehensive guide on ROI in healthtech...",
          excerpt: "Learn how to ensure positive ROI when implementing new healthcare technologies.",
          authorName: "Dr. Jane Smith",
          authorTitle: "Chief Innovation Officer",
          type: "news",
          categoryId: insertedCats[1].id
        },
        {
          title: "New AI Radiology Standards Released",
          slug: "ai-radiology-standards",
          content: "The latest standards for AI in radiology have been published...",
          excerpt: "New regulatory standards aim to improve AI safety in medical imaging.",
          type: "news",
          categoryId: insertedCats[4].id
        }
      ]);

      await db.insert(events).values([
        {
          title: "Global HealthTech Summit 2026",
          description: "The premier event for healthcare innovation.",
          location: "San Francisco, CA",
          startDate: new Date("2026-06-15"),
          isVirtual: false
        },
        {
          title: "AI in Medicine Webinar",
          description: "Monthly webinar series on clinical AI.",
          startDate: new Date("2026-03-10"),
          isVirtual: true
        }
      ]);

      console.log("Advanced seeding complete.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
