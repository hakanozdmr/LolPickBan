import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Champion, DraftSession } from "@shared/schema";
import { DraftHeader } from "@/components/draft-header";
import { FiltersPanel } from "@/components/filters-panel";
import { ChampionGrid } from "@/components/champion-grid";
import { ActionBar } from "@/components/action-bar";
import { useToast } from "@/hooks/use-toast";

const DRAFT_PHASES = ['ban1', 'pick1', 'ban2', 'pick2', 'pick3'];
const PHASE_DURATIONS = {
  ban1: 30,
  pick1: 30,
  ban2: 30,
  pick2: 30,
  pick3: 30,
};

export default function DraftSimulator() {
  const { toast } = useToast();
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [timer, setTimer] = useState(30);
  const [draftSessionId, setDraftSessionId] = useState<string | null>(null);

  // Fetch champions
  const { data: champions = [], isLoading: championsLoading } = useQuery<Champion[]>({
    queryKey: ['/api/champions'],
  });

  // Fetch draft session
  const { data: draftSession, isLoading: draftLoading } = useQuery<DraftSession>({
    queryKey: ['/api/draft-sessions', draftSessionId],
    enabled: !!draftSessionId,
  });

  // Create draft session mutation
  const createDraftMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/draft-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'ban1',
          currentTeam: 'blue',
          timer: '30',
          blueTeamPicks: [],
          redTeamPicks: [],
          blueTeamBans: [],
          redTeamBans: [],
        }),
      });
      if (!response.ok) throw new Error('Failed to create draft session');
      return response.json();
    },
    onSuccess: (data: DraftSession) => {
      setDraftSessionId(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/draft-sessions'] });
    },
  });

  // Update draft session mutation
  const updateDraftMutation = useMutation({
    mutationFn: async (updates: Partial<DraftSession>) => {
      if (!draftSessionId) throw new Error('No draft session');
      const response = await fetch(`/api/draft-sessions/${draftSessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update draft session');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/draft-sessions', draftSessionId] });
    },
  });

  // Initialize draft session
  useEffect(() => {
    if (!draftSessionId) {
      createDraftMutation.mutate();
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (!draftSession) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Auto-advance to next phase
          advancePhase();
          return PHASE_DURATIONS[draftSession.phase as keyof typeof PHASE_DURATIONS] || 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [draftSession?.phase]);

  // Filter champions
  const filteredChampions = useMemo(() => {
    return champions.filter(champion => {
      // Search filter
      if (searchTerm && !champion.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Role filter
      if (selectedRoles.length > 0) {
        const hasMatchingRole = champion.roles.some(role => selectedRoles.includes(role));
        if (!hasMatchingRole) return false;
      }

      // Class filter
      if (selectedClasses.length > 0) {
        const hasMatchingClass = champion.classes.some(champClass => selectedClasses.includes(champClass));
        if (!hasMatchingClass) return false;
      }

      return true;
    });
  }, [champions, searchTerm, selectedRoles, selectedClasses]);

  // Get all banned and picked champions
  const bannedChampions = useMemo(() => {
    if (!draftSession) return [];
    return [...draftSession.blueTeamBans, ...draftSession.redTeamBans];
  }, [draftSession]);

  const pickedChampions = useMemo(() => {
    if (!draftSession) return [];
    return [...draftSession.blueTeamPicks, ...draftSession.redTeamPicks];
  }, [draftSession]);

  const advancePhase = () => {
    if (!draftSession) return;

    const currentPhaseIndex = DRAFT_PHASES.indexOf(draftSession.phase);
    const nextPhaseIndex = (currentPhaseIndex + 1) % DRAFT_PHASES.length;
    const nextPhase = DRAFT_PHASES[nextPhaseIndex];
    const nextTeam = draftSession.currentTeam === 'blue' ? 'red' : 'blue';

    updateDraftMutation.mutate({
      phase: nextPhase,
      currentTeam: nextTeam,
    });

    setTimer(PHASE_DURATIONS[nextPhase as keyof typeof PHASE_DURATIONS] || 30);
    setSelectedChampion(null);
  };

  const handlePickChampion = () => {
    if (!selectedChampion || !draftSession) return;

    const isBlueTeam = draftSession.currentTeam === 'blue';
    const currentPicks = isBlueTeam ? draftSession.blueTeamPicks : draftSession.redTeamPicks;
    
    if (currentPicks.length >= 5) {
      toast({
        title: "Team Full",
        description: "This team already has 5 champions picked.",
        variant: "destructive",
      });
      return;
    }

    const updates = isBlueTeam
      ? { blueTeamPicks: [...currentPicks, selectedChampion.id] }
      : { redTeamPicks: [...currentPicks, selectedChampion.id] };

    updateDraftMutation.mutate(updates);
    
    toast({
      title: "Champion Picked",
      description: `${selectedChampion.name} has been picked for ${isBlueTeam ? 'Blue' : 'Red'} team.`,
    });

    advancePhase();
  };

  const handleBanChampion = () => {
    if (!selectedChampion || !draftSession) return;

    const isBlueTeam = draftSession.currentTeam === 'blue';
    const currentBans = isBlueTeam ? draftSession.blueTeamBans : draftSession.redTeamBans;
    
    if (currentBans.length >= 3) {
      toast({
        title: "Ban Limit Reached",
        description: "This team has already banned 3 champions.",
        variant: "destructive",
      });
      return;
    }

    const updates = isBlueTeam
      ? { blueTeamBans: [...currentBans, selectedChampion.id] }
      : { redTeamBans: [...currentBans, selectedChampion.id] };

    updateDraftMutation.mutate(updates);
    
    toast({
      title: "Champion Banned",
      description: `${selectedChampion.name} has been banned by ${isBlueTeam ? 'Blue' : 'Red'} team.`,
    });

    advancePhase();
  };

  const handleSkipTurn = () => {
    toast({
      title: "Turn Skipped",
      description: "Turn has been skipped.",
    });
    advancePhase();
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleClassToggle = (className: string) => {
    setSelectedClasses(prev => 
      prev.includes(className) 
        ? prev.filter(c => c !== className)
        : [...prev, className]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedRoles([]);
    setSelectedClasses([]);
  };

  if (championsLoading || draftLoading || !draftSession) {
    return (
      <div className="min-h-screen lol-bg-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading Draft Simulator...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lol-bg-dark text-white font-inter">
      <DraftHeader 
        draftSession={draftSession} 
        champions={champions}
        timer={timer}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          <FiltersPanel
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedRoles={selectedRoles}
            onRoleToggle={handleRoleToggle}
            selectedClasses={selectedClasses}
            onClassToggle={handleClassToggle}
            onClearFilters={handleClearFilters}
            champions={champions}
            filteredChampions={filteredChampions}
          />
          
          <ChampionGrid
            champions={filteredChampions}
            selectedChampion={selectedChampion}
            onChampionSelect={setSelectedChampion}
            bannedChampions={bannedChampions}
            pickedChampions={pickedChampions}
          />
        </div>
      </div>

      <ActionBar
        draftSession={draftSession}
        selectedChampion={selectedChampion}
        onPickChampion={handlePickChampion}
        onBanChampion={handleBanChampion}
        onSkipTurn={handleSkipTurn}
      />
      
      {/* Add bottom padding to prevent content from being hidden behind action bar */}
      <div className="h-20"></div>
    </div>
  );
}
