import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/contexts/GameContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Plinko from "./pages/Plinko";
import Mines from "./pages/Mines";
import Blackjack from "./pages/Blackjack";
import RockPaperScissors from "./pages/RockPaperScissors";
import Wheel from "./pages/Wheel";
import Keno from "./pages/Keno";
import SlotsFruits from "./pages/SlotsFruits";
import SlotsArabic from "./pages/SlotsArabic";
import SlotsEgyptian from "./pages/SlotsEgyptian";
import Crash from "./pages/Crash";
import Roulette from "./pages/Roulette";
import Gifts from "./pages/Gifts";
import SitePolicy from "./pages/policies/SitePolicy";
import TermsConditions from "./pages/policies/TermsConditions";
import PrivacyPolicy from "./pages/policies/PrivacyPolicy";
import GameRules from "./pages/rules/GameRules";
import PlinkoRules from "./pages/rules/PlinkoRules";
import MinesRules from "./pages/rules/MinesRules";
import BlackjackRules from "./pages/rules/BlackjackRules";
import RPSRules from "./pages/rules/RPSRules";
import WheelRules from "./pages/rules/WheelRules";
import KenoRules from "./pages/rules/KenoRules";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <GameProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/plinko" element={<Plinko />} />
              <Route path="/mines" element={<Mines />} />
              <Route path="/blackjack" element={<Blackjack />} />
              <Route path="/rps" element={<RockPaperScissors />} />
              <Route path="/wheel" element={<Wheel />} />
              <Route path="/keno" element={<Keno />} />
              <Route path="/slots/fruits" element={<SlotsFruits />} />
              <Route path="/slots/arabic" element={<SlotsArabic />} />
              <Route path="/slots/egyptian" element={<SlotsEgyptian />} />
              <Route path="/crash" element={<Crash />} />
              <Route path="/roulette" element={<Roulette />} />
              <Route path="/gifts" element={<Gifts />} />
              <Route path="/site-policy" element={<SitePolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/rules" element={<GameRules />} />
              <Route path="/rules/plinko" element={<PlinkoRules />} />
              <Route path="/rules/mines" element={<MinesRules />} />
              <Route path="/rules/blackjack" element={<BlackjackRules />} />
              <Route path="/rules/rps" element={<RPSRules />} />
              <Route path="/rules/wheel" element={<WheelRules />} />
              <Route path="/rules/keno" element={<KenoRules />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </GameProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
