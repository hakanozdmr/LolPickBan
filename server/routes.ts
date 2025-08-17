import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDraftSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all champions
  app.get("/api/champions", async (req, res) => {
    try {
      const champions = await storage.getChampions();
      res.json(champions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch champions" });
    }
  });

  // Create new draft session
  app.post("/api/draft-sessions", async (req, res) => {
    try {
      const validatedData = insertDraftSessionSchema.parse(req.body);
      const session = await storage.createDraftSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create draft session" });
      }
    }
  });

  // Get draft session by ID
  app.get("/api/draft-sessions/:id", async (req, res) => {
    try {
      const session = await storage.getDraftSession(req.params.id);
      if (!session) {
        res.status(404).json({ message: "Draft session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch draft session" });
    }
  });

  // Update draft session
  app.patch("/api/draft-sessions/:id", async (req, res) => {
    try {
      const updates = req.body;
      const session = await storage.updateDraftSession(req.params.id, updates);
      if (!session) {
        res.status(404).json({ message: "Draft session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to update draft session" });
    }
  });

  // Start draft session
  app.post("/api/draft-sessions/:id/start", async (req, res) => {
    try {
      const session = await storage.startDraft(req.params.id);
      if (!session) {
        res.status(404).json({ message: "Draft session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to start draft session" });
    }
  });

  // Ban champion
  app.post("/api/draft-sessions/:id/ban", async (req, res) => {
    try {
      const { championId } = req.body;
      if (!championId) {
        res.status(400).json({ message: "Champion ID is required" });
        return;
      }
      const session = await storage.banChampion(req.params.id, championId);
      if (!session) {
        res.status(404).json({ message: "Draft session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to ban champion" });
    }
  });

  // Pick champion
  app.post("/api/draft-sessions/:id/pick", async (req, res) => {
    try {
      const { championId } = req.body;
      if (!championId) {
        res.status(400).json({ message: "Champion ID is required" });
        return;
      }
      const session = await storage.pickChampion(req.params.id, championId);
      if (!session) {
        res.status(404).json({ message: "Draft session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to pick champion" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
