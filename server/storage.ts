import { type Champion, type DraftSession, type InsertDraftSession } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export interface IStorage {
  getChampions(): Promise<Champion[]>;
  getDraftSession(id: string): Promise<DraftSession | undefined>;
  createDraftSession(session: InsertDraftSession): Promise<DraftSession>;
  updateDraftSession(id: string, updates: Partial<DraftSession>): Promise<DraftSession | undefined>;
}

export class MemStorage implements IStorage {
  private champions: Champion[] = [];
  private draftSessions: Map<string, DraftSession> = new Map();

  constructor() {
    this.loadChampions();
  }

  private loadChampions() {
    try {
      const championsPath = path.join(process.cwd(), "server", "data", "champions.json");
      const championsData = fs.readFileSync(championsPath, "utf-8");
      this.champions = JSON.parse(championsData);
    } catch (error) {
      console.error("Failed to load champions data:", error);
      this.champions = [];
    }
  }

  async getChampions(): Promise<Champion[]> {
    return this.champions;
  }

  async getDraftSession(id: string): Promise<DraftSession | undefined> {
    return this.draftSessions.get(id);
  }

  async createDraftSession(session: InsertDraftSession): Promise<DraftSession> {
    const id = randomUUID();
    const newSession: DraftSession = {
      id,
      ...session,
    };
    this.draftSessions.set(id, newSession);
    return newSession;
  }

  async updateDraftSession(id: string, updates: Partial<DraftSession>): Promise<DraftSession | undefined> {
    const session = this.draftSessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updates };
    this.draftSessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
