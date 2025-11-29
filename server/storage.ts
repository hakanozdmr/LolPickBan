import { type Champion, type DraftSession, type InsertDraftSession, type Tournament, type Team, type Match, type InsertTournament, type InsertTeam, type InsertMatch, type AdminUser, type PlayerAccessCode, type InsertAdminUser, type InsertPlayerAccessCode, type TournamentTeamCode, type InsertTournamentTeamCode, type ModeratorUser, type InsertModeratorUser, champions, draftSessions, tournaments, teams, matches, adminUsers, moderatorUsers, playerAccessCodes, tournamentTeamCodes } from "@shared/schema";
import { randomUUID, createHash } from "crypto";
import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import fs from "fs";
import path from "path";

export interface IStorage {
  getChampions(): Promise<Champion[]>;
  
  getDraftSession(id: string): Promise<DraftSession | undefined>;
  getDraftSessionByMatchId(matchId: string): Promise<DraftSession | undefined>;
  getDraftSessionByTournamentId(tournamentId: string): Promise<DraftSession | undefined>;
  createDraftSession(session: InsertDraftSession): Promise<DraftSession>;
  updateDraftSession(id: string, updates: Partial<DraftSession>): Promise<DraftSession | undefined>;
  startDraft(id: string): Promise<DraftSession | undefined>;
  banChampion(id: string, championId: string): Promise<DraftSession | undefined>;
  pickChampion(id: string, championId: string): Promise<DraftSession | undefined>;
  
  getTournaments(): Promise<Tournament[]>;
  getTournament(id: string): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined>;
  deleteTournament(id: string): Promise<boolean>;
  
  getTeams(tournamentId: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;
  
  getMatches(tournamentId: string): Promise<Match[]>;
  getMatch(id: string): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined>;
  deleteMatch(id: string): Promise<boolean>;
  
  verifyAdminCredentials(username: string, password: string): Promise<AdminUser | null>;
  createAdminSession(adminId: string): Promise<string>;
  validateAdminSession(token: string): Promise<AdminUser | null>;
  invalidateAdminSession(token: string): Promise<boolean>;
  
  createModerator(username: string, password: string, adminId?: string): Promise<ModeratorUser>;
  getModerators(): Promise<ModeratorUser[]>;
  verifyModeratorCredentials(username: string, password: string): Promise<ModeratorUser | null>;
  createModeratorSession(moderatorId: string): Promise<string>;
  validateModeratorSession(token: string): Promise<ModeratorUser | null>;
  invalidateModeratorSession(token: string): Promise<boolean>;
  
  createAccessCode(adminId: string): Promise<PlayerAccessCode>;
  getAccessCodes(): Promise<PlayerAccessCode[]>;
  validateAccessCode(code: string): Promise<PlayerAccessCode | null>;
  markAccessCodeUsed(id: string): Promise<boolean>;
  
  createTournamentTeamCodes(tournamentId: string, blueTeamName?: string, redTeamName?: string): Promise<{ blueCode: TournamentTeamCode, redCode: TournamentTeamCode }>;
  getTournamentTeamCodes(tournamentId: string): Promise<TournamentTeamCode[]>;
  validateTeamCode(code: string): Promise<TournamentTeamCode | null>;
  markTeamReady(id: string): Promise<TournamentTeamCode | null>;
  checkBothTeamsReady(tournamentId: string): Promise<boolean>;
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class DatabaseStorage implements IStorage {
  private championsCache: Champion[] = [];
  private adminSessions: Map<string, string> = new Map();
  private moderatorSessions: Map<string, string> = new Map();
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.loadChampions();
    this.initPromise = this.seedAdminUser();
  }

  async ensureInitialized(): Promise<void> {
    if (!this.initialized && this.initPromise) {
      await this.initPromise;
      this.initialized = true;
    }
  }

  private async seedAdminUser(): Promise<void> {
    try {
      const existingAdmin = await db.select().from(adminUsers).where(eq(adminUsers.username, "admin"));
      if (existingAdmin.length === 0) {
        const adminId = randomUUID();
        await db.insert(adminUsers).values({
          id: adminId,
          username: "admin",
          passwordHash: hashPassword("admin123"),
        });
        console.log("Default admin user seeded");
      }
    } catch (error) {
      console.error("Failed to seed admin user:", error);
    }
  }

  private loadChampions() {
    try {
      const championsPath = path.join(process.cwd(), "server", "data", "champions.json");
      const championsData = fs.readFileSync(championsPath, "utf-8");
      this.championsCache = JSON.parse(championsData);
    } catch (error) {
      console.error("Failed to load champions data:", error);
      this.championsCache = [];
    }
  }

  async getChampions(): Promise<Champion[]> {
    return this.championsCache;
  }

  async getDraftSession(id: string): Promise<DraftSession | undefined> {
    const result = await db.select().from(draftSessions).where(eq(draftSessions.id, id));
    return result[0];
  }

  async getDraftSessionByMatchId(matchId: string): Promise<DraftSession | undefined> {
    const result = await db.select().from(draftSessions).where(eq(draftSessions.matchId, matchId));
    return result[0];
  }

  async getDraftSessionByTournamentId(tournamentId: string): Promise<DraftSession | undefined> {
    const result = await db.select().from(draftSessions).where(eq(draftSessions.tournamentId, tournamentId));
    return result[0];
  }

  async createDraftSession(session: InsertDraftSession): Promise<DraftSession> {
    const id = randomUUID();
    const newSession: DraftSession = {
      id,
      phase: session.phase || "waiting",
      currentTeam: session.currentTeam || "blue",
      timer: session.timer || "30",
      phaseStep: session.phaseStep || "0",
      blueTeamPicks: (session.blueTeamPicks || []) as string[],
      redTeamPicks: (session.redTeamPicks || []) as string[],
      blueTeamBans: (session.blueTeamBans || []) as string[],
      redTeamBans: (session.redTeamBans || []) as string[],
      tournamentId: session.tournamentId || null,
      matchId: session.matchId || null,
      tournamentName: session.tournamentName || null,
      blueTeamName: session.blueTeamName || null,
      redTeamName: session.redTeamName || null,
    };
    await db.insert(draftSessions).values(newSession);
    return newSession;
  }

  async updateDraftSession(id: string, updates: Partial<DraftSession>): Promise<DraftSession | undefined> {
    const result = await db.update(draftSessions)
      .set(updates)
      .where(eq(draftSessions.id, id))
      .returning();
    return result[0];
  }

  async startDraft(id: string): Promise<DraftSession | undefined> {
    return this.updateDraftSession(id, {
      phase: "ban1",
      phaseStep: "0",
      currentTeam: "blue",
      timer: "30"
    });
  }

  async banChampion(id: string, championId: string): Promise<DraftSession | undefined> {
    const session = await this.getDraftSession(id);
    if (!session) return undefined;

    const step = parseInt(session.phaseStep);
    let updates: Partial<DraftSession> = {};

    if (session.currentTeam === "blue") {
      updates.blueTeamBans = [...session.blueTeamBans, championId];
    } else {
      updates.redTeamBans = [...session.redTeamBans, championId];
    }

    if (session.phase === "ban1") {
      if (step < 5) {
        const nextStep = this.getNextBanPhase1(step);
        updates.currentTeam = nextStep.team;
        updates.phaseStep = nextStep.step.toString();
      } else {
        updates.phase = "pick1";
        updates.phaseStep = "0";
        updates.currentTeam = "blue";
      }
    } else if (session.phase === "ban2") {
      if (step < 3) {
        const nextStep = this.getNextBanPhase2(step);
        updates.currentTeam = nextStep.team;
        updates.phaseStep = nextStep.step.toString();
      } else {
        updates.phase = "pick2";
        updates.phaseStep = "0";
        updates.currentTeam = "red";
      }
    }

    return this.updateDraftSession(id, updates);
  }

  async pickChampion(id: string, championId: string): Promise<DraftSession | undefined> {
    const session = await this.getDraftSession(id);
    if (!session) return undefined;

    const step = parseInt(session.phaseStep);
    let updates: Partial<DraftSession> = {};

    if (session.currentTeam === "blue") {
      updates.blueTeamPicks = [...session.blueTeamPicks, championId];
    } else {
      updates.redTeamPicks = [...session.redTeamPicks, championId];
    }

    if (session.phase === "pick1") {
      if (step < 5) {
        const nextStep = this.getNextPickPhase1(step);
        updates.currentTeam = nextStep.team;
        updates.phaseStep = nextStep.step.toString();
      } else {
        updates.phase = "ban2";
        updates.phaseStep = "0";
        updates.currentTeam = "red";
      }
    } else if (session.phase === "pick2") {
      if (step < 3) {
        const nextStep = this.getNextPickPhase2(step);
        updates.currentTeam = nextStep.team;
        updates.phaseStep = nextStep.step.toString();
      } else {
        updates.phase = "completed";
      }
    }

    return this.updateDraftSession(id, updates);
  }

  private getNextBanPhase1(step: number) {
    const sequence = ["blue", "red", "blue", "red", "blue", "red"];
    const nextStep = step + 1;
    return {
      team: sequence[nextStep] as "blue" | "red",
      step: nextStep,
    };
  }

  private getNextPickPhase1(step: number) {
    const sequence = ["blue", "red", "red", "blue", "blue", "red"];
    const nextStep = step + 1;
    return {
      team: sequence[nextStep] as "blue" | "red",
      step: nextStep,
    };
  }

  private getNextBanPhase2(step: number) {
    const sequence = ["red", "blue", "red", "blue"];
    const nextStep = step + 1;
    return {
      team: sequence[nextStep] as "blue" | "red",
      step: nextStep,
    };
  }

  private getNextPickPhase2(step: number) {
    const sequence = ["red", "blue", "blue", "red"];
    const nextStep = step + 1;
    return {
      team: sequence[nextStep] as "blue" | "red",
      step: nextStep,
    };
  }

  async getTournaments(): Promise<Tournament[]> {
    return db.select().from(tournaments).orderBy(desc(tournaments.createdAt));
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    const result = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return result[0];
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const id = randomUUID();
    const now = new Date();
    const newTournament = {
      id,
      name: tournament.name,
      description: tournament.description || null,
      format: tournament.format || "single_elimination",
      maxTeams: tournament.maxTeams || 8,
      status: tournament.status || "setup",
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(tournaments).values(newTournament);
    return newTournament;
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined> {
    const result = await db.update(tournaments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tournaments.id, id))
      .returning();
    return result[0];
  }

  async deleteTournament(id: string): Promise<boolean> {
    const result = await db.delete(tournaments).where(eq(tournaments.id, id));
    return true;
  }

  async getTeams(tournamentId: string): Promise<Team[]> {
    return db.select().from(teams).where(eq(teams.tournamentId, tournamentId));
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const result = await db.select().from(teams).where(eq(teams.id, id));
    return result[0];
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const id = randomUUID();
    const newTeam = {
      id,
      name: team.name,
      logo: team.logo || null,
      tournamentId: team.tournamentId,
      createdAt: new Date(),
    };
    await db.insert(teams).values(newTeam);
    return newTeam;
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
    const result = await db.update(teams)
      .set(updates)
      .where(eq(teams.id, id))
      .returning();
    return result[0];
  }

  async deleteTeam(id: string): Promise<boolean> {
    await db.delete(teams).where(eq(teams.id, id));
    return true;
  }

  async getMatches(tournamentId: string): Promise<Match[]> {
    return db.select().from(matches).where(eq(matches.tournamentId, tournamentId));
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const result = await db.select().from(matches).where(eq(matches.id, id));
    return result[0];
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const newMatch = {
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
    await db.insert(matches).values(newMatch);
    return newMatch;
  }

  async updateMatch(id: string, updates: Partial<Match>): Promise<Match | undefined> {
    const result = await db.update(matches)
      .set(updates)
      .where(eq(matches.id, id))
      .returning();
    return result[0];
  }

  async deleteMatch(id: string): Promise<boolean> {
    await db.delete(matches).where(eq(matches.id, id));
    return true;
  }

  async verifyAdminCredentials(username: string, password: string): Promise<AdminUser | null> {
    await this.ensureInitialized();
    const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    const admin = result[0];
    if (!admin) return null;
    
    const passwordHash = hashPassword(password);
    if (admin.passwordHash !== passwordHash) return null;
    
    return admin;
  }

  async createAdminSession(adminId: string): Promise<string> {
    const token = randomUUID();
    this.adminSessions.set(token, adminId);
    return token;
  }

  async validateAdminSession(token: string): Promise<AdminUser | null> {
    const adminId = this.adminSessions.get(token);
    if (!adminId) return null;
    const result = await db.select().from(adminUsers).where(eq(adminUsers.id, adminId));
    return result[0] || null;
  }

  async invalidateAdminSession(token: string): Promise<boolean> {
    return this.adminSessions.delete(token);
  }

  async createModerator(username: string, password: string, adminId?: string): Promise<ModeratorUser> {
    const id = randomUUID();
    const moderator = {
      id,
      username,
      passwordHash: hashPassword(password),
      createdByAdminId: adminId || null,
      createdAt: new Date(),
    };
    await db.insert(moderatorUsers).values(moderator);
    return moderator;
  }

  async getModerators(): Promise<ModeratorUser[]> {
    return db.select().from(moderatorUsers).orderBy(desc(moderatorUsers.createdAt));
  }

  async verifyModeratorCredentials(username: string, password: string): Promise<ModeratorUser | null> {
    const result = await db.select().from(moderatorUsers).where(eq(moderatorUsers.username, username));
    const moderator = result[0];
    if (!moderator) return null;

    const passwordHash = hashPassword(password);
    if (moderator.passwordHash !== passwordHash) return null;

    return moderator;
  }

  async createModeratorSession(moderatorId: string): Promise<string> {
    const token = randomUUID();
    this.moderatorSessions.set(token, moderatorId);
    return token;
  }

  async validateModeratorSession(token: string): Promise<ModeratorUser | null> {
    const moderatorId = this.moderatorSessions.get(token);
    if (!moderatorId) return null;
    const result = await db.select().from(moderatorUsers).where(eq(moderatorUsers.id, moderatorId));
    return result[0] || null;
  }

  async invalidateModeratorSession(token: string): Promise<boolean> {
    return this.moderatorSessions.delete(token);
  }

  async createAccessCode(adminId: string): Promise<PlayerAccessCode> {
    const id = randomUUID();
    const code = generateAccessCode();
    const accessCode = {
      id,
      code,
      issuedByAdminId: adminId,
      issuedAt: new Date(),
      used: false,
      usedAt: null,
    };
    await db.insert(playerAccessCodes).values(accessCode);
    return accessCode;
  }

  async getAccessCodes(): Promise<PlayerAccessCode[]> {
    return db.select().from(playerAccessCodes).orderBy(desc(playerAccessCodes.issuedAt));
  }

  async validateAccessCode(code: string): Promise<PlayerAccessCode | null> {
    const result = await db.select().from(playerAccessCodes)
      .where(and(eq(playerAccessCodes.code, code), eq(playerAccessCodes.used, false)));
    return result[0] || null;
  }

  async markAccessCodeUsed(id: string): Promise<boolean> {
    await db.update(playerAccessCodes)
      .set({ used: true, usedAt: new Date() })
      .where(eq(playerAccessCodes.id, id));
    return true;
  }

  async createTournamentTeamCodes(tournamentId: string, blueTeamName?: string, redTeamName?: string): Promise<{ blueCode: TournamentTeamCode, redCode: TournamentTeamCode }> {
    await db.delete(tournamentTeamCodes).where(eq(tournamentTeamCodes.tournamentId, tournamentId));

    const blueId = randomUUID();
    const redId = randomUUID();
    const now = new Date();

    const blueCode = {
      id: blueId,
      tournamentId,
      teamColor: "blue",
      code: generateAccessCode(),
      teamName: blueTeamName || null,
      isReady: false,
      joinedAt: null,
      createdAt: now,
    };

    const redCode = {
      id: redId,
      tournamentId,
      teamColor: "red",
      code: generateAccessCode(),
      teamName: redTeamName || null,
      isReady: false,
      joinedAt: null,
      createdAt: now,
    };

    await db.insert(tournamentTeamCodes).values(blueCode);
    await db.insert(tournamentTeamCodes).values(redCode);

    return { blueCode, redCode };
  }

  async getTournamentTeamCodes(tournamentId: string): Promise<TournamentTeamCode[]> {
    return db.select().from(tournamentTeamCodes).where(eq(tournamentTeamCodes.tournamentId, tournamentId));
  }

  async validateTeamCode(code: string): Promise<TournamentTeamCode | null> {
    const result = await db.select().from(tournamentTeamCodes).where(eq(tournamentTeamCodes.code, code));
    return result[0] || null;
  }

  async markTeamReady(id: string): Promise<TournamentTeamCode | null> {
    const result = await db.update(tournamentTeamCodes)
      .set({ isReady: true, joinedAt: new Date() })
      .where(eq(tournamentTeamCodes.id, id))
      .returning();
    return result[0] || null;
  }

  async checkBothTeamsReady(tournamentId: string): Promise<boolean> {
    const codes = await this.getTournamentTeamCodes(tournamentId);
    if (codes.length < 2) return false;
    return codes.every(c => c.isReady);
  }
}

export const storage = new DatabaseStorage();
