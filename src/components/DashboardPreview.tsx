import { useEffect, useState } from "react";
import { Video, Phone, Copy, Send, LayoutDashboard, CalendarPlus, CreditCard, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DashboardPreview = () => {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserName(session.user.user_metadata?.full_name || session.user.email || "User");
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-border bg-primary px-4 py-3">
        <span className="text-sm font-semibold text-primary-foreground">Ai Mock Interviewer</span>
      </div>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-40 border-r border-border bg-secondary/50 p-3 space-y-1">
          <SidebarItem icon={<LayoutDashboard className="h-3.5 w-3.5" />} label="Dashboard" active />
          <SidebarItem icon={<Video className="h-3.5 w-3.5" />} label="Scheduled Interviews" />
          <SidebarItem icon={<CalendarPlus className="h-3.5 w-3.5" />} label="Add Interview" />
          <SidebarItem icon={<CreditCard className="h-3.5 w-3.5" />} label="Billing" />
          <SidebarItem icon={<Settings className="h-3.5 w-3.5" />} label="Settings" />
        </div>
        {/* Main content */}
        <div className="flex-1 p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-foreground">
              Welcome back, {userName}!
            </p>
            <p className="text-[10px] text-muted-foreground">
              AI-Driven Mock Interviews · Hassle-Free Candidate Evaluation
            </p>
          </div>
          <p className="text-xs font-bold text-foreground">Dashboard</p>
          <div className="grid grid-cols-2 gap-3">
            <ActionCard
              icon={<Video className="h-5 w-5 text-primary" />}
              title="Create New Interview"
              desc="Generate AI-based interviews and schedule them with candidates"
            />
            <ActionCard
              icon={<Phone className="h-5 w-5 text-primary" />}
              title="Create Phone Screening"
              desc="Set up phone screening calls with potential candidates"
            />
          </div>
          <p className="text-xs font-bold text-foreground">Previously Created Interviews</p>
          <div className="grid grid-cols-3 gap-2">
            <InterviewCard color="bg-primary" title="Full Stack Developer" date="20 Oct 2024" />
            <InterviewCard color="bg-orange-500" title="Backend Developer" date="20 Oct 2024" />
            <InterviewCard color="bg-red-500" title="Frontend Developer" date="20 Oct 2024" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) => (
  <div className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
    {icon}
    {label}
  </div>
);

const ActionCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="rounded-lg border border-border p-3 space-y-1 hover:shadow-md transition">
    {icon}
    <p className="text-[10px] font-semibold text-foreground">{title}</p>
    <p className="text-[9px] text-muted-foreground leading-tight">{desc}</p>
  </div>
);

const InterviewCard = ({ color, title, date }: { color: string; title: string; date: string }) => (
  <div className="rounded-lg border border-border p-2 space-y-2 hover:shadow-md transition">
    <div className="flex items-center justify-between">
      <div className={`h-3 w-3 rounded-full ${color}`} />
      <span className="text-[8px] text-muted-foreground">{date}</span>
    </div>
    <p className="text-[9px] font-semibold text-foreground">{title}</p>
    <div className="flex gap-1">
      <button className="flex items-center gap-0.5 rounded bg-secondary px-1.5 py-0.5 text-[8px] text-muted-foreground">
        <Copy className="h-2 w-2" /> Copy Link
      </button>
      <button className="flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.5 text-[8px] text-primary-foreground">
        <Send className="h-2 w-2" /> Send
      </button>
    </div>
  </div>
);

export default DashboardPreview;