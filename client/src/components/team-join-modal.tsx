import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TeamJoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftSessionId: string;
  onJoinSuccess: (team: 'blue' | 'red') => void;
}

export function TeamJoinModal({ open, onOpenChange, draftSessionId, onJoinSuccess }: TeamJoinModalProps) {
  const [teamCode, setTeamCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const handleJoin = async () => {
    if (!teamCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team code",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch(`/api/draft-sessions/${draftSessionId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamCode: teamCode.trim().toUpperCase() }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to join team");
      }

      toast({
        title: "Success!",
        description: `Successfully joined as ${result.team} team`,
      });

      onJoinSuccess(result.team);
      onOpenChange(false);
      setTeamCode("");
    } catch (error: any) {
      toast({
        title: "Failed to Join",
        description: error.message || "Invalid team code or team already joined",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJoin();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-center text-xl">
            Join Draft Session
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center text-gray-300">
            Enter your team code to join the draft session
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="team-code" className="text-white">
              Team Code
            </Label>
            <Input
              id="team-code"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter 8-character code"
              maxLength={8}
              className="bg-gray-800 border-gray-600 text-white text-center text-lg font-mono tracking-widest uppercase"
              data-testid="input-team-code"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setTeamCode("");
              }}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              data-testid="button-cancel-join"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              disabled={isJoining || !teamCode.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-join-team"
            >
              {isJoining ? "Joining..." : "Join Team"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}