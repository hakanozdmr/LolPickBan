import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb } from "drizzle-orm/pg-core";
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
  phase: text("phase").notNull().default("ban1"),
  currentTeam: text("current_team").notNull().default("blue"),
  timer: varchar("timer").notNull().default("30"),
  blueTeamPicks: jsonb("blue_team_picks").$type<string[]>().notNull().default([]),
  redTeamPicks: jsonb("red_team_picks").$type<string[]>().notNull().default([]),
  blueTeamBans: jsonb("blue_team_bans").$type<string[]>().notNull().default([]),
  redTeamBans: jsonb("red_team_bans").$type<string[]>().notNull().default([]),
});

export const insertChampionSchema = createInsertSchema(champions);
export const insertDraftSessionSchema = createInsertSchema(draftSessions).omit({
  id: true,
});

export type Champion = typeof champions.$inferSelect;
export type InsertChampion = z.infer<typeof insertChampionSchema>;
export type DraftSession = typeof draftSessions.$inferSelect;
export type InsertDraftSession = z.infer<typeof insertDraftSessionSchema>;
