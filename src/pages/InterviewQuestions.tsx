import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Clock3, BriefcaseBusiness, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

interface Question {
    question: string;
    type: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    Technical: { bg: "bg-violet-500/10", text: "text-violet-300", dot: "bg-violet-400" },
    Behavioral: { bg: "bg-emerald-500/10", text: "text-emerald-300", dot: "bg-emerald-400" },
    "Problem Solving": { bg: "bg-sky-500/10", text: "text-sky-300", dot: "bg-sky-400" },
    Situational: { bg: "bg-amber-500/10", text: "text-amber-300", dot: "bg-amber-400" },
};

const InterviewQuestions = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { interviewId } = useParams();

    const state = location.state as any;

    const [loading, setLoading] = useState(!state?.questions);
    const [interviewData, setInterviewData] = useState<any>(state || null);
    const [filter, setFilter] = useState("All");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [descExpanded, setDescExpanded] = useState(false);

    // Fetch from Supabase when navigating from AllInterviews (no state)
    useEffect(() => {
        if (state?.questions) return;
        if (!interviewId) { setLoading(false); return; }

        (async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("Interviews")
                .select("*")
                .eq("interview_id", interviewId)
                .single();

            if (error || !data) { console.error(error); }
            else setInterviewData(data);
            setLoading(false);
        })();
    }, [interviewId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#06080f] text-white/40 text-sm">
                Loading interview…
            </div>
        );
    }

    if (!interviewData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#06080f] text-red-400/70 text-sm">
                No interview data found.
            </div>
        );
    }

    // Normalise — works for both new-flow (state) and view-only (supabase) flows
    const questions: Question[] = state?.questions || interviewData?.questionList || [];
    const jobPosition = state?.jobPosition || interviewData?.jobPosition;
    const jobDescription = state?.jobDescription || interviewData?.jobDescription;
    const duration = state?.duration || interviewData?.duration;
    const selectedTypes: string[] = state?.selectedTypes || interviewData?.type?.split(", ") || [];

    const uniqueTypes = ["All", ...Array.from(new Set(questions.map((q) => q.type)))];

    const filteredQuestions =
        filter === "All" ? questions : questions.filter((q) => q.type === filter);

    // ── Save (new-flow only) ────────────────────────────────────────────────
    const handleConfirm = async () => {
        try {
            setSaving(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) { alert("User not authenticated"); return; }

            const newInterviewId = crypto.randomUUID();

            const { error } = await supabase.from("Interviews").insert([{
                jobPosition,
                jobDescription,        // ← saving job description
                duration,
                type: selectedTypes.join(", "),
                questionList: questions as unknown as Database["public"]["Tables"]["Interviews"]["Insert"]["questionList"],
                userEmail: user.email,
                interview_id: newInterviewId,
            }]);

            if (error) { console.error(error); alert("Failed to save interview."); return; }

            navigate("/generate-link", { state: { interviewId: newInterviewId, jobPosition, duration } });
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const DESC_LIMIT = 200;
    const descIsLong = jobDescription?.length > DESC_LIMIT;

    return (
        <div className="relative min-h-screen bg-[#06080f] text-white overflow-hidden">

            {/* Ambient glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute w-[600px] h-[600px] rounded-full bg-violet-700/10 blur-[140px] -top-40 -left-32" />
                <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-700/10 blur-[120px] bottom-0 right-0" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmMDgiIHN0cm9rZS13aWR0aD0iMSI+PHBhdGggZD0iTTYwIDBIMHY2MCIvPjwvZz48L3N2Zz4=')] opacity-30" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl px-5 py-10 md:px-10 md:py-12">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm transition"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back
                    </button>

                    <div className="flex items-center gap-2 text-xs text-white/30">
                        <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                        AI Interview Questions
                    </div>
                </div>

                {/* ── Job meta card ──────────────────────────────────────── */}
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-900/30">
                            <BriefcaseBusiness className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold tracking-tight">{jobPosition}</h1>
                            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-white/35">
                                {duration && (
                                    <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />{duration}</span>
                                )}
                                <span className="flex items-center gap-1 text-violet-400/70">
                                    <Tag className="h-3 w-3" />{questions.length} questions
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Job description */}
                    {jobDescription && (
                        <div className="mt-5 pt-5 border-t border-white/6">
                            <p className="text-xs font-medium text-white/35 uppercase tracking-widest mb-2">Job Description</p>
                            <p className="text-sm text-white/55 leading-relaxed whitespace-pre-line">
                                {descIsLong && !descExpanded
                                    ? jobDescription.slice(0, DESC_LIMIT) + "…"
                                    : jobDescription}
                            </p>
                            {descIsLong && (
                                <button
                                    onClick={() => setDescExpanded(!descExpanded)}
                                    className="mt-2 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition"
                                >
                                    {descExpanded
                                        ? <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
                                        : <><ChevronDown className="h-3.5 w-3.5" /> Show more</>
                                    }
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Filter tabs ────────────────────────────────────────── */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {uniqueTypes.map((type) => {
                        const color = TYPE_COLORS[type];
                        const active = filter === type;
                        return (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition
                                    ${active
                                        ? color
                                            ? `${color.bg} ${color.text} border-current/20`
                                            : "bg-violet-600 text-white border-violet-500"
                                        : "bg-white/5 text-white/40 border-white/8 hover:bg-white/10 hover:text-white/60"
                                    }`}
                            >
                                {type}
                                {type !== "All" && (
                                    <span className="ml-1.5 opacity-50">
                                        {questions.filter((q) => q.type === type).length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── Question cards ─────────────────────────────────────── */}
                <div className="grid gap-3 md:grid-cols-2">
                    <AnimatePresence mode="popLayout">
                        {filteredQuestions.map((q, index) => {
                            const color = TYPE_COLORS[q.type] || { bg: "bg-white/5", text: "text-white/40", dot: "bg-white/30" };
                            const isLong = q.question.length > 180;
                            const expanded = expandedIndex === index;

                            return (
                                <motion.div
                                    key={`${filter}-${index}`}
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ delay: index * 0.03, duration: 0.25 }}
                                    onClick={() => isLong && setExpandedIndex(expanded ? null : index)}
                                    className={`rounded-xl border border-white/8 bg-white/[0.03] p-4 flex gap-3 ${isLong ? "cursor-pointer hover:bg-white/[0.06]" : ""} transition-colors`}
                                >
                                    <span className="text-xs text-white/20 font-mono mt-0.5 w-5 flex-shrink-0">{index + 1}.</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white/80 leading-relaxed">
                                            {isLong && !expanded
                                                ? q.question.slice(0, 180) + "…"
                                                : q.question}
                                        </p>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full ${color.bg} ${color.text}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                                                {q.type}
                                            </span>
                                            {isLong && (
                                                <span className="text-[11px] text-white/25">
                                                    {expanded ? "collapse" : "expand"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* ── Save button (new flow only) ────────────────────────── */}
                {state?.questions && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-10 flex justify-center"
                    >
                        <Button
                            onClick={handleConfirm}
                            disabled={saving}
                            className="px-10 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-sm font-medium rounded-xl shadow-lg shadow-violet-900/30 disabled:opacity-50 transition"
                        >
                            {saving ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving…
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Save & Generate Link
                                </span>
                            )}
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default InterviewQuestions;