// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateInterview from "./pages/CreateInterview";
import InterviewQuestions from "./pages/InterviewQuestions";
import GenerateInterviewLink from "./pages/GenerateInterviewLink";
import TakeInterview from "./pages/TakeInterview";
import InterviewStart from "./pages/InterviewStart";
import InterviewFeedback from "./pages/InterviewFeedback";
import AllInterviews from "./pages/AllInterviews";
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
          <Route path="/generate-link" element={<GenerateInterviewLink />} />
          <Route path="/take-interview/:interviewId" element={<TakeInterview />} />
          <Route path="/interview-start" element={<InterviewStart />} />
          <Route path="/interview-feedback" element={<InterviewFeedback />} />
          <Route path="/interview-details/:interviewId" element={<InterviewQuestions />} />
          <Route path="/all-interviews" element={<AllInterviews />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;