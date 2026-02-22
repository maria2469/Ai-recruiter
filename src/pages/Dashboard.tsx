import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Bot,
  LayoutDashboard,
  CalendarPlus,
  List,
  CreditCard,
  Settings,
  Video,
  Phone,
  Copy,
  Send,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: CalendarPlus, label: "Scheduled Interview" },
  { icon: List, label: "All Interview" },
  { icon: CreditCard, label: "Billing" },
  { icon: Settings, label: "Settings" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#0d1117]">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-purple-800/30 bg-[#111827]">
        <div className="flex items-center gap-2 p-5 text-white">
          <Bot className="h-7 w-7 text-purple-400" />
          <span className="text-xl font-bold text-white">
            <span className="text-purple-400">AI</span> Mock <span className="text-purple-300/80 font-semibold">Interviewer</span>
          </span>
        </div>

        <div className="px-4 pb-4">
          <Button
            className="w-full gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            size="sm"
            onClick={() => navigate("/create-interview")}
          >
            <Plus className="h-4 w-4" /> Create New Interview
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${item.active
                  ? "bg-purple-700/10 font-medium text-purple-400"
                  : "text-purple-300/60 hover:bg-purple-600/10 hover:text-white"
                }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-purple-800/30 p-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-purple-300/60 hover:text-white hover:bg-purple-600/10"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-purple-800/30 px-8 py-5 text-white">
          <div>
            <h2 className="text-lg font-semibold">{`Welcome Back, ${displayName}`}</h2>
            <p className="text-sm text-purple-300/60">
              AI-Driven Interviews · Hassle-Free Hiring
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-bold">
            {avatarLetter}
          </div>
        </header>

        <div className="p-8 space-y-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>

          {/* Action cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <div
              className="rounded-xl border border-purple-800/30 bg-[#111827] p-6 space-y-3 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate("/create-interview")}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <Video className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white">Create New Interview</h3>
              <p className="text-sm text-purple-300/60">
                Create AI Interviews and schedule them with Candidates
              </p>
            </div>

            <div className="rounded-xl border border-purple-800/30 bg-[#111827] p-6 space-y-3 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white">Create Phone Screening Call</h3>
              <p className="text-sm text-purple-300/60">
                Schedule phone screening call with candidates
              </p>
            </div>
          </div>

          {/* Previously created interviews */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Previously Created Interviews</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InterviewCard title="Full Stack React Developer" date="07 Apr 2025" duration="15 Min" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const InterviewCard = ({
  title,
  date,
  duration,
}: {
  title: string;
  date: string;
  duration: string;
}) => (
  <div className="rounded-xl border border-purple-800/30 bg-[#111827] p-5 space-y-3 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div className="h-4 w-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
      <span className="text-xs text-purple-300/60">{date}</span>
    </div>
    <p className="font-semibold text-white">{title}</p>
    <p className="text-xs text-purple-300/60">{duration}</p>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="gap-1.5 text-xs text-purple-300/70 hover:text-white hover:border-purple-500">
        <Copy className="h-3 w-3" /> Copy Link
      </Button>
      <Button size="sm" className="gap-1.5 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600">
        <Send className="h-3 w-3" /> Send
      </Button>
    </div>
  </div>
);

export default Dashboard;