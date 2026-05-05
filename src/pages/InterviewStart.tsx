// src/pages/InterviewStart.tsx
// Requires: npm install @vapi-ai/web
// Add to your .env: VITE_VAPI_PUBLIC_KEY=your_public_key_here

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Vapi from "@vapi-ai/web";
// ─── Types ────────────────────────────────────────────────────────────────────
interface Interview {
    jobPosition: string;
    jobDescription?: string;
    difficulty?: "easy" | "medium" | "hard";
    duration?: number; // minutes
}

interface LocationState {
    interview?: Interview;
    candidateName?: string;
}

type Phase = "setup" | "briefing" | "connecting" | "live";

interface Message {
    role: "assistant" | "user";
    text: string;
    timestamp: Date;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || "YOUR_VAPI_PUBLIC_KEY";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildInterviewerSystemPrompt(
    candidateName: string,
    jobPosition: string,
    jobDescription: string,
    difficulty: string,
    duration: number
): string {
    return `
You are Alex, a senior technical interviewer at a top-tier tech company. You are conducting a real ${duration}-minute ${difficulty}-level interview for the position of ${jobPosition}.

CANDIDATE NAME: ${candidateName}
ROLE: ${jobPosition}
JOB DESCRIPTION: ${jobDescription}
DIFFICULTY: ${difficulty}
DURATION: ${duration} minutes

## YOUR PERSONA
- Professional, sharp, and discerning — you've interviewed hundreds of candidates
- You ask follow-up questions when answers are vague or incomplete
- You challenge candidates respectfully but firmly
- You notice inconsistencies and probe them
- You are NOT overly encouraging — you keep a neutral, evaluative tone
- You occasionally note things like "interesting, tell me more" or pause before moving on

## INTERVIEW STRUCTURE
1. **Warm-up (2 min)**: Brief introduction, ask candidate to introduce themselves
2. **Background (3 min)**: Explore relevant experience from their background
3. **Core Technical Questions (60% of time)**: Ask 3-4 deep questions highly relevant to ${jobPosition} and the job description
4. **Behavioral (20% of time)**: STAR-method situational questions for this role
5. **Problem Solving (15% of time)**: A scenario or mini case study relevant to ${jobPosition}
6. **Candidate Questions (5% of time)**: Ask if they have questions for you

## QUESTION GUIDELINES FOR ${jobPosition}
- Questions must directly relate to the job description provided
- Ask about real challenges they faced, not hypotheticals only
- Probe depth: if they give a surface answer, dig deeper with "Can you walk me through the technical details?" or "What would you have done differently?"
- Call out buzzword-stuffing: if they say generic things like "I'm a team player", ask for a concrete example

## STYLE
- Keep each of YOUR turns to under 50 words unless reading out a technical question
- Don't summarize or praise after every answer — real interviewers don't
- Use natural speech fillers occasionally: "Right", "I see", "Okay"
- Sound like a real human on a phone/video call

## TIMING
- Keep track of the interview flow — don't linger too long on one section
- Around the ${duration - 2} minute mark, begin wrapping up
- End professionally: "Thanks ${candidateName}, we'll be in touch within the week. Any final questions for me?"

BEGIN: Start the interview by greeting ${candidateName} warmly but professionally and asking them to briefly introduce themselves.
`.trim();
}

function buildVapiAssistantConfig(
    candidateName: string,
    interview: Interview
): object {
    const jobPosition = interview.jobPosition || "Software Engineer";
    const jobDescription = interview.jobDescription || `A position requiring strong skills in ${jobPosition}`;
    const difficulty = interview.difficulty || "medium";
    const duration = interview.duration || 20;

    return {
        name: "Alex — AI Interviewer",
        firstMessage: `Hello ${candidateName}! I'm Alex, and I'll be conducting your interview today for the ${jobPosition} role. Thanks for joining. Let's get started — could you begin by telling me a little about yourself and your background?`,
        model: {
            provider: "openai",
            model: "gpt-4o",
            temperature: 0.6,
            maxTokens: 300,
            messages: [
                {
                    role: "system",
                    content: buildInterviewerSystemPrompt(
                        candidateName,
                        jobPosition,
                        jobDescription,
                        difficulty,
                        duration
                    ),
                },
            ],
        },
        voice: {
            provider: "11labs",
            voiceId: "ErXwobaYiN019PkySvjV", // Antoni — professional male voice
        },
        transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: "en-US",
        },
        endCallFunctionEnabled: true,
        endCallMessage: `Thank you ${candidateName}, it was great speaking with you. We'll review your interview and be in touch. Have a great day!`,
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: duration * 60,
        backgroundSound: "off",
    };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SetupForm({
    initialName,
    initialPosition,
    initialDescription,
    onStart,
}: {
    initialName: string;
    initialPosition: string;
    initialDescription: string;
    onStart: (data: { name: string; position: string; description: string; difficulty: string; duration: number }) => void;
}) {
    const [name, setName] = useState(initialName);
    const [position, setPosition] = useState(initialPosition);
    const [description, setDescription] = useState(initialDescription);
    const [difficulty, setDifficulty] = useState("medium");
    const [duration, setDuration] = useState(20);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Your name is required";
        if (!position.trim()) e.position = "Job position is required";
        if (!description.trim()) e.description = "Job description helps tailor the interview";
        return e;
    };

    const handleSubmit = () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        onStart({ name, position, description, difficulty, duration });
    };

    return (
        <div style={{
            maxWidth: 560,
            margin: "0 auto",
            padding: "2.5rem 0",
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        }}>
            {/* Header */}
            <div style={{ marginBottom: "2.5rem" }}>
                <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    borderRadius: 20,
                    padding: "4px 14px",
                    marginBottom: 16,
                }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#818cf8", display: "inline-block" }} />
                    <span style={{ fontSize: 12, color: "#818cf8", letterSpacing: "0.05em", textTransform: "uppercase" as const, fontWeight: 600 }}>
                        AI Interview Session
                    </span>
                </div>
                <h1 style={{ color: "#f1f5f9", fontSize: 28, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.25 }}>
                    Prepare for your interview
                </h1>
                <p style={{ color: "#94a3b8", fontSize: 15, margin: 0, lineHeight: 1.6 }}>
                    Our AI interviewer will adapt to your role and conduct a realistic session. Fill in the details below to begin.
                </p>
            </div>

            {/* Form fields */}
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>

                {/* Name */}
                <div>
                    <label style={labelStyle}>Your full name</label>
                    <input
                        value={name}
                        onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
                        placeholder="e.g. Sarah Chen"
                        style={{ ...inputStyle, ...(errors.name ? errorInputStyle : {}) }}
                    />
                    {errors.name && <span style={errorMsgStyle}>{errors.name}</span>}
                </div>

                {/* Job position */}
                <div>
                    <label style={labelStyle}>Job position</label>
                    <input
                        value={position}
                        onChange={e => { setPosition(e.target.value); setErrors(p => ({ ...p, position: "" })); }}
                        placeholder="e.g. Senior Frontend Engineer"
                        style={{ ...inputStyle, ...(errors.position ? errorInputStyle : {}) }}
                    />
                    {errors.position && <span style={errorMsgStyle}>{errors.position}</span>}
                </div>

                {/* Job description */}
                <div>
                    <label style={labelStyle}>Job description <span style={{ color: "#64748b", fontWeight: 400 }}>(paste or summarize)</span></label>
                    <textarea
                        value={description}
                        onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: "" })); }}
                        placeholder="Paste the job description or key requirements. The more detail, the more tailored your interview will be..."
                        rows={5}
                        style={{
                            ...inputStyle,
                            resize: "vertical" as const,
                            lineHeight: 1.6,
                            ...(errors.description ? errorInputStyle : {}),
                        }}
                    />
                    {errors.description && <span style={errorMsgStyle}>{errors.description}</span>}
                </div>

                {/* Difficulty + Duration row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Difficulty</label>
                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                            {(["easy", "medium", "hard"] as const).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    style={{
                                        flex: 1,
                                        padding: "8px 0",
                                        borderRadius: 8,
                                        border: difficulty === d
                                            ? `1px solid ${d === "easy" ? "#34d399" : d === "medium" ? "#f59e0b" : "#f87171"}`
                                            : "1px solid rgba(255,255,255,0.08)",
                                        background: difficulty === d
                                            ? d === "easy" ? "rgba(52,211,153,0.12)" : d === "medium" ? "rgba(245,158,11,0.12)" : "rgba(248,113,113,0.12)"
                                            : "rgba(255,255,255,0.04)",
                                        color: difficulty === d
                                            ? d === "easy" ? "#34d399" : d === "medium" ? "#f59e0b" : "#f87171"
                                            : "#64748b",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        textTransform: "capitalize" as const,
                                        transition: "all 0.15s",
                                    }}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Duration: <span style={{ color: "#a5b4fc", fontWeight: 600 }}>{duration} min</span></label>
                        <input
                            type="range"
                            min={10}
                            max={45}
                            step={5}
                            value={duration}
                            onChange={e => setDuration(Number(e.target.value))}
                            style={{ width: "100%", marginTop: 14, accentColor: "#818cf8" }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginTop: 2 }}>
                            <span>10 min</span><span>45 min</span>
                        </div>
                    </div>
                </div>

                {/* Tip */}
                <div style={{
                    background: "rgba(99,102,241,0.07)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                }}>
                    <span style={{ fontSize: 16, marginTop: 1 }}>💡</span>
                    <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                        <strong style={{ color: "#c7d2fe" }}>Tip:</strong> Use a quiet environment with headphones for the best experience. The AI interviewer will speak and listen in real time.
                    </p>
                </div>

                {/* CTA */}
                <button onClick={handleSubmit} style={ctaButtonStyle}>
                    Start Interview Session →
                </button>
            </div>
        </div>
    );
}

function LiveInterview({
    candidateName,
    interview,
    messages,
    isSpeaking,
    isListening,
    volumeLevel,
    duration,
    elapsed,
    onEnd,
}: {
    candidateName: string;
    interview: Interview;
    messages: Message[];
    isSpeaking: boolean;
    isListening: boolean;
    volumeLevel: number;
    duration: number;
    elapsed: number;
    onEnd: () => void;
}) {
    const msgEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const remaining = Math.max(0, duration * 60 - elapsed);
    const mins = Math.floor(remaining / 60).toString().padStart(2, "0");
    const secs = (remaining % 60).toString().padStart(2, "0");
    const progress = Math.min(1, elapsed / (duration * 60));

    const bars = 12;

    return (
        <div style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "2rem 0",
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        }}>
            {/* Top bar */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
                padding: "12px 20px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: "#f87171",
                        boxShadow: "0 0 0 3px rgba(248,113,113,0.25)",
                        animation: "pulse 1.5s ease-in-out infinite",
                    }} />
                    <span style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600 }}>Live Interview</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>— {interview.jobPosition}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ textAlign: "center" as const }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: remaining < 120 ? "#f87171" : "#f1f5f9", fontVariantNumeric: "tabular-nums" as const }}>
                            {mins}:{secs}
                        </div>
                        <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>remaining</div>
                    </div>
                    <button
                        onClick={onEnd}
                        style={{
                            padding: "7px 16px",
                            background: "rgba(248,113,113,0.12)",
                            border: "1px solid rgba(248,113,113,0.3)",
                            borderRadius: 8,
                            color: "#f87171",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        End call
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: "1.5rem", overflow: "hidden" }}>
                <div style={{
                    height: "100%",
                    width: `${progress * 100}%`,
                    background: progress > 0.85 ? "#f87171" : "linear-gradient(90deg, #818cf8, #a78bfa)",
                    transition: "width 1s linear",
                    borderRadius: 2,
                }} />
            </div>

            {/* Interviewer avatar + voice viz */}
            <div style={{
                display: "flex",
                flexDirection: "column" as const,
                alignItems: "center",
                gap: 16,
                marginBottom: "1.5rem",
                padding: "24px 20px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
            }}>
                {/* Avatar */}
                <div style={{ position: "relative" as const }}>
                    <div style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: isSpeaking
                            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                            : "rgba(99,102,241,0.15)",
                        border: `2px solid ${isSpeaking ? "#818cf8" : "rgba(99,102,241,0.25)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 28,
                        transition: "all 0.3s",
                        boxShadow: isSpeaking ? "0 0 24px rgba(129,140,248,0.3)" : "none",
                    }}>
                        🎙️
                    </div>
                    {isSpeaking && (
                        <div style={{
                            position: "absolute" as const,
                            bottom: 2,
                            right: 2,
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: "#34d399",
                            border: "2px solid #0f172a",
                        }} />
                    )}
                </div>

                <div style={{ textAlign: "center" as const }}>
                    <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 15 }}>Alex — AI Interviewer</div>
                    <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
                        {isSpeaking ? "Speaking..." : isListening ? `Listening to ${candidateName}...` : "Processing..."}
                    </div>
                </div>

                {/* Voice bars */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, height: 32 }}>
                    {Array.from({ length: bars }).map((_, i) => {
                        const active = isSpeaking || isListening;
                        const height = active
                            ? Math.max(4, Math.min(28, (volumeLevel * 28 + Math.sin(Date.now() / 200 + i) * 10 + 8)))
                            : 4;
                        return (
                            <div
                                key={i}
                                style={{
                                    width: 3,
                                    height: active ? `${height}px` : "4px",
                                    borderRadius: 2,
                                    background: isSpeaking
                                        ? `rgba(129,140,248,${0.4 + (i % 3) * 0.2})`
                                        : isListening
                                            ? `rgba(52,211,153,${0.4 + (i % 3) * 0.2})`
                                            : "rgba(255,255,255,0.08)",
                                    transition: "height 0.1s ease",
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Transcript */}
            <div style={{
                height: 280,
                overflowY: "auto" as const,
                display: "flex",
                flexDirection: "column" as const,
                gap: 12,
                padding: "0 4px",
            }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: "center" as const, color: "#475569", fontSize: 14, marginTop: 40 }}>
                        Transcript will appear here...
                    </div>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            flexDirection: m.role === "user" ? "row-reverse" as const : "row" as const,
                            gap: 10,
                            alignItems: "flex-start",
                        }}
                    >
                        <div style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: m.role === "assistant"
                                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                                : "rgba(52,211,153,0.2)",
                            border: `1px solid ${m.role === "assistant" ? "#818cf8" : "rgba(52,211,153,0.4)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            flexShrink: 0,
                        }}>
                            {m.role === "assistant" ? "🎙️" : "👤"}
                        </div>
                        <div style={{
                            maxWidth: "75%",
                            padding: "10px 14px",
                            borderRadius: m.role === "assistant"
                                ? "4px 14px 14px 14px"
                                : "14px 4px 14px 14px",
                            background: m.role === "assistant"
                                ? "rgba(99,102,241,0.1)"
                                : "rgba(52,211,153,0.08)",
                            border: `1px solid ${m.role === "assistant" ? "rgba(99,102,241,0.2)" : "rgba(52,211,153,0.15)"}`,
                            fontSize: 14,
                            color: "#e2e8f0",
                            lineHeight: 1.6,
                        }}>
                            {m.text}
                        </div>
                    </div>
                ))}
                <div ref={msgEndRef} />
            </div>

            {/* Candidate status */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 16,
                padding: "10px 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
                <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: isListening ? "#34d399" : "rgba(255,255,255,0.15)",
                    transition: "background 0.2s",
                }} />
                <span style={{ fontSize: 13, color: "#64748b" }}>
                    {isListening ? `${candidateName} — mic active` : "Microphone standby"}
                </span>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}

function EndScreen({
    candidateName,
    interview,
    duration,
    messageCount,
    onRestart,
}: {
    candidateName: string;
    interview: Interview;
    duration: number;
    messageCount: number;
    onRestart: () => void;
}) {
    const navigate = useNavigate();

    return (
        <div style={{
            maxWidth: 520,
            margin: "0 auto",
            padding: "3rem 0",
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            textAlign: "center" as const,
        }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
            <h2 style={{ color: "#f1f5f9", fontSize: 26, fontWeight: 700, margin: "0 0 10px" }}>
                Interview complete!
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 15, margin: "0 0 2rem", lineHeight: 1.6 }}>
                Well done, {candidateName}. You completed a {duration}-minute interview for <strong style={{ color: "#c7d2fe" }}>{interview.jobPosition}</strong>.
            </p>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: "2rem" }}>
                {[
                    { label: "Duration", value: `${duration} min` },
                    { label: "Exchanges", value: messageCount },
                    { label: "Difficulty", value: interview.difficulty || "medium" },
                ].map(s => (
                    <div key={s.label} style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12,
                        padding: "16px 12px",
                    }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, textTransform: "capitalize" as const }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={onRestart} style={{
                    padding: "12px 24px",
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    borderRadius: 10,
                    color: "#a5b4fc",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                }}>
                    Practice again
                </button>
                <button onClick={() => navigate("/")} style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                }}>
                    Back to dashboard
                </button>
            </div>
        </div>
    );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#94a3b8",
    marginBottom: 8,
    letterSpacing: "0.02em",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#f1f5f9",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    transition: "border-color 0.15s",
};

const errorInputStyle: React.CSSProperties = {
    borderColor: "rgba(248,113,113,0.5)",
};

const errorMsgStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    color: "#f87171",
    marginTop: 5,
};

const ctaButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 0",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    border: "none",
    borderRadius: 12,
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.01em",
    transition: "opacity 0.15s",
};

// ─── Main component ───────────────────────────────────────────────────────────
const InterviewStart = () => {
    const location = useLocation();
    const { interview: initialInterview, candidateName: initialName } = (location.state as LocationState) || {};
    const navigate = useNavigate();
    const [phase, setPhase] = useState<Phase>("setup");
    const [formData, setFormData] = useState<{
        name: string;
        position: string;
        description: string;
        difficulty: string;
        duration: number;
    } | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const vapiRef = useRef<Vapi | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    const cleanup = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (vapiRef.current) {
            try { vapiRef.current.stop(); } catch { /* ignore */ }
            vapiRef.current = null;
        }
    }, []);

    useEffect(() => () => cleanup(), [cleanup]);

    // ── Start call ────────────────────────────────────────────────────────────
    const startInterview = useCallback(async (data: typeof formData) => {
        if (!data) return;
        setFormData(data);
        setPhase("briefing");

        // Short briefing delay then connect
        setTimeout(async () => {
            setPhase("connecting");
            setError(null);
            setMessages([]);
            setElapsed(0);

            try {
                const vapi = new Vapi(VAPI_PUBLIC_KEY);
                vapiRef.current = vapi;

                // ── Event listeners ───────────────────────────────────────────
                vapi.on("call-start", () => {
                    setPhase("live");
                    timerRef.current = setInterval(() => {
                        setElapsed(s => s + 1);
                    }, 1000);
                });

                vapi.on("call-end", () => {
                    if (timerRef.current) clearInterval(timerRef.current);

                    navigate("/interview-feedback", {
                        state: {
                            candidateName: data.name,
                            interview: {
                                jobPosition: data.position,
                                jobDescription: data.description,
                                difficulty: data.difficulty,
                                duration: data.duration,
                            },
                            messages,
                            duration: data.duration,
                        },
                    });
                });

                vapi.on("speech-start", () => setIsSpeaking(true));
                vapi.on("speech-end", () => setIsSpeaking(false));

                vapi.on("message", (msg: any) => {
                    if (msg.type === "transcript" && msg.transcriptType === "final") {
                        setMessages(prev => [
                            ...prev,
                            {
                                role: msg.role as "assistant" | "user",
                                text: msg.transcript,
                                timestamp: new Date(),
                            },
                        ]);
                        if (msg.role === "user") {
                            setIsListening(false);
                        } else {
                            setIsListening(true);
                        }
                    }
                });

                vapi.on("volume-level", (vol: number) => {
                    setVolumeLevel(vol);
                });

                vapi.on("error", (err: any) => {
                    console.error("Vapi error:", err);
                    setError("Connection issue. Please check your microphone permissions and try again.");
                    setPhase("setup");
                    cleanup();
                });

                // ── Build interview config ────────────────────────────────────
                const interviewObj: Interview = {
                    jobPosition: data.position,
                    jobDescription: data.description,
                    difficulty: data.difficulty as Interview["difficulty"],
                    duration: data.duration,
                };

                const assistantConfig = buildVapiAssistantConfig(data.name, interviewObj);
                await vapi.start(assistantConfig as any);

            } catch (err: any) {
                console.error("Failed to start Vapi:", err);
                setError(err?.message || "Failed to start interview. Please try again.");
                setPhase("setup");
            }
        }, 3000);
    }, [cleanup]);

    const handleEnd = useCallback(() => {
        cleanup();

        if (formData) {
            navigate("/interview-feedback", {
                state: {
                    candidateName: formData.name,
                    interview: {
                        jobPosition: formData.position,
                        jobDescription: formData.description,
                        difficulty: formData.difficulty,
                        duration: formData.duration,
                    },
                    messages,
                    duration: formData.duration,
                },
            });
        }
    }, [cleanup, formData, messages, navigate]);

    const handleRestart = useCallback(() => {
        setFormData(null);
        setMessages([]);
        setElapsed(0);
        setError(null);
        setPhase("setup");
    }, []);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{
            minHeight: "100vh",
            background: "#0a0c1a",
            backgroundImage: "radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.06) 0%, transparent 60%)",
            padding: "0 24px",
        }}>
            {/* Error banner */}
            {error && (
                <div style={{
                    position: "fixed" as const,
                    top: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(248,113,113,0.15)",
                    border: "1px solid rgba(248,113,113,0.3)",
                    borderRadius: 10,
                    padding: "12px 20px",
                    color: "#fca5a5",
                    fontSize: 14,
                    zIndex: 1000,
                    maxWidth: 480,
                    textAlign: "center" as const,
                }}>
                    ⚠️ {error}
                    <button
                        onClick={() => setError(null)}
                        style={{ marginLeft: 12, background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16 }}
                    >×</button>
                </div>
            )}

            {/* Setup phase */}
            {phase === "setup" && (
                <SetupForm
                    initialName={initialName || ""}
                    initialPosition={initialInterview?.jobPosition || ""}
                    initialDescription={initialInterview?.jobDescription || ""}
                    onStart={startInterview}
                />
            )}

            {/* Briefing / connecting phase */}
            {(phase === "briefing" || phase === "connecting") && formData && (
                <div style={{
                    maxWidth: 480,
                    margin: "0 auto",
                    padding: "4rem 0",
                    textAlign: "center" as const,
                    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                }}>
                    <div style={{ fontSize: 52, marginBottom: 24 }}>
                        {phase === "briefing" ? "📋" : "🔌"}
                    </div>
                    <h2 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, margin: "0 0 12px" }}>
                        {phase === "briefing" ? "Preparing your session" : "Connecting to interviewer..."}
                    </h2>
                    <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 32px", lineHeight: 1.6 }}>
                        {phase === "briefing"
                            ? `We're setting up a ${formData.duration}-minute ${formData.difficulty} interview for ${formData.name} — ${formData.position}`
                            : "Allow microphone access when prompted. Alex will greet you shortly."}
                    </p>
                    {/* Spinner */}
                    <div style={{
                        width: 48,
                        height: 48,
                        margin: "0 auto",
                        border: "3px solid rgba(99,102,241,0.15)",
                        borderTop: "3px solid #818cf8",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {/* Live interview phase */}
            {phase === "live" && formData && (
                <LiveInterview
                    candidateName={formData.name}
                    interview={{
                        jobPosition: formData.position,
                        jobDescription: formData.description,
                        difficulty: formData.difficulty as Interview["difficulty"],
                        duration: formData.duration,
                    }}
                    messages={messages}
                    isSpeaking={isSpeaking}
                    isListening={isListening}
                    volumeLevel={volumeLevel}
                    duration={formData.duration}
                    elapsed={elapsed}
                    onEnd={handleEnd}
                />
            )}
        </div>
    );
};

export default InterviewStart;