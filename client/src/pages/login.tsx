import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export function Login() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const { login, createUser } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({
        title: "Hata",
        description: "Kullanıcı adı gerekli",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let success = false;
      
      if (isNewUser) {
        success = await createUser(username.trim(), role);
        if (success) {
          toast({
            title: "Başarılı",
            description: "Kullanıcı oluşturuldu ve giriş yapıldı",
          });
        } else {
          toast({
            title: "Hata",
            description: "Kullanıcı oluşturulamadı. Bu kullanıcı adı zaten mevcut olabilir.",
            variant: "destructive",
          });
        }
      } else {
        success = await login(username.trim());
        if (success) {
          toast({
            title: "Başarılı",
            description: "Giriş yapıldı",
          });
        } else {
          toast({
            title: "Hata",
            description: "Kullanıcı bulunamadı",
            variant: "destructive",
          });
        }
      }

      if (success) {
        navigate('/tournaments');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-black p-4">
      <Card className="w-full max-w-md bg-slate-900/80 border-yellow-600/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            League of Legends
          </CardTitle>
          <CardDescription className="text-slate-300">
            Draft Simulator Giriş
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-200">
                Kullanıcı Adı
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınızı girin"
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                data-testid="input-username"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="newUser"
                checked={isNewUser}
                onChange={(e) => setIsNewUser(e.target.checked)}
                className="rounded border-slate-600"
                data-testid="checkbox-new-user"
              />
              <Label htmlFor="newUser" className="text-slate-200 text-sm">
                Yeni kullanıcı oluştur
              </Label>
            </div>

            {isNewUser && (
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-200">
                  Rol
                </Label>
                <Select value={role} onValueChange={(value: 'admin' | 'user') => setRole(value)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white" data-testid="select-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="user" className="text-white">Kullanıcı</SelectItem>
                    <SelectItem value="admin" className="text-white">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-black font-semibold"
              data-testid="button-submit"
            >
              {isLoading ? "Giriş yapılıyor..." : isNewUser ? "Kullanıcı Oluştur" : "Giriş Yap"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}