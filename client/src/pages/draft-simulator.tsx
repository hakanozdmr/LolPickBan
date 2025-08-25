import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Champion, DraftSession } from "@shared/schema";
import { NavigationHeader } from "@/components/navigation-header";
import { DraftHeader } from "@/components/draft-header";
import { CompactFilters } from "@/components/compact-filters";
import { ChampionGrid } from "@/components/champion-grid";
import { ActionBar } from "@/components/action-bar";
import { DraftStartModal } from "@/components/draft-start-modal";
import { useToast } from "@/hooks/use-toast";
import { useAudio } from "@/hooks/use-audio";

const PHASE_DURATIONS = {
  waiting: 0,
  ban1: 30,
  pick1: 30,
  ban2: 30,
  pick2: 30,
  completed: 0,
};

export default function DraftSimulator() {
  const { toast } = useToast();
  const [globalVolume, setGlobalVolume] = useState(50);
  const [preferYouTube, setPreferYouTube] = useState(true);
  const { playDraftMusic, playPickSound, playBanSound, playHoverSound, stopAllSounds } = useAudio(globalVolume, preferYouTube);
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [timer, setTimer] = useState(30);
  const [draftSessionId, setDraftSessionId] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(true);

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
          phase: 'waiting',
          currentTeam: 'blue',
          timer: '30',
          phaseStep: '0',
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

  // Start draft mutation
  const startDraftMutation = useMutation({
    mutationFn: async () => {
      if (!draftSessionId) throw new Error('No draft session');
      const response = await fetch(`/api/draft-sessions/${draftSessionId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to start draft');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/draft-sessions', draftSessionId] });
      toast({ title: "Draft Başladı!", description: "Ban fazı başlıyor..." });
      // Play epic draft music when starting
      playDraftMusic();
      // Close the modal
      setShowStartModal(false);
    },
  });

  // Ban champion mutation
  const banChampionMutation = useMutation({
    mutationFn: async (championId: string) => {
      if (!draftSessionId) throw new Error('No draft session');
      const response = await fetch(`/api/draft-sessions/${draftSessionId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ championId }),
      });
      if (!response.ok) throw new Error('Failed to ban champion');
      return response.json();
    },
    onSuccess: (updatedSession) => {
      queryClient.invalidateQueries({ queryKey: ['/api/draft-sessions', draftSessionId] });
      setSelectedChampion(null);
      // Play ban sound effect
      playBanSound();
    },
  });

  // Pick champion mutation
  const pickChampionMutation = useMutation({
    mutationFn: async (championId: string) => {
      if (!draftSessionId) throw new Error('No draft session');
      const response = await fetch(`/api/draft-sessions/${draftSessionId}/pick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ championId }),
      });
      if (!response.ok) throw new Error('Failed to pick champion');
      return response.json();
    },
    onSuccess: (updatedSession) => {
      queryClient.invalidateQueries({ queryKey: ['/api/draft-sessions', draftSessionId] });
      setSelectedChampion(null);
      // Play pick sound effect
      playPickSound();
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

  // Timer logic - countdown functionality
  useEffect(() => {
    if (!draftSession || draftSession.phase === 'waiting' || draftSession.phase === 'completed') {
      setTimer(0);
      return;
    }

    const phaseDuration = PHASE_DURATIONS[draftSession.phase as keyof typeof PHASE_DURATIONS] || 30;
    setTimer(phaseDuration);
  }, [
    draftSession?.phase, 
    draftSession?.currentTeam, 
    draftSession?.phaseStep,
    draftSession?.blueTeamBans?.length,
    draftSession?.redTeamBans?.length,
    draftSession?.blueTeamPicks?.length,
    draftSession?.redTeamPicks?.length
  ]);

  // Countdown timer interval
  useEffect(() => {
    if (!draftSession || draftSession.phase === 'waiting' || draftSession.phase === 'completed') {
      return;
    }

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          return 0; // Stay at 0
        }
        
        const newTimer = prevTimer - 1;
        
        // Auto-action when timer reaches 0
        if (newTimer <= 0) {
          // Use setTimeout to avoid dependency issues with mutations
          setTimeout(() => {
            const isBanPhase = draftSession.phase === 'ban1' || draftSession.phase === 'ban2';
            const isPickPhase = draftSession.phase === 'pick1' || draftSession.phase === 'pick2';
            
            if (isBanPhase) {
              // Auto-ban with empty ban if no champion selected
              banChampionMutation.mutate(selectedChampion?.id || "");
              
              const teamName = draftSession.currentTeam === 'blue' ? 'Mavi' : 'Kırmızı';
              toast({
                title: "Otomatik Ban",
                description: selectedChampion 
                  ? `${selectedChampion.name} ${teamName} takım tarafından otomatik banlandı.`
                  : `${teamName} takım zaman aşımı nedeniyle boş ban yaptı.`,
              });
            } else if (isPickPhase) {
              // Auto-pick with empty pick if no champion selected
              if (selectedChampion) {
                pickChampionMutation.mutate(selectedChampion.id);
                
                const teamName = draftSession.currentTeam === 'blue' ? 'Mavi' : 'Kırmızı';
                toast({
                  title: "Otomatik Seçim",
                  description: `${selectedChampion.name} ${teamName} takım için otomatik seçildi.`,
                });
              } else {
                // For picks, we still need to advance the phase even with no selection
                pickChampionMutation.mutate("");
                
                const teamName = draftSession.currentTeam === 'blue' ? 'Mavi' : 'Kırmızı';
                toast({
                  title: "Otomatik Seçim",
                  description: `${teamName} takım zaman aşımı nedeniyle şampiyon seçemedi.`,
                });
              }
            }
          }, 100); // Small delay to avoid dependency conflicts
          
          return 0;
        }
        
        return newTimer;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [draftSession?.phase, draftSession?.currentTeam, draftSession?.phaseStep]); // Removed mutation dependencies

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

  const handleStartDraft = () => {
    if (!draftSessionId) return;
    startDraftMutation.mutate();
  };

  const handleOpenStartModal = () => {
    setShowStartModal(true);
  };

  // Just select champion when clicked
  const handleChampionSelect = (champion: Champion) => {
    setSelectedChampion(champion);
  };

  const handlePickChampion = () => {
    if (!selectedChampion || !draftSession) return;

    pickChampionMutation.mutate(selectedChampion.id);
    
    const teamName = draftSession.currentTeam === 'blue' ? 'Mavi' : 'Kırmızı';
    toast({
      title: "Şampiyon Seçildi",
      description: `${selectedChampion.name} ${teamName} takım için seçildi.`,
    });
  };

  const handleBanChampion = () => {
    if (!selectedChampion || !draftSession) return;

    banChampionMutation.mutate(selectedChampion.id);
    
    const teamName = draftSession.currentTeam === 'blue' ? 'Mavi' : 'Kırmızı';
    toast({
      title: "Şampiyon Banlandı",
      description: `${selectedChampion.name} ${teamName} takım tarafından banlandı.`,
    });
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
      <NavigationHeader />
      <DraftHeader 
        draftSession={draftSession} 
        champions={champions}
        timer={timer}
        selectedChampion={selectedChampion}
        onVolumeChange={setGlobalVolume}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-6">
        <CompactFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedRoles={selectedRoles}
          onRoleToggle={handleRoleToggle}
          selectedClasses={selectedClasses}
          onClassToggle={handleClassToggle}
          onClearFilters={handleClearFilters}
        />
        
        <ChampionGrid
          champions={filteredChampions}
          selectedChampion={selectedChampion}
          onChampionSelect={handleChampionSelect}
          bannedChampions={bannedChampions}
          pickedChampions={pickedChampions}
          onChampionHover={playHoverSound}
        />
      </div>

      <ActionBar
        draftSession={draftSession}
        selectedChampion={selectedChampion}
        onPickChampion={handlePickChampion}
        onBanChampion={handleBanChampion}
        onOpenStartModal={handleOpenStartModal}
      />

      <DraftStartModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onStartDraft={handleStartDraft}
        isLoading={startDraftMutation.isPending}
      />
      
      {/* Add bottom padding to prevent content from being hidden behind action bar */}
      <div className="h-20"></div>
    </div>
  );
}
