import { 
  type Champion, 
  type DraftSession, 
  type InsertDraftSession, 
  type Tournament, 
  type Team, 
  type Match, 
  type User,
  type UpsertUser,
  type InsertTournament, 
  type InsertTeam, 
  type InsertMatch,
  champions,
  draftSessions,
  tournaments,
  teams,
  matches,
  users,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Champions
  getChampions(): Promise<Champion[]>;
  
  // Draft Sessions
  getDraftSession(id: string): Promise<DraftSession | undefined>;
  getDraftSessionByMatchId(matchId: string): Promise<DraftSession | undefined>;
  createDraftSession(session: InsertDraftSession): Promise<DraftSession>;
  updateDraftSession(id: string, updates: Partial<DraftSession>): Promise<DraftSession | undefined>;
  startDraft(id: string): Promise<DraftSession | undefined>;
  banChampion(id: string, championId: string): Promise<DraftSession | undefined>;
  pickChampion(id: string, championId: string): Promise<DraftSession | undefined>;
  
  // Tournaments
  getTournaments(): Promise<Tournament[]>;
  getTournament(id: string): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined>;
  deleteTournament(id: string): Promise<boolean>;
  
  // Teams
  getTeams(tournamentId: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;
  
  // Matches
  getMatches(tournamentId: string): Promise<Match[]>;
  getMatch(id: string): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined>;
  deleteMatch(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private champions: Champion[] = [];
  private draftSessions: Map<string, DraftSession> = new Map();
  private tournaments: Map<string, Tournament> = new Map();
  private teams: Map<string, Team> = new Map();
  private matches: Map<string, Match> = new Map();
  private users: Map<string, User> = new Map();

  constructor() {
    this.loadChampions();
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      id: userData.id!,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      role: existingUser?.role || "user",
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id!, user);
    return user;
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

  async getDraftSessionByMatchId(matchId: string): Promise<DraftSession | undefined> {
    const sessions = Array.from(this.draftSessions.values());
    return sessions.find(session => session.matchId === matchId);
  }

  async createDraftSession(session: InsertDraftSession): Promise<DraftSession> {
    const id = randomUUID();
    const blueTeamCode = randomUUID().substring(0, 8).toUpperCase();
    const redTeamCode = randomUUID().substring(0, 8).toUpperCase();
    
    const newSession: DraftSession = {
      id,
      phase: session.phase || "waiting",
      currentTeam: session.currentTeam || "blue",
      timer: session.timer || "30",
      phaseStep: session.phaseStep || "0",
      blueTeamPicks: Array.isArray(session.blueTeamPicks) ? [...session.blueTeamPicks] : [],
      redTeamPicks: Array.isArray(session.redTeamPicks) ? [...session.redTeamPicks] : [],
      blueTeamBans: Array.isArray(session.blueTeamBans) ? [...session.blueTeamBans] : [],
      redTeamBans: Array.isArray(session.redTeamBans) ? [...session.redTeamBans] : [],
      tournamentId: session.tournamentId || null,
      matchId: session.matchId || null,
      tournamentName: session.tournamentName || null,
      blueTeamName: session.blueTeamName || null,
      redTeamName: session.redTeamName || null,
      blueTeamCode,
      redTeamCode,
      blueTeamJoined: false,
      redTeamJoined: false,
      createdBy: session.createdBy || null,
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

  // Tournament methods
  async getTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values());
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const id = randomUUID();
    const now = new Date();
    const newTournament: Tournament = {
      id,
      name: tournament.name,
      description: tournament.description || null,
      format: tournament.format || "single_elimination",
      maxTeams: tournament.maxTeams || 8,
      status: tournament.status || "setup",
      createdBy: tournament.createdBy || null,
      createdAt: now,
      updatedAt: now,
    };
    this.tournaments.set(id, newTournament);
    return newTournament;
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined> {
    const tournament = this.tournaments.get(id);
    if (!tournament) return undefined;

    const updatedTournament = { 
      ...tournament, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.tournaments.set(id, updatedTournament);
    return updatedTournament;
  }

  async deleteTournament(id: string): Promise<boolean> {
    return this.tournaments.delete(id);
  }

  // Team methods
  async getTeams(tournamentId: string): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(team => team.tournamentId === tournamentId);
  }

  async getTeam(id: string): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const id = randomUUID();
    const newTeam: Team = {
      id,
      name: team.name,
      logo: team.logo || null,
      tournamentId: team.tournamentId,
      createdAt: new Date(),
    };
    this.teams.set(id, newTeam);
    return newTeam;
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
    const team = this.teams.get(id);
    if (!team) return undefined;

    const updatedTeam = { ...team, ...updates };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  async deleteTeam(id: string): Promise<boolean> {
    return this.teams.delete(id);
  }

  // Match methods
  async getMatches(tournamentId: string): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(match => match.tournamentId === tournamentId);
  }

  async getMatch(id: string): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const newMatch: Match = {
      id,
      tournamentId: match.tournamentId,
      team1Id: match.team1Id || null,
      team2Id: match.team2Id || null,
      winnerId: match.winnerId || null,
      round: match.round,
      position: match.position,
      status: match.status || "pending",
      scheduledAt: match.scheduledAt || null,
      completedAt: match.completedAt || null,
      createdAt: new Date(),
    };
    this.matches.set(id, newMatch);
    return newMatch;
  }

  async updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;

    const updatedMatch = { ...match, ...updates };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  async deleteMatch(id: string): Promise<boolean> {
    return this.matches.delete(id);
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    // Load champions data into database if empty
    try {
      const championCount = await db.$count(champions);
      if (championCount === 0) {
        const championsPath = path.join(process.cwd(), "server", "data", "champions.json");
        const championsData = fs.readFileSync(championsPath, "utf-8");
        const championsList = JSON.parse(championsData);
        
        if (championsList.length > 0) {
          await db.insert(champions).values(championsList);
          console.log(`Loaded ${championsList.length} champions into database`);
        }
      }
    } catch (error) {
      console.error("Failed to initialize champions data:", error);
    }
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getChampions(): Promise<Champion[]> {
    return await db.select().from(champions);
  }

  async getDraftSession(id: string): Promise<DraftSession | undefined> {
    const [session] = await db.select().from(draftSessions).where(eq(draftSessions.id, id));
    return session;
  }

  async getDraftSessionByMatchId(matchId: string): Promise<DraftSession | undefined> {
    const [session] = await db.select().from(draftSessions).where(eq(draftSessions.matchId, matchId));
    return session;
  }

  async createDraftSession(session: InsertDraftSession): Promise<DraftSession> {
    // Generate team codes for draft session
    const blueTeamCode = randomUUID().substring(0, 8).toUpperCase();
    const redTeamCode = randomUUID().substring(0, 8).toUpperCase();
    
    const sessionData = {
      ...session,
      blueTeamCode,
      redTeamCode,
      blueTeamJoined: false,
      redTeamJoined: false,
    };
    
    const [newSession] = await db
      .insert(draftSessions)
      .values(sessionData)
      .returning();
    return newSession;
  }

  async updateDraftSession(id: string, updates: Partial<DraftSession>): Promise<DraftSession | undefined> {
    const [updated] = await db
      .update(draftSessions)
      .set(updates)
      .where(eq(draftSessions.id, id))
      .returning();
    return updated;
  }

  async startDraft(id: string): Promise<DraftSession | undefined> {
    return this.updateDraftSession(id, { phase: "ban_phase_1" });
  }

  async banChampion(id: string, championId: string): Promise<DraftSession | undefined> {
    const session = await this.getDraftSession(id);
    if (!session) return undefined;

    let updates: Partial<DraftSession> = {};

    if (session.currentTeam === "blue") {
      const newBans = [...session.blueTeamBans, championId];
      updates.blueTeamBans = newBans;
    } else {
      const newBans = [...session.redTeamBans, championId];
      updates.redTeamBans = newBans;
    }

    // Update phase and team logic here
    updates.currentTeam = session.currentTeam === "blue" ? "red" : "blue";

    return this.updateDraftSession(id, updates);
  }

  async pickChampion(id: string, championId: string): Promise<DraftSession | undefined> {
    const session = await this.getDraftSession(id);
    if (!session) return undefined;

    let updates: Partial<DraftSession> = {};

    if (session.currentTeam === "blue") {
      const newPicks = [...session.blueTeamPicks, championId];
      updates.blueTeamPicks = newPicks;
    } else {
      const newPicks = [...session.redTeamPicks, championId];
      updates.redTeamPicks = newPicks;
    }

    // Check if draft is complete
    const totalPicks = session.blueTeamPicks.length + session.redTeamPicks.length + 1;
    if (totalPicks >= 10) {
      updates.phase = "completed";
    } else {
      updates.currentTeam = session.currentTeam === "blue" ? "red" : "blue";
    }

    return this.updateDraftSession(id, updates);
  }

  async getTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments);
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament;
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const [newTournament] = await db.insert(tournaments).values(tournament).returning();
    return newTournament;
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined> {
    const [updated] = await db
      .update(tournaments)
      .set({...updates, updatedAt: new Date()})
      .where(eq(tournaments.id, id))
      .returning();
    return updated;
  }

  async deleteTournament(id: string): Promise<boolean> {
    const result = await db.delete(tournaments).where(eq(tournaments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getTeams(tournamentId: string): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.tournamentId, tournamentId));
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
    const [updated] = await db
      .update(teams)
      .set(updates)
      .where(eq(teams.id, id))
      .returning();
    return updated;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const result = await db.delete(teams).where(eq(teams.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getMatches(tournamentId: string): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.tournamentId, tournamentId));
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db.insert(matches).values(match).returning();
    return newMatch;
  }

  async updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined> {
    const [updated] = await db
      .update(matches)
      .set(updates)
      .where(eq(matches.id, id))
      .returning();
    return updated;
  }

  async deleteMatch(id: string): Promise<boolean> {
    const result = await db.delete(matches).where(eq(matches.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
