import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DraftSimulator from "@/pages/draft-simulator";
import Tournaments from "@/pages/tournaments";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { PlayerLoginGate } from "@/components/player-login-gate";

function ProtectedRoutes() {
  return (
    <PlayerLoginGate>
      <Switch>
        <Route path="/" component={Tournaments}/>
        <Route path="/draft-simulator" component={DraftSimulator}/>
        <Route path="/tournaments" component={Tournaments}/>
        <Route component={NotFound} />
      </Switch>
    </PlayerLoginGate>
  );
}

function Router() {
  const [location] = useLocation();
  
  if (location === "/admin") {
    return <AdminPage />;
  }
  
  return <ProtectedRoutes />;
}

function App() {
  return (
    <div className="dark">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
