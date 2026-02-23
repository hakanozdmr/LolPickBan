import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const champions = pgTable("champions", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  roles: jsonb("roles").$type<string[]>().notNull(),
  classes: jsonb("classes").$type<string[]>().notNull(),
  image: text("image").notNull(),
});

export const draftSessions = pgTable("draft_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phase: text("phase").notNull().default("waiting"),
  currentTeam: text("current_team").notNull().default("blue"),
  timer: varchar("timer").notNull().default("30"),
  phaseStep: varchar("phase_step").notNull().default("0"),
  blueTeamPicks: jsonb("blue_team_picks").$type<string[]>().notNull().default([]),
  redTeamPicks: jsonb("red_team_picks").$type<string[]>().notNull().default([]),
  blueTeamBans: jsonb("blue_team_bans").$type<string[]>().notNull().default([]),
  redTeamBans: jsonb("red_team_bans").$type<string[]>().notNull().default([]),
  tournamentId: varchar("tournament_id"),
  matchId: varchar("match_id"),
  gameNumber: integer("game_number").notNull().default(1),
  fearlessBannedChampions: jsonb("fearless_banned_champions").$type<string[]>().notNull().default([]),
  tournamentName: text("tournament_name"),
  blueTeamName: text("blue_team_name"),
  redTeamName: text("red_team_name"),
});

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  format: text("format").notNull().default("single_elimination"), // single_elimination, double_elimination, round_robin
  maxTeams: integer("max_teams").notNull().default(8),
  status: text("status").notNull().default("setup"), // setup, in_progress, completed
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  logo: text("logo"),
  tournamentId: varchar("tournament_id").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  team1Id: varchar("team1_id"),
  team2Id: varchar("team2_id"),
  winnerId: varchar("winner_id"),
  round: integer("round").notNull(),
  position: integer("position").notNull(),
  status: text("status").notNull().default("pending"),
  seriesFormat: text("series_format").notNull().default("bo1"),
  fearlessMode: boolean("fearless_mode").notNull().default(false),
  team1Wins: integer("team1_wins").notNull().default(0),
  team2Wins: integer("team2_wins").notNull().default(0),
  currentGame: integer("current_game").notNull().default(1),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const moderatorUsers = pgTable("moderator_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdByAdminId: varchar("created_by_admin_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const playerAccessCodes = pgTable("player_access_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  issuedByAdminId: varchar("issued_by_admin_id"),
  issuedAt: timestamp("issued_at").notNull().default(sql`now()`),
  used: boolean("used").notNull().default(false),
  usedAt: timestamp("used_at"),
});

export const tournamentTeamCodes = pgTable("tournament_team_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  teamColor: text("team_color").notNull(), // "blue" or "red"
  code: text("code").notNull().unique(),
  teamName: text("team_name"),
  isReady: boolean("is_ready").notNull().default(false),
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertChampionSchema = createInsertSchema(champions);
export const insertDraftSessionSchema = createInsertSchema(draftSessions).omit({
  id: true,
});
export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});
export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});
export const insertModeratorUserSchema = createInsertSchema(moderatorUsers).omit({
  id: true,
  createdAt: true,
});
export const insertPlayerAccessCodeSchema = createInsertSchema(playerAccessCodes).omit({
  id: true,
  issuedAt: true,
  used: true,
  usedAt: true,
});
export const insertTournamentTeamCodeSchema = createInsertSchema(tournamentTeamCodes).omit({
  id: true,
  isReady: true,
  joinedAt: true,
  createdAt: true,
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Kullanıcı adı gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
});

export const moderatorLoginSchema = z.object({
  username: z.string().min(1, "Kullanıcı adı gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
});

export const moderatorRegisterSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export const playerLoginSchema = z.object({
  code: z.string().min(1, "Giriş kodu gerekli"),
});

export type Champion = typeof champions.$inferSelect;
export type InsertChampion = z.infer<typeof insertChampionSchema>;
export type DraftSession = typeof draftSessions.$inferSelect;
export type InsertDraftSession = z.infer<typeof insertDraftSessionSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type ModeratorUser = typeof moderatorUsers.$inferSelect;
export type InsertModeratorUser = z.infer<typeof insertModeratorUserSchema>;
export type PlayerAccessCode = typeof playerAccessCodes.$inferSelect;
export type InsertPlayerAccessCode = z.infer<typeof insertPlayerAccessCodeSchema>;
export type TournamentTeamCode = typeof tournamentTeamCodes.$inferSelect;
export type InsertTournamentTeamCode = z.infer<typeof insertTournamentTeamCodeSchema>;
export type AdminLogin = z.infer<typeof adminLoginSchema>;
export type ModeratorLogin = z.infer<typeof moderatorLoginSchema>;
export type ModeratorRegister = z.infer<typeof moderatorRegisterSchema>;
export type PlayerLogin = z.infer<typeof playerLoginSchema>;
