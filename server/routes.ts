import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDraftSessionSchema, insertTournamentSchema, insertTeamSchema, insertMatchSchema, insertUserSchema, insertTournamentTokenSchema } from "@shared/schema";
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
      // Allow empty bans by accepting null or "EMPTY_BAN" as valid championId
      const banChampionId = championId || "EMPTY_BAN";
      const session = await storage.banChampion(req.params.id, banChampionId);
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
      // Allow empty picks by accepting null or "EMPTY_PICK" as valid championId
      const pickChampionId = championId || "EMPTY_PICK";
      const session = await storage.pickChampion(req.params.id, pickChampionId);
      if (!session) {
        res.status(404).json({ message: "Draft session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to pick champion" });
    }
  });

  // Tournament routes
  app.get("/api/tournaments", async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tournaments" });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.getTournament(req.params.id);
      if (!tournament) {
        res.status(404).json({ message: "Tournament not found" });
        return;
      }
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tournament" });
    }
  });

  app.post("/api/tournaments", async (req, res) => {
    try {
      const validatedData = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(validatedData);
      res.status(201).json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create tournament" });
      }
    }
  });

  app.patch("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.updateTournament(req.params.id, req.body);
      if (!tournament) {
        res.status(404).json({ message: "Tournament not found" });
        return;
      }
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ message: "Failed to update tournament" });
    }
  });

  app.delete("/api/tournaments/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTournament(req.params.id);
      if (!deleted) {
        res.status(404).json({ message: "Tournament not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tournament" });
    }
  });

  // Team routes
  app.get("/api/tournaments/:tournamentId/teams", async (req, res) => {
    try {
      const teams = await storage.getTeams(req.params.tournamentId);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.post("/api/tournaments/:tournamentId/teams", async (req, res) => {
    try {
      const teamData = { ...req.body, tournamentId: req.params.tournamentId };
      const validatedData = insertTeamSchema.parse(teamData);
      const team = await storage.createTeam(validatedData);
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create team" });
      }
    }
  });

  app.patch("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.updateTeam(req.params.id, req.body);
      if (!team) {
        res.status(404).json({ message: "Team not found" });
        return;
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to update team" });
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTeam(req.params.id);
      if (!deleted) {
        res.status(404).json({ message: "Team not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete team" });
    }
  });

  // Match routes
  app.get("/api/tournaments/:tournamentId/matches", async (req, res) => {
    try {
      const matches = await storage.getMatches(req.params.tournamentId);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.post("/api/tournaments/:tournamentId/matches", async (req, res) => {
    try {
      const matchData = { ...req.body, tournamentId: req.params.tournamentId };
      const validatedData = insertMatchSchema.parse(matchData);
      const match = await storage.createMatch(validatedData);
      res.status(201).json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create match" });
      }
    }
  });

  app.patch("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.updateMatch(req.params.id, req.body);
      if (!match) {
        res.status(404).json({ message: "Match not found" });
        return;
      }
      res.json(match);
    } catch (error) {
      res.status(500).json({ message: "Failed to update match" });
    }
  });

  // Get draft session by match ID
  app.get("/api/matches/:matchId/draft", async (req, res) => {
    try {
      const draftSession = await storage.getDraftSessionByMatchId(req.params.matchId);
      if (!draftSession) {
        res.status(404).json({ message: "Draft session not found for this match" });
        return;
      }
      res.json(draftSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch draft session" });
    }
  });

  // Start a draft from a tournament match
  app.post("/api/matches/:matchId/draft", async (req, res) => {
    try {
      const match = await storage.getMatch(req.params.matchId);
      if (!match) {
        res.status(404).json({ message: "Match not found" });
        return;
      }

      // Get tournament and team details
      const tournament = await storage.getTournament(match.tournamentId);
      const blueTeam = match.team1Id ? await storage.getTeam(match.team1Id) : null;
      const redTeam = match.team2Id ? await storage.getTeam(match.team2Id) : null;

      const draftData = {
        phase: "waiting",
        currentTeam: "blue",
        timer: "30",
        phaseStep: "0",
        blueTeamPicks: [],
        redTeamPicks: [],
        blueTeamBans: [],
        redTeamBans: [],
        tournamentId: match.tournamentId,
        matchId: match.id,
        tournamentName: tournament?.name || "Turnuva",
        blueTeamName: blueTeam?.name || "Mavi Takım",
        redTeamName: redTeam?.name || "Kırmızı Takım",
      };

      const validatedData = insertDraftSessionSchema.parse(draftData);
      const session = await storage.createDraftSession(validatedData);
      
      // Update match status to in_progress when draft is started
      await storage.updateMatch(req.params.matchId, { status: 'in_progress' });
      
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create draft from match" });
      }
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/users/username/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tournament Token routes
  app.get("/api/tournament-tokens", async (req, res) => {
    try {
      const tournamentId = req.query.tournamentId as string | undefined;
      const tokens = await storage.getTournamentTokens(tournamentId);
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tournament tokens" });
    }
  });

  app.post("/api/tournament-tokens", async (req, res) => {
    try {
      const validatedData = insertTournamentTokenSchema.parse(req.body);
      const token = await storage.createTournamentToken(validatedData);
      res.status(201).json(token);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create tournament token" });
      }
    }
  });

  app.get("/api/tournament-tokens/:token", async (req, res) => {
    try {
      const token = await storage.getTournamentToken(req.params.token);
      if (!token) {
        res.status(404).json({ message: "Tournament token not found" });
        return;
      }
      res.json(token);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tournament token" });
    }
  });

  app.post("/api/tournament-tokens/:token/use", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }
      
      const usedToken = await storage.useTournamentToken(req.params.token, userId);
      if (!usedToken) {
        res.status(404).json({ message: "Tournament token not found" });
        return;
      }
      res.json(usedToken);
    } catch (error) {
      res.status(500).json({ message: "Failed to use tournament token" });
    }
  });

  app.delete("/api/tournament-tokens/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTournamentToken(req.params.id);
      if (!deleted) {
        res.status(404).json({ message: "Tournament token not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tournament token" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
