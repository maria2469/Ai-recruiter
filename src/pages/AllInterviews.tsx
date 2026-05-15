import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

import {
    Search,
    Copy,
    Send,
    BriefcaseBusiness,
    Clock3,
    CalendarDays,
    Sparkles,
    ArrowLeft,
} from "lucide-react";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

interface Interview {
    id: number;
    jobPosition: string;
    duration: string;
    created_at: string;
    interview_id: string;
}

const AllInterviews = () => {
    const navigate = useNavigate();

    const [interviews, setInterviews] = useState<Interview[]>([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const BASE_URL =
        import.meta.env.PROD
            ? "https://ai-recruiter-qvt6.vercel.app"
            : window.location.origin;

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        setLoading(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user?.email) {
            navigate("/auth");
            return;
        }

        const { data, error } = await supabase
            .from("Interviews")
            .select("id, jobPosition, duration, created_at, interview_id")
            .eq("userEmail", user.email)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
        } else {
            setInterviews(data || []);
        }

        setLoading(false);
    };

    const filteredInterviews = useMemo(() => {
        return interviews.filter((item) =>
            item.jobPosition
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [interviews, search]);

    const copyInterviewLink = async (
        e: React.MouseEvent,
        interviewId: string
    ) => {
        e.stopPropagation();

        const link = `${BASE_URL}/take-interview/${interviewId}`;

        await navigator.clipboard.writeText(link);

        alert("Interview link copied!");
    };

    const shareInterview = (
        e: React.MouseEvent,
        interviewId: string,
        title: string
    ) => {
        e.stopPropagation();

        const link = `${BASE_URL}/take-interview/${interviewId}`;

        const url = `https://wa.me/?text=${encodeURIComponent(
            `You have been invited to an interview for ${title}. Join here: ${link}`
        )}`;

        window.open(url, "_blank");
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#070b14] text-white">
            {/* Background Glow */}
            <div className="absolute left-[-120px] top-[-120px] h-[400px] w-[400px] rounded-full bg-purple-700/20 blur-[120px]" />

            <div className="absolute bottom-[-100px] right-[-100px] h-[350px] w-[350px] rounded-full bg-blue-700/20 blur-[120px]" />

            <div className="relative z-10 p-6 md:p-10">
                {/* Header */}
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-purple-300 transition hover:bg-white/10"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>

                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1 text-xs text-purple-300">
                                <Sparkles className="h-3 w-3" />
                                AI Interview Management
                            </div>

                            <h1 className="text-4xl font-bold">
                                All Interviews
                            </h1>

                            <p className="mt-2 text-sm text-purple-300/60">
                                Manage all your AI generated interview sessions
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-[320px]">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300/50" />

                        <input
                            type="text"
                            placeholder="Search interviews..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none backdrop-blur-xl placeholder:text-purple-300/40 focus:border-purple-500/40"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-8 grid gap-5 md:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                        <p className="text-sm text-purple-300/60">
                            Total Interviews
                        </p>

                        <h2 className="mt-2 text-4xl font-bold">
                            {interviews.length}
                        </h2>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                        <p className="text-sm text-purple-300/60">
                            Filtered Results
                        </p>

                        <h2 className="mt-2 text-4xl font-bold">
                            {filteredInterviews.length}
                        </h2>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                        <p className="text-sm text-purple-300/60">
                            AI Platform
                        </p>

                        <h2 className="mt-2 text-4xl font-bold">
                            Active
                        </h2>
                    </div>
                </div>

                {/* Interviews */}
                <div className="mt-10">
                    {loading ? (
                        <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] py-24">
                            <p className="text-purple-300/60">
                                Loading interviews...
                            </p>
                        </div>
                    ) : filteredInterviews.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-purple-500/20 bg-white/[0.03] py-24 text-center">
                            <BriefcaseBusiness className="mx-auto mb-5 h-14 w-14 text-purple-400/40" />

                            <h3 className="text-2xl font-semibold">
                                No Interviews Found
                            </h3>

                            <p className="mt-2 text-purple-300/60">
                                Try another search or create a new interview.
                            </p>

                            <Button
                                onClick={() => navigate("/create-interview")}
                                className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600"
                            >
                                Create Interview
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredInterviews.map((interview, index) => (
                                <motion.div
                                    key={interview.id}
                                    initial={{ opacity: 0, y: 25 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    whileHover={{ y: -8 }}
                                    onClick={() =>
                                        navigate(
                                            `/interview-details/${interview.interview_id}`
                                        )
                                    }
                                    className="group cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl transition-all hover:border-purple-500/30"
                                >
                                    {/* Top */}
                                    <div className="relative overflow-hidden border-b border-white/10 p-6">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 opacity-0 transition duration-300 group-hover:opacity-100" />

                                        <div className="relative z-10 flex items-start justify-between">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-900/30">
                                                <BriefcaseBusiness className="h-6 w-6 text-white" />
                                            </div>

                                            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-purple-300">
                                                #{index + 1}
                                            </div>
                                        </div>

                                        <div className="relative z-10 mt-6">
                                            <h3 className="text-2xl font-semibold leading-snug">
                                                {interview.jobPosition}
                                            </h3>

                                            <div className="mt-5 flex flex-wrap gap-3">
                                                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-purple-300">
                                                    <Clock3 className="h-3 w-3" />
                                                    {interview.duration}
                                                </div>

                                                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-purple-300">
                                                    <CalendarDays className="h-3 w-3" />
                                                    {new Date(
                                                        interview.created_at
                                                    ).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center gap-3 p-5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) =>
                                                copyInterviewLink(
                                                    e,
                                                    interview.interview_id
                                                )
                                            }
                                            className="flex-1 border-white/10 bg-white/[0.03] text-purple-200 hover:bg-white/10 hover:text-white"
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copy
                                        </Button>

                                        <Button
                                            size="sm"
                                            onClick={(e) =>
                                                shareInterview(
                                                    e,
                                                    interview.interview_id,
                                                    interview.jobPosition
                                                )
                                            }
                                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            Share
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllInterviews;