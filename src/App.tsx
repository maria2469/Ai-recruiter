import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TakeInterview from "./pages/TakeInterview";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateInterview from "./pages/CreateInterview";
import InterviewQuestions from "./pages/InterviewQuestions";
import GenerateInterviewLink from "./pages/GenerateInterviewLink"; // <-- new screen
import InterviewStart from "./pages/InterviewStart"; // <-- new screen

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-interview" element={<CreateInterview />} />
          <Route path="/interview-questions" element={<InterviewQuestions />} />
          <Route path="/generate-link" element={<GenerateInterviewLink />} /> {/* new route */}
          <Route path="/take-interview/:interviewId" element={<TakeInterview />} />
          <Route path="/interview-start" element={<InterviewStart />} /> {/* new route for interview start */}

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;