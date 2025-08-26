import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Plus, Trash2, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tournament, TournamentToken } from "@shared/schema";

interface TokenManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
}

export function TokenManagementModal({ isOpen, onClose, tournament }: TokenManagementModalProps) {
  const { toast } = useToast();
  const [newTokenData, setNewTokenData] = useState({
    token: '',
    teamSide: '',
    matchId: '',
  });

  // Fetch existing tokens for this tournament
  const { data: tokens = [], refetch } = useQuery<TournamentToken[]>({
    queryKey: ['/api/tournament-tokens', tournament.id],
    queryFn: async () => {
      const response = await fetch(`/api/tournament-tokens?tournamentId=${tournament.id}`);
      if (!response.ok) throw new Error('Failed to fetch tokens');
      return response.json();
    },
    enabled: isOpen,
  });

  // Create token mutation
  const createTokenMutation = useMutation({
    mutationFn: async (tokenData: any) => {
      const response = await fetch('/api/tournament-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tokenData,
          tournamentId: tournament.id,
        }),
      });
      if (!response.ok) throw new Error('Failed to create token');
      return response.json();
    },
    onSuccess: () => {
      refetch();
      setNewTokenData({ token: '', teamSide: '', matchId: '' });
      toast({
        title: "Token Oluşturuldu",
        description: "Yeni turnuva token'ı başarıyla oluşturuldu.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Token oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Delete token mutation
  const deleteTokenMutation = useMutation({
    mutationFn: async (tokenId: string) => {
      const response = await fetch(`/api/tournament-tokens/${tokenId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete token');
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Token Silindi",
        description: "Token başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Token silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const generateRandomToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewTokenData(prev => ({ ...prev, token: result }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı",
      description: "Token panoya kopyalandı.",
    });
  };

  const handleCreateToken = () => {
    if (!newTokenData.token || !newTokenData.teamSide) {
      toast({
        title: "Hata",
        description: "Token ve takım tarafı gerekli.",
        variant: "destructive",
      });
      return;
    }
    createTokenMutation.mutate(newTokenData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900/90 border-yellow-600/20">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Token Yönetimi - {tournament.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Token */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-lg text-white">Yeni Token Oluştur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-slate-200">Token</Label>
                  <div className="flex gap-2">
                    <Input
                      id="token"
                      value={newTokenData.token}
                      onChange={(e) => setNewTokenData(prev => ({ ...prev, token: e.target.value }))}
                      placeholder="Token girin veya oluştur"
                      className="bg-slate-700/50 border-slate-600 text-white"
                      data-testid="input-token"
                    />
                    <Button
                      onClick={generateRandomToken}
                      variant="outline"
                      className="border-slate-600 text-slate-200"
                      data-testid="button-generate-token"
                    >
                      Oluştur
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="teamSide" className="text-slate-200">Takım Tarafı</Label>
                  <Select value={newTokenData.teamSide} onValueChange={(value) => setNewTokenData(prev => ({ ...prev, teamSide: value }))}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white" data-testid="select-team-side">
                      <SelectValue placeholder="Takım tarafı seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="blue" className="text-white">Mavi Takım</SelectItem>
                      <SelectItem value="red" className="text-white">Kırmızı Takım</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                onClick={handleCreateToken}
                disabled={createTokenMutation.isPending}
                className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-black font-semibold"
                data-testid="button-create-token"
              >
                <Plus className="w-4 h-4 mr-2" />
                {createTokenMutation.isPending ? "Oluşturuluyor..." : "Token Oluştur"}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Tokens */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-lg text-white">Mevcut Token'lar</CardTitle>
            </CardHeader>
            <CardContent>
              {tokens.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  Henüz token oluşturulmamış.
                </div>
              ) : (
                <div className="space-y-3">
                  {tokens.map((token) => (
                    <div
                      key={token.id}
                      className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center gap-4">
                        <div className="font-mono text-white bg-slate-900/50 px-3 py-1 rounded border">
                          {token.token}
                        </div>
                        <Badge className={`${
                          token.teamSide === 'blue' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          token.teamSide === 'red' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                          'bg-gray-500/20 text-gray-300 border-gray-500/30'
                        }`}>
                          {token.teamSide === 'blue' ? 'Mavi Takım' :
                           token.teamSide === 'red' ? 'Kırmızı Takım' : 'Genel'}
                        </Badge>
                        {token.isUsed === 1 && (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            Kullanıldı
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(token.token)}
                          className="border-slate-600 text-slate-200"
                          data-testid={`button-copy-${token.id}`}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTokenMutation.mutate(token.id)}
                          disabled={deleteTokenMutation.isPending}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          data-testid={`button-delete-${token.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}