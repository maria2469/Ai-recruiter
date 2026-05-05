// src/pages/InterviewFeedback.tsx
// Requires: VITE_GROQ_API_KEY in your .env
// Navigated to from InterviewStart after interview ends
// State passed: { candidateName, jobPosition, difficulty, duration, messages }

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TranscriptMessage {
    role: "assistant" | "user";
    text: string;
}

interface FeedbackData {
    technicalStrengths: string[];
    technicalWeaknesses: string[];
    softStrengths: string[];
    softWeaknesses: string[];
    toAdd: string[];
    toRemove: string[];
    overallScore: number;
    summary: string;
    hiringVerdict: "strong_yes" | "yes" | "maybe" | "no";
    scoreBreakdown: {
        technical: number;
        communication: number;
        problemSolving: number;
        cultural: number;
    };
}

interface LocationState {
    candidateName: string;
    jobPosition: string;
    difficulty: string;
    duration: number;
    messages: TranscriptMessage[];
}

// ─── Groq API ─────────────────────────────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

async function generateFeedbackWithGroq(
    candidateName: string,
    jobPosition: string,
    difficulty: string,
    messages: TranscriptMessage[]
): Promise<FeedbackData> {
    const transcript = messages.length
        ? messages.map(m => `${m.role === "assistant" ? "INTERVIEWER" : "CANDIDATE"}: ${m.text}`).join("\n\n")
        : "(No transcript available — session was too short or candidate did not respond)";

    const prompt = `You are an expert senior recruiter and technical hiring manager. Analyze this ${difficulty}-level interview transcript for the ${jobPosition} position and provide detailed, honest, actionable feedback.

CANDIDATE: ${candidateName}
ROLE: ${jobPosition}
DIFFICULTY: ${difficulty}

TRANSCRIPT:
${transcript}

Respond ONLY with a valid JSON object — no markdown fences, no backticks, no explanation. Use exactly this shape:
{
  "technicalStrengths": ["specific strength referencing what was actually said", "strength 2"],
  "technicalWeaknesses": ["specific weakness referencing what was actually said", "weakness 2"],
  "softStrengths": ["specific soft skill observation 1", "observation 2"],
  "softWeaknesses": ["specific soft skill gap 1", "gap 2"],
  "toAdd": ["concrete skill or habit to add 1", "item 2", "item 3"],
  "toRemove": ["specific habit or pattern to stop 1", "item 2"],
  "overallScore": 72,
  "summary": "2-3 sentence honest overall assessment referencing the actual interview performance",
  "hiringVerdict": "yes",
  "scoreBreakdown": {
    "technical": 75,
    "communication": 80,
    "problemSolving": 65,
    "cultural": 70
  }
}

Rules:
- hiringVerdict must be exactly one of: "strong_yes", "yes", "maybe", "no"
- All scores are integers 0-100
- Reference actual content from the transcript — no generic feedback
- technicalStrengths and technicalWeaknesses: 2-4 items each
- softStrengths and softWeaknesses: 2-3 items each
- toAdd and toRemove: 2-4 items each`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.4,
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq API ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean) as FeedbackData;
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 128 }: { score: number; size?: number }) {
    const sw = 8;
    const r = (size - sw) / 2;
    const circ = 2 * Math.PI * r;
    const filled = (score / 100) * circ;
    const color = score >= 75 ? "#34d399" : score >= 50 ? "#f59e0b" : "#f87171";
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={sw} strokeLinecap="round"
                strokeDasharray={`${filled} ${circ}`}
                style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}
            />
        </svg>
    );
}

// ─── Mini bar ─────────────────────────────────────────────────────────────────
function MiniBar({ score, label, color }: { score: number; label: string; color: string }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 12, color: "#f1f5f9", fontWeight: 700 }}>{score}</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                    height: "100%", width: `${score}%`, background: color, borderRadius: 3,
                    transition: "width 1.1s cubic-bezier(0.34,1.56,0.64,1)",
                }} />
            </div>
        </div>
    );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ text, type }: { text: string; type: "strength" | "weakness" | "add" | "remove" }) {
    const cfg = {
        strength: { bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.22)", color: "#6ee7b7", icon: "↑" },
        weakness: { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)", color: "#fca5a5", icon: "↓" },
        add: { bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.22)", color: "#a5b4fc", icon: "+" },
        remove: { bg: "rgba(251,191,36,0.07)", border: "rgba(251,191,36,0.2)", color: "#fcd34d", icon: "−" },
    }[type];
    return (
        <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "10px 14px",
            background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10,
            marginBottom: 8,
            animation: "fadeUp 0.4s ease both",
        }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: cfg.color, minWidth: 14, marginTop: 2, fontFamily: "monospace" }}>
                {cfg.icon}
            </span>
            <span style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6 }}>{text}</span>
        </div>
    );
}

// ─── Section header ───────────────────────────────────────────────────────────
function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
    return (
        <div style={{ marginBottom: "1.75rem", animation: `fadeUp 0.5s ease ${delay}ms both` }}>
            <h3 style={{
                fontSize: 10, fontWeight: 700, color: "#475569",
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                margin: "0 0 10px",
            }}>
                {title}
            </h3>
            {children}
        </div>
    );
}

// ─── Verdict config ───────────────────────────────────────────────────────────
const VERDICT = {
    strong_yes: { label: "Strong Hire", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)", icon: "⭐" },
    yes: { label: "Hire", color: "#818cf8", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.25)", icon: "✓" },
    maybe: { label: "Borderline", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", icon: "~" },
    no: { label: "No Hire", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", icon: "✕" },
};

// ─── Loading screen ───────────────────────────────────────────────────────────
function LoadingScreen({ candidateName, jobPosition }: { candidateName: string; jobPosition: string }) {
    const steps = [
        "Parsing transcript...",
        "Evaluating technical depth...",
        "Assessing communication style...",
        "Generating personalised feedback...",
    ];
    const [step, setStep] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1900);
        return () => clearInterval(t);
    }, []);

    return (
        <div style={{
            minHeight: "100vh", background: "#080a16",
            display: "flex", flexDirection: "column" as const,
            alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", padding: "0 24px",
        }}>
            <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 34, marginBottom: 36,
                animation: "orbPulse 2s ease-in-out infinite",
            }}>🧠</div>

            <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700, margin: "0 0 6px", textAlign: "center" as const }}>
                Analysing your interview
            </h2>
            <p style={{ color: "#475569", fontSize: 14, margin: "0 0 40px", textAlign: "center" as const }}>
                {candidateName} · {jobPosition}
            </p>

            <div style={{ display: "flex", flexDirection: "column" as const, gap: 14, width: "100%", maxWidth: 320 }}>
                {steps.map((s, i) => (
                    <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        opacity: i <= step ? 1 : 0.18, transition: "opacity 0.5s ease",
                    }}>
                        <div style={{
                            width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, transition: "all 0.4s ease",
                            background: i < step ? "#34d399" : i === step ? "transparent" : "rgba(255,255,255,0.05)",
                            border: i === step ? "2px solid #818cf8" : "none",
                            animation: i === step ? "spin 1s linear infinite" : "none",
                            color: "#080a16", fontWeight: 800,
                        }}>
                            {i < step ? "✓" : ""}
                        </div>
                        <span style={{ fontSize: 13, color: i <= step ? "#cbd5e1" : "#475569" }}>{s}</span>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes orbPulse {
                    0%,100% { transform:scale(1); box-shadow:0 0 0 0 rgba(99,102,241,0.3); }
                    50%     { transform:scale(1.06); box-shadow:0 0 0 22px rgba(99,102,241,0); }
                }
                @keyframes spin { to { transform:rotate(360deg); } }
                @keyframes fadeUp {
                    from { opacity:0; transform:translateY(14px); }
                    to   { opacity:1; transform:translateY(0); }
                }
            `}</style>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const InterviewFeedback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        candidateName = "Candidate",
        jobPosition = "the role",
        difficulty = "medium",
        duration = 20,
        messages = [],
    } = (location.state as LocationState) || {};

    const [feedback, setFeedback] = useState<FeedbackData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const result = await generateFeedbackWithGroq(candidateName, jobPosition, difficulty, messages);
                if (!cancelled) setFeedback(result);
            } catch (e: any) {
                if (!cancelled) setError(e?.message || "Unknown error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (loading) return <LoadingScreen candidateName={candidateName} jobPosition={jobPosition} />;

    if (error || !feedback) {
        return (
            <div style={{
                minHeight: "100vh", background: "#080a16",
                display: "flex", flexDirection: "column" as const,
                alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                padding: "0 24px", textAlign: "center" as const,
            }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
                <h2 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, margin: "0 0 10px" }}>
                    Couldn't generate feedback
                </h2>
                <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 28px", maxWidth: 380, lineHeight: 1.65 }}>
                    {error}. Make sure <code style={{ color: "#a5b4fc" }}>VITE_GROQ_API_KEY</code> is set in your .env file.
                </p>
                <button onClick={() => navigate("/dashboard")} style={{
                    padding: "12px 28px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "none", borderRadius: 10, color: "#fff",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                }}>Back to dashboard</button>
            </div>
        );
    }

    const verdict = VERDICT[feedback.hiringVerdict];
    const scoreColor = feedback.overallScore >= 75 ? "#34d399" : feedback.overallScore >= 50 ? "#f59e0b" : "#f87171";

    return (
        <div style={{
            minHeight: "100vh",
            background: "#080a16",
            backgroundImage:
                "radial-gradient(ellipse at 15% 10%, rgba(99,102,241,0.07) 0%, transparent 55%)," +
                "radial-gradient(ellipse at 85% 90%, rgba(139,92,246,0.05) 0%, transparent 55%)",
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            paddingBottom: 80,
        }}>
            <style>{`
                @keyframes fadeUp {
                    from { opacity:0; transform:translateY(14px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
                ::-webkit-scrollbar { width:4px; }
                ::-webkit-scrollbar-track { background:transparent; }
                ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
            `}</style>

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: "32px 24px 28px",
                animation: "fadeIn 0.4s ease",
            }}>
                <div style={{ maxWidth: 860, margin: "0 auto" }}>
                    <button onClick={() => navigate("/dashboard")} style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "none", border: "none", color: "#64748b",
                        fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 24,
                        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                    }}>← Back to dashboard</button>

                    <div style={{
                        display: "flex", alignItems: "flex-start",
                        justifyContent: "space-between", flexWrap: "wrap" as const, gap: 20,
                    }}>
                        <div>
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                                borderRadius: 16, padding: "3px 12px", marginBottom: 12,
                            }}>
                                <span style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
                                    Interview Report
                                </span>
                            </div>
                            <h1 style={{ color: "#f1f5f9", fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.01em" }}>
                                {candidateName}
                            </h1>
                            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
                                {jobPosition} · {difficulty} difficulty · {duration} min session
                            </p>
                        </div>

                        {/* Verdict badge */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "12px 20px",
                            background: verdict.bg, border: `1px solid ${verdict.border}`, borderRadius: 12,
                        }}>
                            <span style={{ fontSize: 18 }}>{verdict.icon}</span>
                            <div>
                                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
                                    Verdict
                                </div>
                                <div style={{ fontSize: 16, color: verdict.color, fontWeight: 800 }}>
                                    {verdict.label}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body ─────────────────────────────────────────────────────── */}
            <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px" }}>

                {/* Score row */}
                <div style={{
                    display: "grid", gridTemplateColumns: "auto 1fr", gap: 32,
                    padding: "32px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
                    animation: "fadeUp 0.5s ease 100ms both",
                }}>
                    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8 }}>
                        <div style={{ position: "relative" as const, width: 128, height: 128 }}>
                            <ScoreRing score={feedback.overallScore} size={128} />
                            <div style={{
                                position: "absolute" as const, inset: 0,
                                display: "flex", flexDirection: "column" as const,
                                alignItems: "center", justifyContent: "center",
                            }}>
                                <span style={{ fontSize: 30, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                                    {feedback.overallScore}
                                </span>
                                <span style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>/100</span>
                            </div>
                        </div>
                        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Overall</span>
                    </div>
                    <div style={{ paddingTop: 8 }}>
                        <MiniBar score={feedback.scoreBreakdown.technical} label="Technical Knowledge" color="#818cf8" />
                        <MiniBar score={feedback.scoreBreakdown.communication} label="Communication" color="#34d399" />
                        <MiniBar score={feedback.scoreBreakdown.problemSolving} label="Problem Solving" color="#f59e0b" />
                        <MiniBar score={feedback.scoreBreakdown.cultural} label="Culture Fit" color="#a78bfa" />
                    </div>
                </div>

                {/* Summary */}
                <div style={{
                    padding: "28px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
                    animation: "fadeUp 0.5s ease 180ms both",
                }}>
                    <p style={{
                        fontSize: 15, color: "#cbd5e1", lineHeight: 1.8, margin: 0,
                        borderLeft: "3px solid rgba(99,102,241,0.45)", paddingLeft: 18,
                        fontStyle: "italic" as const,
                    }}>
                        {feedback.summary}
                    </p>
                </div>

                {/* 2-column feedback grid */}
                <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr",
                    gap: "0 40px", paddingTop: 32,
                }}>
                    {/* Left */}
                    <div>
                        <Section title="Technical Strengths" delay={220}>
                            {feedback.technicalStrengths.map((s, i) => <Chip key={i} text={s} type="strength" />)}
                        </Section>
                        <Section title="Technical Weaknesses" delay={300}>
                            {feedback.technicalWeaknesses.map((s, i) => <Chip key={i} text={s} type="weakness" />)}
                        </Section>
                        <Section title="What to Add" delay={380}>
                            {feedback.toAdd.map((s, i) => <Chip key={i} text={s} type="add" />)}
                        </Section>
                    </div>
                    {/* Right */}
                    <div>
                        <Section title="Soft Skill Strengths" delay={260}>
                            {feedback.softStrengths.map((s, i) => <Chip key={i} text={s} type="strength" />)}
                        </Section>
                        <Section title="Soft Skill Weaknesses" delay={340}>
                            {feedback.softWeaknesses.map((s, i) => <Chip key={i} text={s} type="weakness" />)}
                        </Section>
                        <Section title="What to Remove" delay={420}>
                            {feedback.toRemove.map((s, i) => <Chip key={i} text={s} type="remove" />)}
                        </Section>
                    </div>
                </div>

                {/* Actions */}
                <div style={{
                    display: "flex", gap: 12,
                    paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 8,
                    animation: "fadeUp 0.5s ease 500ms both",
                }}>
                    <button onClick={() => navigate("/interview-start")} style={{
                        padding: "12px 24px",
                        background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)",
                        borderRadius: 10, color: "#a5b4fc", fontSize: 14, fontWeight: 600,
                        cursor: "pointer", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                    }}>Practice again</button>
                    <button onClick={() => navigate("/dashboard")} style={{
                        padding: "12px 24px",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        border: "none", borderRadius: 10, color: "#fff",
                        fontSize: 14, fontWeight: 600, cursor: "pointer",
                        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                    }}>Back to dashboard</button>
                </div>
            </div>
        </div>
    );
};

export default InterviewFeedback;