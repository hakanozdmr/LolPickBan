import { DraftSession, Champion } from "@shared/schema";
import { Gamepad2, X } from "lucide-react";
import { AudioControl } from "./audio-control";

interface DraftHeaderProps {
  draftSession: DraftSession;
  champions: Champion[];
  timer: number;
  selectedChampion: Champion | null;
  onVolumeChange?: (volume: number) => void;
}

export function DraftHeader({
  draftSession,
  champions,
  timer,
  selectedChampion,
  onVolumeChange,
}: DraftHeaderProps) {
  const getChampionById = (id: string) => champions.find((c) => c.id === id);

  const getLoadingScreenImage = (champion: Champion) => {
    const championName =
      champion.name.charAt(0).toUpperCase() + champion.name.slice(1);
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championName}_0.jpg`;
  };

  const isBlueTeamTurn = draftSession.currentTeam === "blue";

  const renderPickSlots = (picks: string[], team: "blue" | "red") => {
    const slots = Array.from({ length: 5 }, (_, i) => {
      const champion = picks[i] ? getChampionById(picks[i]) : null;

      const isPickPhase =
        draftSession.phase === "pick1" || draftSession.phase === "pick2";
      const isCurrentTeamTurn = draftSession.currentTeam === team;
      const isActiveSlot =
        isPickPhase && isCurrentTeamTurn && !champion && i === picks.length;

      const previewChampion =
        isActiveSlot && selectedChampion ? selectedChampion : champion;

      return (
        <div
          key={i}
          className={`w-24 h-20 sm:w-28 sm:h-40 md:w-32 md:h-60 lg:w-36 lg:h-80 xl:w-40 xl:h-100 rounded-lg border flex flex-col relative overflow-hidden transition-all duration-300 ${
            isActiveSlot
              ? `border-amber-500/60 shadow-lg shadow-amber-500/30 bg-amber-500/10 animate-slow-pulse`
              : champion
                ? `border-${team === "blue" ? "blue-500/40" : "red-500/40"} shadow-xl`
                : "border-gray-700/50 bg-gray-800/30"
          }`}
          data-testid={`${team}-pick-slot-${i}`}
        >
          {previewChampion ? (
            <>
              <div className="flex-1 relative overflow-hidden">
                <img
                  src={getLoadingScreenImage(previewChampion)}
                  alt={previewChampion.name}
                  className={`w-full h-full object-cover object-top ${isActiveSlot && selectedChampion ? "opacity-70" : ""}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"></div>
                {isActiveSlot && selectedChampion && (
                  <div className="absolute inset-0 border-2 border-amber-500/60 animate-pulse rounded-lg"></div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-gray-600 text-lg opacity-50">-</span>
            </div>
          )}
        </div>
      );
    });

    return (
      <div className="flex justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4">
        {slots}
      </div>
    );
  };

  const renderBanSlots = (bans: string[], team: "blue" | "red") => {
    const slots = Array.from({ length: 5 }, (_, i) => {
      const champion = bans[i] ? getChampionById(bans[i]) : null;

      const isBanPhase =
        draftSession.phase === "ban1" || draftSession.phase === "ban2";
      const isCurrentTeamTurn = draftSession.currentTeam === team;
      const isActiveBanSlot =
        isBanPhase && isCurrentTeamTurn && !champion && i === bans.length;

      const isEmptyBan = i < bans.length && bans[i] === "EMPTY_BAN";

      const previewChampion =
        isActiveBanSlot && selectedChampion ? selectedChampion : champion;

      return (
        <div
          key={i}
          className={`w-11 h-11 rounded-lg border flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
            isActiveBanSlot
              ? "bg-red-500/20 border-red-400/60 shadow-lg shadow-red-400/30 animate-slow-pulse"
              : champion
                ? `bg-red-900/30 border-${team === "blue" ? "blue-500/30" : "red-500/30"}`
                : "bg-gray-800/40 border-gray-700/40"
          }`}
          data-testid={`${team}-ban-slot-${i}`}
        >
          {previewChampion ? (
            <>
              <img
                src={previewChampion.image}
                alt={previewChampion.name}
                className={`w-full h-full object-cover grayscale ${isActiveBanSlot && selectedChampion ? "opacity-70" : ""}`}
              />
              <div className="absolute inset-0 bg-red-500/20"></div>
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 text-lg font-bold">
                ✕
              </span>
              {isActiveBanSlot && selectedChampion && (
                <div className="absolute inset-0 border-2 border-red-400 animate-pulse rounded-lg"></div>
              )}
            </>
          ) : isEmptyBan ? (
            <>
              <div className="w-full h-full bg-red-900/30"></div>
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 text-lg font-bold">
                ✕
              </span>
            </>
          ) : (
            <span className="text-gray-600 text-xs">—</span>
          )}
        </div>
      );
    });

    return <div className="flex gap-1">{slots}</div>;
  };

  return (
    <div className="relative overflow-hidden border-b border-gray-700/30 px-6 py-4 bg-gradient-to-br from-gray-800/80 to-gray-900/90">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.05)_0%,_transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(0,0,0,0.3)_0%,_transparent_70%)]"></div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-0">
          <div className="text-center mb-3 sm:mb-4 flex items-center justify-center gap-4">
            <h1
              className="text-xl sm:text-2xl font-bold lol-gradient-text"
              data-testid="tournament-title"
            >
              {draftSession.tournamentName || "TURNUVA ADI*"}
            </h1>
            {draftSession.phase !== 'waiting' && draftSession.phase !== 'completed' && (
              <div
                className={`flex items-center justify-center min-w-[48px] h-10 rounded-xl px-3 border ${
                  timer <= 5
                    ? 'bg-red-500/10 border-red-500/40 text-red-400'
                    : timer <= 10
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : isBlueTeamTurn
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
                data-testid="timer-progress-bar"
              >
                <span className="text-lg font-bold tabular-nums">{timer}</span>
                <span className="text-[10px] ml-1 opacity-60">sn</span>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8">
            <div className="flex-1 w-full">
              <div className="text-center mb-2 sm:mb-3">
                <h2
                  className="text-blue-400 font-bold uppercase tracking-wider text-sm"
                  data-testid="blue-team-title"
                >
                  {draftSession.blueTeamName || "MAVİ TAKIM"}
                </h2>
              </div>
              {renderPickSlots(draftSession.blueTeamPicks, "blue")}

              <div className="mt-3 sm:mt-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1 sm:mb-2">
                  BANLAR
                </h3>
                {renderBanSlots(draftSession.blueTeamBans, "blue")}
              </div>
            </div>

            <div className="text-center px-2 sm:px-4 order-first lg:order-none">
              <div
                className="bg-gray-800 border border-gray-700/50 rounded-full w-12 h-12 flex items-center justify-center"
                data-testid="vs-indicator"
              >
                <span className="text-sm font-bold lol-gradient-text">VS</span>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="text-center mb-2 sm:mb-3">
                <h2
                  className="text-red-400 font-bold uppercase tracking-wider text-sm"
                  data-testid="red-team-title"
                >
                  {draftSession.redTeamName || "KIRMIZI TAKIM"}
                </h2>
              </div>
              {renderPickSlots(draftSession.redTeamPicks, "red")}

              <div className="mt-3 sm:mt-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1 sm:mb-2">
                  BANLAR
                </h3>
                {renderBanSlots(draftSession.redTeamBans, "red")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
