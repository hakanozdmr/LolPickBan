import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { type Match, insertDraftSessionSchema, insertTournamentSchema, insertTeamSchema, insertMatchSchema, adminLoginSchema, playerLoginSchema, moderatorLoginSchema, moderatorRegisterSchema } from "@shared/schema";
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

  // Sync champions from Community Dragon
  app.post("/api/champions/sync-community", async (req, res) => {
    try {
      const champions = await storage.syncChampionsFromCommunityDragon();
      res.json({ message: "Champions synced from Community Dragon successfully", count: champions.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync champions from Community Dragon" });
    }
  });

  // Sync champions from Riot API
  app.post("/api/champions/sync", async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey) {
        res.status(400).json({ message: "API key is required" });
        return;
      }
      const champions = await storage.syncChampionsFromRiot(apiKey);
      res.json({ message: "Champions synced successfully", count: champions.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync champions from Riot API" });
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
      console.error("Failed to fetch matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.post("/api/tournaments/:tournamentId/matches", async (req, res) => {
    try {
      const matchData = { ...req.body, tournamentId: req.params.tournamentId };
      if (!matchData.scheduledAt) delete matchData.scheduledAt;
      if (!matchData.completedAt) delete matchData.completedAt;
      const validatedData = insertMatchSchema.parse(matchData);
      const match = await storage.createMatch(validatedData);
      res.status(201).json(match);
    } catch (error) {
      console.error("Failed to create match:", error);
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

  // Get draft session by tournament ID
  app.get("/api/tournaments/:tournamentId/draft", async (req, res) => {
    try {
      const draftSession = await storage.getDraftSessionByTournamentId(req.params.tournamentId);
      if (!draftSession) {
        res.status(404).json({ message: "Draft session not found for this tournament" });
        return;
      }
      res.json(draftSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch draft session" });
    }
  });

  // Get all draft sessions for a match (multi-game series)
  app.get("/api/matches/:matchId/drafts", async (req, res) => {
    try {
      const drafts = await storage.getDraftSessionsByMatchId(req.params.matchId);
      res.json(drafts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch draft sessions" });
    }
  });

  // Start a draft from a tournament match (supports multi-game series)
  app.post("/api/matches/:matchId/draft", async (req, res) => {
    try {
      const { gameNumber } = req.body;
      const match = await storage.getMatch(req.params.matchId);
      if (!match) {
        res.status(404).json({ message: "Match not found" });
        return;
      }

      const targetGameNumber = gameNumber || match.currentGame || 1;

      // Check if draft session already exists for this specific game
      const allDrafts = await storage.getDraftSessionsByMatchId(req.params.matchId);
      const existingDraft = allDrafts.find(d => d.gameNumber === targetGameNumber);
      if (existingDraft) {
        res.status(200).json(existingDraft);
        return;
      }

      // Get tournament and team details
      const tournament = await storage.getTournament(match.tournamentId);
      const blueTeam = match.team1Id ? await storage.getTeam(match.team1Id) : null;
      const redTeam = match.team2Id ? await storage.getTeam(match.team2Id) : null;

      // Collect fearless banned champions from previous games in the series
      let fearlessBannedChampions: string[] = [];
      if (match.fearlessMode && targetGameNumber > 1) {
        const previousDrafts = allDrafts.filter(d => d.gameNumber < targetGameNumber && d.phase === 'completed');
        for (const draft of previousDrafts) {
          fearlessBannedChampions.push(...draft.blueTeamPicks, ...draft.redTeamPicks);
        }
        fearlessBannedChampions = Array.from(new Set(fearlessBannedChampions));
      }

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
        gameNumber: targetGameNumber,
        fearlessBannedChampions,
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
        console.error("Failed to create draft from match:", error);
        res.status(500).json({ message: "Failed to create draft from match" });
      }
    }
  });

  // Record game winner in a series and advance to next game or complete match
  app.post("/api/matches/:matchId/game-winner", async (req, res) => {
    try {
      const { winnerId } = req.body;
      const match = await storage.getMatch(req.params.matchId);
      if (!match) {
        res.status(404).json({ message: "Match not found" });
        return;
      }

      const winsNeeded = match.seriesFormat === 'bo5' ? 3 : match.seriesFormat === 'bo3' ? 2 : 1;
      
      let team1Wins = match.team1Wins;
      let team2Wins = match.team2Wins;
      
      if (winnerId === match.team1Id) {
        team1Wins++;
      } else if (winnerId === match.team2Id) {
        team2Wins++;
      } else {
        res.status(400).json({ message: "Invalid winner ID" });
        return;
      }

      const updates: Partial<Match> = {
        team1Wins,
        team2Wins,
        currentGame: match.currentGame + 1,
      };

      // Check if a team has won the series
      if (team1Wins >= winsNeeded) {
        updates.winnerId = match.team1Id;
        updates.status = 'completed';
        updates.completedAt = new Date();
      } else if (team2Wins >= winsNeeded) {
        updates.winnerId = match.team2Id;
        updates.status = 'completed';
        updates.completedAt = new Date();
      }

      const updatedMatch = await storage.updateMatch(req.params.matchId, updates);
      res.json(updatedMatch);
    } catch (error) {
      console.error("Failed to record game winner:", error);
      res.status(500).json({ message: "Failed to record game winner" });
    }
  });

  // Auth Routes - Admin Login
  app.post("/api/auth/admin/login", async (req, res) => {
    try {
      const validatedData = adminLoginSchema.parse(req.body);
      const admin = await storage.verifyAdminCredentials(validatedData.username, validatedData.password);
      
      if (!admin) {
        res.status(401).json({ message: "Geçersiz kullanıcı adı veya şifre" });
        return;
      }
      
      const token = await storage.createAdminSession(admin.id);
      res.json({ 
        token, 
        admin: { id: admin.id, username: admin.username } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Geçersiz giriş bilgileri", errors: error.errors });
      } else {
        res.status(500).json({ message: "Giriş yapılamadı" });
      }
    }
  });

  // Admin Logout
  app.post("/api/auth/admin/logout", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Yetkilendirme gerekli" });
        return;
      }
      
      const token = authHeader.substring(7);
      await storage.invalidateAdminSession(token);
      res.json({ message: "Çıkış yapıldı" });
    } catch (error) {
      res.status(500).json({ message: "Çıkış yapılamadı" });
    }
  });

  // Generate Access Codes (Admin only)
  app.post("/api/auth/admin/access-codes", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Yetkilendirme gerekli" });
        return;
      }
      
      const token = authHeader.substring(7);
      const admin = await storage.validateAdminSession(token);
      
      if (!admin) {
        res.status(401).json({ message: "Geçersiz oturum" });
        return;
      }
      
      const count = req.body.count || 1;
      const codes = [];
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const code = await storage.createAccessCode(admin.id);
        codes.push(code);
      }
      
      res.status(201).json(codes);
    } catch (error) {
      res.status(500).json({ message: "Kod oluşturulamadı" });
    }
  });

  // Get Access Codes (Admin only)
  app.get("/api/auth/admin/access-codes", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Yetkilendirme gerekli" });
        return;
      }
      
      const token = authHeader.substring(7);
      const admin = await storage.validateAdminSession(token);
      
      if (!admin) {
        res.status(401).json({ message: "Geçersiz oturum" });
        return;
      }
      
      const codes = await storage.getAccessCodes();
      res.json(codes);
    } catch (error) {
      res.status(500).json({ message: "Kodlar getirilemedi" });
    }
  });

  // Create Moderator Account (Admin only)
  app.post("/api/auth/admin/moderators", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Yetkilendirme gerekli" });
        return;
      }
      
      const token = authHeader.substring(7);
      const admin = await storage.validateAdminSession(token);
      
      if (!admin) {
        res.status(401).json({ message: "Geçersiz oturum" });
        return;
      }
      
      const validatedData = moderatorRegisterSchema.parse(req.body);
      const moderator = await storage.createModerator(validatedData.username, validatedData.password, admin.id);
      
      res.status(201).json({ 
        id: moderator.id, 
        username: moderator.username,
        createdAt: moderator.createdAt
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Geçersiz bilgiler", errors: error.errors });
      } else {
        res.status(500).json({ message: "Moderatör oluşturulamadı" });
      }
    }
  });

  // Get Moderators (Admin only)
  app.get("/api/auth/admin/moderators", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Yetkilendirme gerekli" });
        return;
      }
      
      const token = authHeader.substring(7);
      const admin = await storage.validateAdminSession(token);
      
      if (!admin) {
        res.status(401).json({ message: "Geçersiz oturum" });
        return;
      }
      
      const moderators = await storage.getModerators();
      res.json(moderators.map(m => ({
        id: m.id,
        username: m.username,
        createdAt: m.createdAt
      })));
    } catch (error) {
      res.status(500).json({ message: "Moderatörler getirilemedi" });
    }
  });

  // Moderator Login
  app.post("/api/auth/moderator/login", async (req, res) => {
    try {
      const validatedData = moderatorLoginSchema.parse(req.body);
      const moderator = await storage.verifyModeratorCredentials(validatedData.username, validatedData.password);
      
      if (!moderator) {
        res.status(401).json({ message: "Geçersiz kullanıcı adı veya şifre" });
        return;
      }
      
      const token = await storage.createModeratorSession(moderator.id);
      res.json({ 
        token, 
        moderator: { id: moderator.id, username: moderator.username },
        message: "Moderatör girişi başarılı"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Geçersiz giriş bilgileri", errors: error.errors });
      } else {
        res.status(500).json({ message: "Giriş yapılamadı" });
      }
    }
  });

  // Moderator Logout
  app.post("/api/auth/moderator/logout", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Yetkilendirme gerekli" });
        return;
      }
      
      const token = authHeader.substring(7);
      await storage.invalidateModeratorSession(token);
      res.json({ message: "Çıkış yapıldı" });
    } catch (error) {
      res.status(500).json({ message: "Çıkış yapılamadı" });
    }
  });

  // Player Login with Access Code (legacy - for backward compatibility)
  app.post("/api/auth/player/login", async (req, res) => {
    try {
      const validatedData = playerLoginSchema.parse(req.body);
      const accessCode = await storage.validateAccessCode(validatedData.code);
      
      if (!accessCode) {
        res.status(401).json({ message: "Geçersiz veya kullanılmış kod" });
        return;
      }
      
      await storage.markAccessCodeUsed(accessCode.id);
      
      res.json({ 
        sessionId: accessCode.id,
        message: "Giriş başarılı"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Geçersiz kod formatı", errors: error.errors });
      } else {
        res.status(500).json({ message: "Giriş yapılamadı" });
      }
    }
  });

  // Team Login with Team Code
  app.post("/api/auth/team/login", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        res.status(400).json({ message: "Kod gerekli" });
        return;
      }

      const teamCode = await storage.validateTeamCode(code);
      
      if (!teamCode) {
        res.status(401).json({ message: "Geçersiz takım kodu" });
        return;
      }

      // Get tournament info
      const tournament = await storage.getTournament(teamCode.tournamentId);
      
      res.json({ 
        teamCodeId: teamCode.id,
        tournamentId: teamCode.tournamentId,
        tournamentName: tournament?.name || "Turnuva",
        teamColor: teamCode.teamColor,
        teamName: teamCode.teamName,
        isReady: teamCode.isReady,
        message: "Takım girişi başarılı"
      });
    } catch (error) {
      res.status(500).json({ message: "Giriş yapılamadı" });
    }
  });

  // Get team codes by match ID
  app.get("/api/matches/:matchId/team-codes", async (req, res) => {
    try {
      const codes = await storage.getTeamCodesByMatchId(req.params.matchId);
      res.json(codes);
    } catch (error) {
      res.status(500).json({ message: "Takım kodları getirilemedi" });
    }
  });

  // Get tournament team codes (Admin/Moderator only)
  app.get("/api/tournaments/:tournamentId/team-codes", async (req, res) => {
    try {
      const codes = await storage.getTournamentTeamCodes(req.params.tournamentId);
      res.json(codes);
    } catch (error) {
      res.status(500).json({ message: "Takım kodları getirilemedi" });
    }
  });

  // Create team codes for tournament
  app.post("/api/tournaments/:tournamentId/team-codes", async (req, res) => {
    try {
      const { blueTeamName, redTeamName } = req.body;
      const codes = await storage.createTournamentTeamCodes(
        req.params.tournamentId,
        blueTeamName,
        redTeamName
      );
      res.status(201).json(codes);
    } catch (error) {
      res.status(500).json({ message: "Takım kodları oluşturulamadı" });
    }
  });

  // Mark team as ready
  app.post("/api/team-codes/:id/ready", async (req, res) => {
    try {
      const teamCode = await storage.markTeamReady(req.params.id);
      
      if (!teamCode) {
        res.status(404).json({ message: "Takım kodu bulunamadı" });
        return;
      }

      // Check if both teams are ready
      const bothReady = await storage.checkBothTeamsReady(teamCode.tournamentId);
      
      res.json({ 
        teamCode,
        bothTeamsReady: bothReady
      });
    } catch (error) {
      res.status(500).json({ message: "Hazır durumu güncellenemedi" });
    }
  });

  // Get team ready status for a tournament
  app.get("/api/tournaments/:tournamentId/ready-status", async (req, res) => {
    try {
      const codes = await storage.getTournamentTeamCodes(req.params.tournamentId);
      const blueTeam = codes.find(c => c.teamColor === "blue");
      const redTeam = codes.find(c => c.teamColor === "red");
      
      res.json({
        blueTeam: blueTeam ? {
          teamName: blueTeam.teamName,
          isReady: blueTeam.isReady,
          joinedAt: blueTeam.joinedAt
        } : null,
        redTeam: redTeam ? {
          teamName: redTeam.teamName,
          isReady: redTeam.isReady,
          joinedAt: redTeam.joinedAt
        } : null,
        bothReady: blueTeam?.isReady && redTeam?.isReady
      });
    } catch (error) {
      res.status(500).json({ message: "Durum getirilemedi" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
