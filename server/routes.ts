import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdminOrModerator } from "./replitAuth";
import { insertDraftSessionSchema, insertTournamentSchema, insertTeamSchema, insertMatchSchema, type DraftSession } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all champions
  app.get("/api/champions", async (req, res) => {
    try {
      const champions = await storage.getChampions();
      res.json(champions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch champions" });
    }
  });

  // Create new draft session (Admin/Moderator only)
  app.post("/api/draft-sessions", isAuthenticated, isAdminOrModerator, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertDraftSessionSchema.parse({
        ...req.body,
        createdBy: userId,
      });
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

  // Join draft session with team code
  app.post("/api/draft-sessions/:id/join", async (req, res) => {
    try {
      const { teamCode } = req.body;
      
      if (!teamCode) {
        res.status(400).json({ message: "Team code is required" });
        return;
      }

      const session = await storage.getDraftSession(req.params.id);
      if (!session) {
        res.status(404).json({ message: "Draft session not found" });
        return;
      }

      let updates: Partial<DraftSession> = {};
      let team: 'blue' | 'red' | null = null;

      // Check if team code matches blue or red team
      if (session.blueTeamCode === teamCode && !session.blueTeamJoined) {
        updates.blueTeamJoined = true;
        team = 'blue';
      } else if (session.redTeamCode === teamCode && !session.redTeamJoined) {
        updates.redTeamJoined = true;
        team = 'red';
      } else if (session.blueTeamCode === teamCode && session.blueTeamJoined) {
        res.status(400).json({ message: "Blue team already joined" });
        return;
      } else if (session.redTeamCode === teamCode && session.redTeamJoined) {
        res.status(400).json({ message: "Red team already joined" });
        return;
      } else {
        res.status(400).json({ message: "Invalid team code" });
        return;
      }

      // Check if both teams are now joined and start draft
      const updatedSession = await storage.updateDraftSession(req.params.id, updates);
      if (updatedSession && updatedSession.blueTeamJoined && updatedSession.redTeamJoined && updatedSession.phase === 'waiting') {
        // Start the draft automatically when both teams join
        await storage.updateDraftSession(req.params.id, { phase: 'ban1' });
      }

      res.json({ message: `Successfully joined as ${team} team`, team });
    } catch (error) {
      res.status(500).json({ message: "Failed to join draft session" });
    }
  });

  // Get team codes for admin/moderator (for display purposes)
  app.get("/api/draft-sessions/:id/codes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
        res.status(403).json({ message: "Insufficient permissions" });
        return;
      }

      const session = await storage.getDraftSession(req.params.id);
      if (!session) {
        res.status(404).json({ message: "Draft session not found" });
        return;
      }

      res.json({
        blueTeamCode: session.blueTeamCode,
        redTeamCode: session.redTeamCode,
        blueTeamJoined: session.blueTeamJoined,
        redTeamJoined: session.redTeamJoined
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get team codes" });
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

  const httpServer = createServer(app);
  return httpServer;
}
