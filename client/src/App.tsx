import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DraftSimulator from "@/pages/draft-simulator";
import Tournaments from "@/pages/tournaments";
import NotFound from "@/pages/not-found";
import { FooterAuthPanel } from "@/components/footer-auth-panel";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Tournaments}/>
      <Route path="/draft-simulator" component={DraftSimulator}/>
      <Route path="/tournaments" component={Tournaments}/>
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
          <div className="pb-32">
            <Router />
          </div>
          <FooterAuthPanel />
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
