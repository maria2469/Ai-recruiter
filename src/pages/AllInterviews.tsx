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
    X,
    CheckCheck,
    ChevronRight,
    Layers,
    Tag,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Question {
    question: string;
    type: string;
}

interface Interview {
    id: number;
    jobPosition: string;
    jobDescription: string;
    duration: string;
    created_at: string;
    interview_id: string;
    questionList?: Question[];
    type?: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    Technical: { bg: "bg-violet-500/10", text: "text-violet-300", dot: "bg-violet-400" },
    Behavioral: { bg: "bg-emerald-500/10", text: "text-emerald-300", dot: "bg-emerald-400" },
    "Problem Solving": { bg: "bg-sky-500/10", text: "text-sky-300", dot: "bg-sky-400" },
    Situational: { bg: "bg-amber-500/10", text: "text-amber-300", dot: "bg-amber-400" },
};

const BASE_URL =
    import.meta.env.PROD
        ? "https://ai-recruiter-qvt6.vercel.app"
        : typeof window !== "undefined" ? window.location.origin : "";

const AllInterviews = () => {
    const navigate = useNavigate();

    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Interview | null>(null);
    const [copied, setCopied] = useState(false);
    const [qFilter, setQFilter] = useState("All");

    useEffect(() => { fetchInterviews(); }, []);

    const fetchInterviews = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) { navigate("/auth"); return; }

        const { data, error } = await supabase
            .from("Interviews")
            .select("id, jobPosition, jobDescription, duration, created_at, interview_id, questionList, type")
            .eq("userEmail", user.email)
            .order("created_at", { ascending: false });

        if (error) console.error(error);
        else setInterviews(data || []);
        setLoading(false);
    };

    const filtered = useMemo(() =>
        interviews.filter((i) =>
            i.jobPosition.toLowerCase().includes(search.toLowerCase())
        ), [interviews, search]);

    const copyLink = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(`${BASE_URL}/take-interview/${id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const share = (e: React.MouseEvent, id: string, title: string) => {
        e.stopPropagation();
        const link = `${BASE_URL}/take-interview/${id}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(`Interview for ${title}: ${link}`)}`, "_blank");
    };

    // ── Detail modal questions ──────────────────────────────────────────────
    const modalQuestions: Question[] = selected?.questionList || [];
    const filteredModalQ = qFilter === "All"
        ? modalQuestions
        : modalQuestions.filter((q) => q.type === qFilter);

    const uniqueTypes = ["All", ...Array.from(new Set(modalQuestions.map((q) => q.type)))];

    return (
        <div className="relative min-h-screen bg-[#06080f] text-white overflow-hidden font-[system-ui]">

            {/* ── Ambient glows ─────────────────────────────────────────── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute w-[600px] h-[600px] rounded-full bg-violet-700/10 blur-[140px] -top-40 -left-32" />
                <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-700/10 blur-[130px] bottom-0 right-0" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmMDgiIHN0cm9rZS13aWR0aD0iMSI+PHBhdGggZD0iTTYwIDBIMHY2MCIvPjwvZz48L3N2Zz4=')] opacity-30" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-12">

                {/* ── Top bar ──────────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition text-sm"
                        >
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                            Dashboard
                        </button>

                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium tracking-wide">
                                <Sparkles className="h-3 w-3" />
                                AI Interview Manager
                            </div>
                            <h1 className="text-3xl font-bold mt-1.5 tracking-tight">All Interviews</h1>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by position…"
                            className="w-full h-11 pl-11 pr-4 rounded-2xl bg-white/5 border border-white/10 focus:border-violet-500/60 focus:bg-white/8 outline-none text-sm placeholder:text-white/25 transition"
                        />
                    </div>
                </div>

                {/* ── Stats row ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {[
                        { label: "Total Interviews", value: interviews.length, icon: Layers },
                        { label: "Showing Now", value: filtered.length, icon: Search },
                        { label: "Status", value: "Active", icon: Sparkles },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 backdrop-blur">
                            <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </div>
                            <p className="text-3xl font-bold tracking-tight">{value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Cards grid ───────────────────────────────────────────── */}
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-white/30 text-sm">Loading interviews…</div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2 text-white/30">
                        <BriefcaseBusiness className="h-8 w-8 opacity-30" />
                        <p className="text-sm">No interviews found</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filtered.map((i, idx) => (
                            <motion.div
                                key={i.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04, duration: 0.35 }}
                                onClick={() => { setSelected(i); setQFilter("All"); }}
                                className="group cursor-pointer rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet-500/30 transition-all duration-200 overflow-hidden flex flex-col"
                            >
                                {/* Card top */}
                                <div className="p-5 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/30">
                                            <BriefcaseBusiness className="h-5 w-5" />
                                        </div>
                                        <span className="text-[11px] text-white/30 bg-white/5 px-2.5 py-1 rounded-full border border-white/8">
                                            #{idx + 1}
                                        </span>
                                    </div>

                                    <h2 className="text-base font-semibold leading-tight mb-2 group-hover:text-violet-200 transition-colors">
                                        {i.jobPosition}
                                    </h2>

                                    <p className="text-xs text-white/40 line-clamp-3 leading-relaxed">
                                        {i.jobDescription}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex flex-wrap gap-3 mt-4 text-[11px] text-white/35">
                                        <span className="flex items-center gap-1.5">
                                            <Clock3 className="h-3 w-3" />
                                            {i.duration}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <CalendarDays className="h-3 w-3" />
                                            {new Date(i.created_at).toLocaleDateString()}
                                        </span>
                                        {i.questionList?.length ? (
                                            <span className="flex items-center gap-1.5 text-violet-400/70">
                                                <Tag className="h-3 w-3" />
                                                {i.questionList.length} questions
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                {/* View detail hint */}
                                <div className="px-5 py-3 border-t border-white/6 flex items-center justify-between text-xs text-white/30 group-hover:text-violet-300/60 transition-colors">
                                    <span>View details & questions</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </div>

                                {/* Action footer */}
                                <div className="flex gap-2 px-5 pb-5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-xs"
                                        onClick={(e) => copyLink(e, i.interview_id)}
                                    >
                                        {copied ? <CheckCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                                        Copy Link
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-xs"
                                        onClick={(e) => share(e, i.interview_id, i.jobPosition)}
                                    >
                                        <Send className="h-3.5 w-3.5 mr-1.5" />
                                        Share
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════
                DETAIL MODAL
            ══════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {selected && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelected(null)}
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: "100%" }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: "100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 260 }}
                            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-[#0c0e1a] border-l border-white/8 flex flex-col overflow-hidden shadow-2xl"
                        >
                            {/* Modal header */}
                            <div className="flex items-start justify-between p-6 border-b border-white/8">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-900/30">
                                        <BriefcaseBusiness className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold leading-tight">{selected.jobPosition}</h2>
                                        <div className="flex gap-3 mt-1.5 text-xs text-white/35">
                                            <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />{selected.duration}</span>
                                            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(selected.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                {/* Job Description */}
                                <div>
                                    <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">Job Description</p>
                                    <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4 text-sm text-white/70 leading-relaxed whitespace-pre-line">
                                        {selected.jobDescription || "No description provided."}
                                    </div>
                                </div>

                                {/* Question filters */}
                                {modalQuestions.length > 0 && (
                                    <div>
                                        <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">
                                            Questions
                                            <span className="ml-2 text-violet-400 normal-case font-normal">{modalQuestions.length} total</span>
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {uniqueTypes.map((t) => {
                                                const color = TYPE_COLORS[t];
                                                const active = qFilter === t;
                                                return (
                                                    <button
                                                        key={t}
                                                        onClick={() => setQFilter(t)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition
                                                            ${active
                                                                ? (color ? `${color.bg} ${color.text} border-current/30` : "bg-violet-600 text-white border-violet-500")
                                                                : "bg-white/5 text-white/40 border-white/8 hover:bg-white/10"
                                                            }`}
                                                    >
                                                        {t}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="space-y-3">
                                            {filteredModalQ.map((q, idx) => {
                                                const color = TYPE_COLORS[q.type] || { bg: "bg-white/5", text: "text-white/40", dot: "bg-white/30" };
                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.03 }}
                                                        className="rounded-xl border border-white/8 bg-white/[0.03] p-4 flex gap-3"
                                                    >
                                                        <span className="text-xs text-white/25 font-mono mt-0.5 w-5 flex-shrink-0">{idx + 1}.</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-white/85 leading-relaxed">{q.question}</p>
                                                            <span className={`inline-flex items-center gap-1.5 mt-2 text-[11px] px-2.5 py-0.5 rounded-full ${color.bg} ${color.text}`}>
                                                                <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                                                                {q.type}
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {modalQuestions.length === 0 && (
                                    <div className="rounded-xl border border-white/6 bg-white/[0.02] p-6 text-center text-sm text-white/30">
                                        No questions saved for this interview.
                                    </div>
                                )}
                            </div>

                            {/* Modal footer actions */}
                            <div className="p-5 border-t border-white/8 flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 bg-white/5 border-white/10 hover:bg-white/10"
                                    onClick={(e) => copyLink(e, selected.interview_id)}
                                >
                                    {copied
                                        ? <><CheckCheck className="h-4 w-4 mr-2 text-emerald-400" /> Copied!</>
                                        : <><Copy className="h-4 w-4 mr-2" /> Copy Interview Link</>
                                    }
                                </Button>
                                <Button
                                    className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90"
                                    onClick={(e) => share(e, selected.interview_id, selected.jobPosition)}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Share via WhatsApp
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AllInterviews;