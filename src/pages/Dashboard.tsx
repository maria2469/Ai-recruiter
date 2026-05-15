import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

import {
  LayoutDashboard,
  CalendarPlus,
  List,
  CreditCard,
  Settings,
  Video,
  Phone,
  Plus,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

import type { User } from "@supabase/supabase-js";

const sidebarItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    active: true,
    path: "/dashboard",
  },
  {
    icon: CalendarPlus,
    label: "Scheduled Interview",
  },
  {
    icon: List,
    label: "All Interviews",
    path: "/all-interviews",
  },
  {
    icon: CreditCard,
    label: "Billing",
  },
  {
    icon: Settings,
    label: "Settings",
  },
];

interface Interview {
  id: number;
  jobPosition: string;
  duration: string;
  created_at: string;
  interview_id: string;
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  const [interviews, setInterviews] = useState<Interview[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchInterviews(session.user.email!);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchInterviews(session.user.email!);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchInterviews = async (email: string) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("Interviews")
      .select("id, jobPosition, duration, created_at, interview_id")
      .eq("userEmail", email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setInterviews(data || []);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    navigate("/auth");
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14] text-white">
      {/* Background Glow */}
      <div className="absolute left-[-150px] top-[-100px] h-[400px] w-[400px] rounded-full bg-purple-700/20 blur-[120px]" />

      <div className="absolute bottom-[-120px] right-[-100px] h-[350px] w-[350px] rounded-full bg-blue-700/20 blur-[120px]" />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-white/[0.03] backdrop-blur-xl">
          {/* Logo */}
          <div
            className="flex cursor-pointer items-center gap-3 border-b border-white/10 p-6"
            onClick={() => navigate("/")}
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 rounded-xl object-cover"
            />

            <div>
              <h2 className="text-lg font-bold">
                <span className="text-purple-400">AI</span> Mock
              </h2>

              <p className="text-xs text-purple-300/60">
                Interview Platform
              </p>
            </div>
          </div>

          {/* Create Button */}
          <div className="p-4">
            <Button
              onClick={() => navigate("/create-interview")}
              className="w-full gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-900/30 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Interview
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-2">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                onClick={() => item.path && navigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${item.active
                    ? "border border-purple-500/20 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white"
                    : "text-purple-200/60 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <item.icon className="h-4 w-4" />

                {item.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t border-white/10 p-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-purple-200/60 hover:bg-white/5 hover:text-white"
            >
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#070b14]/70 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-5 md:px-10">
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome Back, {displayName}
                </h1>

                <p className="mt-1 text-sm text-purple-300/60">
                  AI-Driven Recruitment Dashboard
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden items-center gap-2 rounded-full border border-purple-500/20 bg-white/5 px-4 py-2 text-sm text-purple-300 md:flex">
                  <Sparkles className="h-4 w-4" />
                  AI Recruiter
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-sm font-bold shadow-lg shadow-purple-900/40">
                  {avatarLetter}
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6 md:p-10">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10" />

              <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1 text-xs text-purple-300">
                    <Sparkles className="h-3 w-3" />
                    AI Recruitment Workspace
                  </div>

                  <h2 className="text-4xl font-bold leading-tight">
                    Manage AI Interviews
                    <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Faster & Smarter
                    </span>
                  </h2>

                  <p className="mt-4 max-w-xl leading-7 text-purple-200/70">
                    Create intelligent interviews, share candidate links,
                    evaluate responses, and streamline your hiring workflow
                    using AI-powered assessments.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button
                      onClick={() => navigate("/create-interview")}
                      className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-6 text-white hover:from-purple-700 hover:to-blue-700"
                    >
                      <Video className="mr-2 h-5 w-5" />
                      Create Interview
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate("/all-interviews")}
                      className="rounded-xl border-white/10 bg-white/[0.03] px-6 py-6 text-white hover:bg-white/10"
                    >
                      <List className="mr-2 h-5 w-5" />
                      View All Interviews
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur-lg"
                  >
                    <p className="text-sm text-purple-300/60">
                      Total Interviews
                    </p>

                    <h3 className="mt-3 text-4xl font-bold">
                      {loading ? "..." : interviews.length}
                    </h3>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur-lg"
                  >
                    <p className="text-sm text-purple-300/60">
                      AI Availability
                    </p>

                    <h3 className="mt-3 text-4xl font-bold">24/7</h3>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {/* Create Interview */}
              <motion.div
                whileHover={{ y: -6 }}
                onClick={() => navigate("/create-interview")}
                className="group cursor-pointer rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition-all hover:border-purple-500/30"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-900/30">
                  <Video className="h-6 w-6 text-white" />
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold">
                    Create New Interview
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-purple-200/60">
                    Generate AI-powered interview questions and instantly share
                    candidate interview links.
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm text-purple-300">
                  Get Started
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </motion.div>

              {/* Phone Screening */}
              <motion.div
                whileHover={{ y: -6 }}
                className="group cursor-pointer rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition-all hover:border-purple-500/30"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-900/30">
                  <Phone className="h-6 w-6 text-white" />
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold">
                    Phone Screening
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-purple-200/60">
                    Conduct structured AI-assisted phone screening interviews
                    with candidates.
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm text-purple-300">
                  Coming Soon
                </div>
              </motion.div>
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-600/10 to-blue-600/10 p-8 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    Ready to streamline hiring?
                  </h3>

                  <p className="mt-2 max-w-2xl text-purple-200/70">
                    Use AI-powered interviews to save time, improve candidate
                    evaluation, and automate recruitment workflows.
                  </p>
                </div>

                <Button
                  onClick={() => navigate("/all-interviews")}
                  className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-6 text-white hover:from-purple-700 hover:to-blue-700"
                >
                  View Interviews
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;