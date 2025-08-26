import { Button } from "@/components/ui/button";
import { Shield, Trophy, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Champion Draft Simulator
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Master the art of League of Legends champion select with our professional-grade draft simulator. 
              Practice strategic picks and bans in a realistic tournament environment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
              data-testid="button-login"
            >
              <Shield className="w-5 h-5 mr-2" />
              Login to Start
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Tournament Management</h3>
            <p className="text-gray-400">
              Create and manage complete tournaments with bracket generation and match tracking.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Team Access Codes</h3>
            <p className="text-gray-400">
              Secure team access with unique codes. Admins and moderators control draft sessions.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-time Drafting</h3>
            <p className="text-gray-400">
              Experience authentic pick/ban phases with realistic timers and professional audio.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Master Champion Select?</h2>
            <p className="text-gray-300 mb-6">
              Join competitive players and teams using our platform to practice and perfect their draft strategies.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold"
              data-testid="button-login-cta"
            >
              Start Your Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}