import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gamepad2, Play, Users } from "lucide-react";

interface DraftStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDraft: () => void;
  isLoading?: boolean;
}

export function DraftStartModal({ isOpen, onClose, onStartDraft, isLoading }: DraftStartModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="lol-bg-darker border-lol-gold max-w-lg" data-testid="draft-start-modal">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="lol-bg-dark rounded-full p-4 border-2 border-lol-gold">
              <Gamepad2 className="w-12 h-12 lol-text-gold" />
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold lol-text-gold" data-testid="modal-title">
            Draft Başlat
          </DialogTitle>
          
          <DialogDescription className="text-white text-center space-y-3" data-testid="modal-description">
            <div className="text-lg">
              Profesyonel League of Legends draft deneyimine hazır mısınız?
            </div>
            
            <div className="lol-bg-dark rounded-lg p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 lol-text-blue">
                <Users className="w-4 h-4" />
                <span>Mavi Takım vs Kırmızı Takım</span>
              </div>
              <div className="text-lol-gray">
                • Phase 1: 6 Ban + 6 Pick
              </div>
              <div className="text-lol-gray">
                • Phase 2: 4 Ban + 4 Pick
              </div>
              <div className="text-lol-gray">
                • Epic draft müzik ve ses efektleri
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-600 text-white hover:bg-gray-700"
            data-testid="cancel-draft-button"
          >
            İptal
          </Button>
          
          <Button
            onClick={onStartDraft}
            disabled={isLoading}
            className="flex-1 lol-bg-gold hover:bg-yellow-600 text-black font-semibold"
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