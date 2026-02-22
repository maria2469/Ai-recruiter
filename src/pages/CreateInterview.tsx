import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Code2, Users, Brain, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,          
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const interviewTypes = [
    { id: "Technical", label: "Technical", icon: Code2 },
    { id: "Behavioral", label: "Behavioral", icon: Users },
    { id: "Problem Solving", label: "Problem Solving", icon: Brain },
    { id: "Situational", label: "Situational", icon: Shield },
];

const CreateInterview = () => {
    const navigate = useNavigate();

    const [jobPosition, setJobPosition] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [duration, setDuration] = useState("30");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) navigate("/auth");
        });
    }, [navigate]);

    const toggleType = (id: string) => {
        setSelectedTypes((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const cleanQuestionText = (text: string) => text.replace(/^\d+\.\s*/, "").trim();

    const handleGenerateQuestions = async () => {
        if (!jobPosition || !jobDescription || selectedTypes.length === 0) {
            alert("Please complete all required fields.");
            return;
        }

        setGenerating(true);
        setProgress(0);

        const progressInterval = setInterval(() => {
            setProgress((p) => Math.min(p + Math.random() * 10, 95));
        }, 300);

        try {
            const prompt = `Generate interview questions dynamically based on the following inputs:

Position: ${jobPosition}
Job Description: ${jobDescription}
Interview Duration: ${duration} minutes
Question Types to Include: ${selectedTypes.join(", ")}

Instructions:

1. Generate a total number of questions appropriate for the given interview duration.
   - 15 minutes → 6–8 questions
   - 30 minutes → 12–15 questions
   - 45 minutes → 18–22 questions
   - 60 minutes → 22–30 questions

2. Distribute questions proportionally across the selected question types.

3. Align technical depth strictly with the experience level and responsibilities mentioned in the job description.

4. Ensure questions:
   - Are concise but deep
   - Test real-world problem-solving
   - Reflect actual responsibilities in the job description
   - Avoid generic textbook-only questions
   - Include scenario-based questions if "Scenario" is selected
   - Include behavioral evaluation if "Behavioral" is selected

5. Do NOT include:
   - Greetings
   - Explanations
   - Section headings
   - Any text outside the required JSON

Return ONLY valid JSON in this exact format:

{
  "interviewQuestions": [
    {
      "question": "Question text here",
      "type": "Technical | Behavioral | Scenario | etc."
    }
  ]
}

No additional commentary.
No markdown.
No extra text before or after JSON.`; // Groq API prompt here

            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.2,
                    messages: [
                        { role: "system", content: "You are a strict JSON generator. Return JSON only." },
                        { role: "user", content: prompt },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            clearInterval(progressInterval);
            setProgress(100);

            const rawText = response.data?.choices?.[0]?.message?.content || "";
            let data;

            try {
                data = JSON.parse(rawText);
            } catch {
                const jsonStart = rawText.indexOf("{");
                const jsonEnd = rawText.lastIndexOf("}");
                data = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1));
            }

            const parsed = data.interviewQuestions
                .filter(
                    (q: any) => typeof q.question === "string" && typeof q.type === "string"
                )
                .map((q: any) => ({ question: cleanQuestionText(q.question), type: q.type }));

            navigate("/interview-questions", {
                state: {
                    questions: parsed,
                    jobPosition,
                    jobDescription,
                    duration,
                    selectedTypes,
                },
            });
        } catch (error: any) {
            console.error("Groq API Error:", error.response?.data || error.message);
            alert("Failed to generate interview questions.");
        } finally {
            setGenerating(false);
            setProgress(0);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d1117] flex flex-col">
            {/* Header Centered */}
            <header className="flex justify-center items-center p-8 border-b border-purple-800/30 gap-4">
                <img
                    src="/logo.png"
                    alt="AI Mock Interviewer Logo"
                    className="h-10 w-10 object-contain"
                />
                <h1 className="text-3xl font-bold text-white">Create Interview</h1>
            </header>

            <main className="flex-1 overflow-auto p-8">
                <div className="mx-auto max-w-4xl space-y-8">
                    {/* Form Card */}
                    <div className="rounded-xl border border-purple-800/30 bg-[#111827] p-8 shadow-sm space-y-6">
                        {/* Job Position */}
                        <div className="flex flex-col gap-2">
                            <Label className="text-purple-300">Job Position</Label>
                            <Input
                                value={jobPosition}
                                onChange={(e) => setJobPosition(e.target.value)}
                                className="bg-[#111827] border border-purple-800/30 focus:border-purple-500 focus:ring-purple-500 text-white placeholder-purple-300/60"
                                placeholder="Full Stack Developer"
                            />
                        </div>

                        {/* Job Description */}
                        <div className="flex flex-col gap-2">
                            <Label className="text-purple-300">Job Description</Label>
                            <Textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="bg-[#111827] border border-purple-800/30 focus:border-purple-500 focus:ring-purple-500 text-white placeholder-purple-300/60 min-h-[140px]"
                                placeholder="Describe the job responsibilities..."
                            />
                        </div>

                        {/* Duration */}
                        <div className="flex flex-col gap-2">
                            <Label className="text-purple-300">Duration</Label>
                            <Select value={duration} onValueChange={setDuration}>
                                <SelectTrigger className="bg-[#111827] border border-purple-800/30 text-white focus:border-purple-500 focus:ring-purple-500">
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111827] text-white">
                                    <SelectItem value="15">15 Min</SelectItem>
                                    <SelectItem value="30">30 Min</SelectItem>
                                    <SelectItem value="45">45 Min</SelectItem>
                                    <SelectItem value="60">60 Min</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Interview Types */}
                        <div className="flex flex-col gap-2">
                            <Label className="text-purple-300">Interview Types</Label>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {interviewTypes.map((type) => {
                                    const selected = selectedTypes.includes(type.id);
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => toggleType(type.id)}
                                            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition border ${selected
                                                    ? "bg-purple-700 text-white border-purple-700"
                                                    : "bg-[#111827] text-purple-300 border-purple-800/30 hover:bg-[#1b1b1b]"
                                                }`}
                                        >
                                            <type.icon className="h-4 w-4" />
                                            {type.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <div className="flex flex-col gap-2 mt-4">
                            <Button
                                onClick={handleGenerateQuestions}
                                disabled={generating}
                                className="w-full bg-purple-700 hover:bg-purple-800 text-white gap-2"
                            >
                                {generating ? "Generating..." : "Generate Questions"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            {generating && (
                                <div className="relative w-full h-2 bg-[#111827] rounded-full overflow-hidden">
                                    <div
                                        className="h-2 bg-purple-700 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateInterview;
