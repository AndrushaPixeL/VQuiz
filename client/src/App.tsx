import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import QuizConstructor from "@/pages/quiz-constructor";
import GameHost from "@/pages/game-host";
import MobilePlayer from "@/pages/mobile-player";
import SoloPlay from "@/pages/solo-play";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/constructor" component={QuizConstructor} />
      <Route path="/constructor/:id" component={QuizConstructor} />
      <Route path="/host/:gameCode" component={GameHost} />
      <Route path="/play/:gameCode" component={MobilePlayer} />
      <Route path="/solo/:quizId" component={SoloPlay} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
