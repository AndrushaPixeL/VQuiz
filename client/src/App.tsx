import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import QuizSettings from "@/pages/quiz-settings";
import QuizConstructor from "@/pages/quiz-constructor";
import QuizConstructorNew from "@/pages/quiz-constructor-new";
import QuizConstructorUnified from "@/pages/quiz-constructor-unified";
import GameHost from "@/pages/game-host";
import MobilePlayer from "@/pages/mobile-player";
import SoloPlay from "@/pages/solo-play";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/quiz-settings" component={QuizSettings} />
      <Route path="/constructor" component={QuizConstructorUnified} />
      <Route path="/constructor-old" component={QuizConstructorNew} />
      <Route path="/constructor-legacy" component={QuizConstructor} />
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
