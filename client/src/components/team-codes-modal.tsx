import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Users, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TeamCodesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blueTeamCode: string;
  redTeamCode: string;
}

export function TeamCodesModal({ open, onOpenChange, blueTeamCode, redTeamCode }: TeamCodesModalProps) {
  const { toast } = useToast();
  const [showCodes, setShowCodes] = useState(false);

  const copyToClipboard = (text: string, team: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${team} team code copied to clipboard`,
      });
    });
  };

  const copyBothCodes = () => {
    const bothCodes = `Blue Team Code: ${blueTeamCode}\nRed Team Code: ${redTeamCode}`;
    navigator.clipboard.writeText(bothCodes).then(() => {
      toast({
        title: "Codes Copied!",
        description: "Both team codes copied to clipboard",
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Draft Session Created
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Share these access codes with the teams to join the draft session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Toggle visibility */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-medium">Team Access Codes</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCodes(!showCodes)}
              data-testid="button-toggle-visibility"
            >
              {showCodes ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Codes
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Codes
                </>
              )}
            </Button>
          </div>

          {/* Team codes */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Blue Team */}
            <Card className="bg-blue-900/20 border-blue-700">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                  Blue Team
                </CardTitle>
                <CardDescription>Share this code with the blue team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="font-mono text-lg text-center tracking-wider">
                      {showCodes ? blueTeamCode : "••••••••"}
                    </p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(blueTeamCode, "Blue")}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-copy-blue"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Blue Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Red Team */}
            <Card className="bg-red-900/20 border-red-700">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  Red Team
                </CardTitle>
                <CardDescription>Share this code with the red team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="font-mono text-lg text-center tracking-wider">
                      {showCodes ? redTeamCode : "••••••••"}
                    </p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(redTeamCode, "Red")}
                    className="w-full bg-red-600 hover:bg-red-700"
                    data-testid="button-copy-red"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Red Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Copy both codes */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={copyBothCodes}
              variant="outline"
              className="w-full border-slate-600 text-white hover:bg-slate-700"
              data-testid="button-copy-both"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Both Codes
            </Button>

            {/* Instructions */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">Instructions:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Teams need these codes to join the draft session</li>
                <li>• Each team should enter their respective code</li>
                <li>• Once both teams join, you can start the draft</li>
                <li>• Keep these codes secure and only share with authorized teams</li>
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-continue-draft"
            >
              Continue to Draft
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}