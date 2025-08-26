import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Settings, LogOut, Shield, Sword } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/api/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Draft Simulator
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || "User"} />
                  <AvatarFallback className="bg-blue-600">
                    {(user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="font-medium">{user.firstName || user.email}</p>
                  <p className="text-sm text-gray-400 capitalize">{user.role}</p>
                </div>
                {(user.role === "admin" || user.role === "moderator") && (
                  <Shield className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {user.firstName || user.email}!
            </h2>
            <p className="text-gray-400">
              Choose what you'd like to do today.
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Draft Simulator */}
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all cursor-pointer">
              <Link href="/draft-simulator">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
                      <Sword className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Draft Simulator</CardTitle>
                      <CardDescription>Practice champion select</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">
                    Start a draft session to practice picks and bans with realistic timers and professional audio.
                  </p>
                </CardContent>
              </Link>
            </Card>

            {/* Tournaments */}
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all cursor-pointer">
              <Link href="/tournaments">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Tournaments</CardTitle>
                      <CardDescription>Manage competitions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">
                    Create, manage, and track tournaments with automatic bracket generation and match results.
                  </p>
                </CardContent>
              </Link>
            </Card>

            {/* Admin Panel (if admin/moderator) */}
            {(user.role === "admin" || user.role === "moderator") && (
              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-600 w-12 h-12 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Admin Panel</CardTitle>
                      <CardDescription>Manage system</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">
                    Manage users, create drafts with team codes, and oversee tournament operations.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Role Information */}
          <Card className="bg-slate-800/30 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Role</p>
                  <p className="font-medium capitalize flex items-center">
                    {user.role}
                    {(user.role === "admin" || user.role === "moderator") && (
                      <Shield className="w-4 h-4 ml-2 text-yellow-400" />
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              {user.role === "user" && (
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    <strong>Note:</strong> You can participate in drafts when admins or moderators provide team access codes.
                  </p>
                </div>
              )}
              
              {(user.role === "admin" || user.role === "moderator") && (
                <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    <strong>{user.role === "admin" ? "Admin" : "Moderator"} Privileges:</strong> You can create draft sessions with team access codes and manage tournaments.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}