import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

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
  position: integer("position").notNull(), // Position in the round
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  email: varchar("email").unique(),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tournament participation tokens
export const tournamentTokens = pgTable("tournament_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: varchar("token").notNull().unique(),
  tournamentId: varchar("tournament_id").notNull(),
  matchId: varchar("match_id"),
  teamSide: text("team_side"), // 'blue' or 'red'
  userId: varchar("user_id"),
  isUsed: integer("is_used").notNull().default(0), // 0 = false, 1 = true
  expiresAt: timestamp("expires_at"),
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
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertTournamentTokenSchema = createInsertSchema(tournamentTokens).omit({
  id: true,
  createdAt: true,
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
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TournamentToken = typeof tournamentTokens.$inferSelect;
export type InsertTournamentToken = z.infer<typeof insertTournamentTokenSchema>;
