import { type Champion, type DraftSession, type InsertDraftSession } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export interface IStorage {
  getChampions(): Promise<Champion[]>;
  getDraftSession(id: string): Promise<DraftSession | undefined>;
  createDraftSession(session: InsertDraftSession): Promise<DraftSession>;
  updateDraftSession(id: string, updates: Partial<DraftSession>): Promise<DraftSession | undefined>;
  startDraft(id: string): Promise<DraftSession | undefined>;
  banChampion(id: string, championId: string): Promise<DraftSession | undefined>;
  pickChampion(id: string, championId: string): Promise<DraftSession | undefined>;
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
      phase: session.phase || "waiting",
      currentTeam: session.currentTeam || "blue",
      timer: session.timer || "30",
      phaseStep: session.phaseStep || "0",
      blueTeamPicks: session.blueTeamPicks || [],
      redTeamPicks: session.redTeamPicks || [],
      blueTeamBans: session.blueTeamBans || [],
      redTeamBans: session.redTeamBans || [],
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

  async startDraft(id: string): Promise<DraftSession | undefined> {
    const session = this.draftSessions.get(id);
    if (!session) return undefined;

    const updatedSession = { 
      ...session, 
      phase: "ban1",
      phaseStep: "0",
      currentTeam: "blue",
      timer: "30"
    };
    this.draftSessions.set(id, updatedSession);
    return updatedSession;
  }

  async banChampion(id: string, championId: string): Promise<DraftSession | undefined> {
    const session = this.draftSessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session };
    const step = parseInt(updatedSession.phaseStep);

    // Add ban to appropriate team
    if (updatedSession.currentTeam === "blue") {
      updatedSession.blueTeamBans = [...updatedSession.blueTeamBans, championId];
    } else {
      updatedSession.redTeamBans = [...updatedSession.redTeamBans, championId];
    }

    // Progress through ban phases
    if (updatedSession.phase === "ban1") {
      if (step < 5) { // 0-5 = 6 bans total
        const nextStep = this.getNextBanPhase1(step, updatedSession);
        updatedSession.currentTeam = nextStep.team;
        updatedSession.phaseStep = nextStep.step.toString();
      } else {
        // Move to pick1 phase
        updatedSession.phase = "pick1";
        updatedSession.phaseStep = "0";
        updatedSession.currentTeam = "blue";
      }
    } else if (updatedSession.phase === "ban2") {
      if (step < 3) { // 0-3 = 4 bans total
        const nextStep = this.getNextBanPhase2(step, updatedSession);
        updatedSession.currentTeam = nextStep.team;
        updatedSession.phaseStep = nextStep.step.toString();
      } else {
        // Move to pick2 phase
        updatedSession.phase = "pick2";
        updatedSession.phaseStep = "0";
        updatedSession.currentTeam = "red";
      }
    }

    this.draftSessions.set(id, updatedSession);
    return updatedSession;
  }

  async pickChampion(id: string, championId: string): Promise<DraftSession | undefined> {
    const session = this.draftSessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session };
    const step = parseInt(updatedSession.phaseStep);

    // Add pick to appropriate team
    if (updatedSession.currentTeam === "blue") {
      updatedSession.blueTeamPicks = [...updatedSession.blueTeamPicks, championId];
    } else {
      updatedSession.redTeamPicks = [...updatedSession.redTeamPicks, championId];
    }

    // Progress through pick phases
    if (updatedSession.phase === "pick1") {
      if (step < 5) { // 0-5 = 6 picks total
        const nextStep = this.getNextPickPhase1(step, updatedSession);
        updatedSession.currentTeam = nextStep.team;
        updatedSession.phaseStep = nextStep.step.toString();
      } else {
        // Move to ban2 phase
        updatedSession.phase = "ban2";
        updatedSession.phaseStep = "0";
        updatedSession.currentTeam = "red";
      }
    } else if (updatedSession.phase === "pick2") {
      if (step < 3) { // 0-3 = 4 picks total
        const nextStep = this.getNextPickPhase2(step, updatedSession);
        updatedSession.currentTeam = nextStep.team;
        updatedSession.phaseStep = nextStep.step.toString();
      } else {
        // Draft completed
        updatedSession.phase = "completed";
      }
    }

    this.draftSessions.set(id, updatedSession);
    return updatedSession;
  }

  private getNextBanPhase1(step: number, session: DraftSession) {
    // Ban Phase 1: Blue-Red-Blue-Red-Blue-Red (6 bans total, 3 each)
    const sequence = ["blue", "red", "blue", "red", "blue", "red"];
    const nextStep = step + 1;
    
    if (nextStep >= sequence.length) {
      return { team: "blue" as "blue" | "red", step: nextStep, completed: true };
    }
    
    return {
      team: sequence[nextStep] as "blue" | "red",
      step: nextStep,
      completed: false
    };
  }

  private getNextPickPhase1(step: number, session: DraftSession) {
    // Pick Phase 1: Blue-Red-Red-Blue-Blue-Red (6 picks total)
    const sequence = ["blue", "red", "red", "blue", "blue", "red"];
    const nextStep = step + 1;
    
    if (nextStep >= sequence.length) {
      return { team: "blue" as "blue" | "red", step: nextStep, completed: true };
    }
    
    return {
      team: sequence[nextStep] as "blue" | "red",
      step: nextStep,
      completed: false
    };
  }

  private getNextBanPhase2(step: number, session: DraftSession) {
    // Ban Phase 2: Red-Blue-Red-Blue (4 bans total, 2 each) 
    const sequence = ["red", "blue", "red", "blue"];
    const nextStep = step + 1;
    
    if (nextStep >= sequence.length) {
      return { team: "red" as "blue" | "red", step: nextStep, completed: true };
    }
    
    return {
      team: sequence[nextStep] as "blue" | "red",
      step: nextStep,
      completed: false
    };
  }

  private getNextPickPhase2(step: number, session: DraftSession) {
    // Pick Phase 2: Red-Blue-Blue-Red (4 picks total)
    const sequence = ["red", "blue", "blue", "red"];
    const nextStep = step + 1;
    
    if (nextStep >= sequence.length) {
      return { team: "red" as "blue" | "red", step: nextStep, completed: true };
    }
    
    return {
      team: sequence[nextStep] as "blue" | "red",
      step: nextStep,
      completed: false
    };
  }
}

export const storage = new MemStorage();
