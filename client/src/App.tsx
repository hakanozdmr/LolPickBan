import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DraftSimulator from "@/pages/draft-simulator";
import Tournaments from "@/pages/tournaments";
import { Login } from "@/pages/login";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login}/>
      <Route path="/">
        {isAuthenticated ? <Tournaments /> : <Redirect to="/login" />}
      </Route>
      <Route path="/draft-simulator">
        {isAuthenticated ? <DraftSimulator /> : <Redirect to="/login" />}
      </Route>
      <Route path="/tournaments">
        {isAuthenticated ? <Tournaments /> : <Redirect to="/login" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
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
