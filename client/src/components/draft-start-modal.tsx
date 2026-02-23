import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gamepad2, Play, Users, Music, Shield, Swords } from "lucide-react";

interface DraftStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDraft: () => void;
  isLoading?: boolean;
}

export function DraftStartModal({ isOpen, onClose, onStartDraft, isLoading }: DraftStartModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700/50 shadow-2xl max-w-lg" data-testid="draft-start-modal">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center">
              <Gamepad2 className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          
          <DialogTitle className="lol-gradient-text text-xl font-bold" data-testid="modal-title">
            Draft Başlat
          </DialogTitle>
          
          <DialogDescription className="text-white text-center space-y-3" data-testid="modal-description">
            <div className="text-sm text-gray-300">
              Profesyonel League of Legends draft deneyimine hazır mısınız?
            </div>
            
            <div className="rounded-xl bg-gray-800/40 border border-gray-700/30 p-4 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-blue-400">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span>Mavi Takım vs Kırmızı Takım</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-7 h-7 rounded-lg bg-gray-700/30 border border-gray-700/20 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span>Phase 1: 6 Ban + 6 Pick</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-7 h-7 rounded-lg bg-gray-700/30 border border-gray-700/20 flex items-center justify-center">
                  <Swords className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span>Phase 2: 4 Ban + 4 Pick</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-7 h-7 rounded-lg bg-gray-700/30 border border-gray-700/20 flex items-center justify-center">
                  <Music className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span>Epic draft müzik ve ses efektleri</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <Button
            onClick={onStartDraft}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold shadow-lg shadow-amber-900/20"
            data-testid="confirm-start-draft-button"
          >
            <Play className="w-4 h-4 mr-2" />
            {isLoading ? "Başlatılıyor..." : "Draft Başlat"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}