import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

interface Question {
    question: string;
    type: string;
}

const badgeColors = {
    Technical: "bg-purple-700 text-white",
    Behavioral: "bg-green-700 text-white",
    "Problem Solving": "bg-blue-700 text-white",
    Situational: "bg-orange-700 text-white",
};

const MAX_LENGTH = 160;

const InterviewQuestions = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        questions,
        jobPosition,
        jobDescription,
        duration,
        selectedTypes,
    } = location.state as {
        questions: Question[];
        jobPosition: string;
        jobDescription: string;
        duration: string;
        selectedTypes: string[];
    };

    const [filter, setFilter] = useState<string>("All");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const filteredQuestions =
        filter === "All"
            ? questions
            : questions.filter((q) => q.type === filter);

    const handleConfirm = async () => {
        try {
            setSaving(true);

            const { data: { user } } = await supabase.auth.getUser();

            if (!user?.email) {
                alert("User not authenticated");
                setSaving(false);
                return;
            }

            const interviewId = crypto.randomUUID();

            // Insert interview into Supabase
            const { data, error } = await supabase
                .from("Interviews")
                .insert([
                    {
                        jobPosition,
                        jobDescription,
                        duration,
                        type: selectedTypes.join(", "),
                        questionList: questions as unknown as Database['public']['Tables']['Interviews']['Insert']['questionList'],
                        userEmail: user.email,
                        interview_id: interviewId,
                    },
                ])
                .select();

            if (error) {
                console.error("Insert error:", error);
                alert("Failed to save interview.");
                return;
            }

            console.log("Inserted row:", data);

            // ✅ Navigate to GenerateInterviewLink component
            navigate("/generate-link", {
                state: {
                    interviewId,
                    jobPosition,
                    duration,
                },
            });

        } catch (err: any) {
            console.error("Unexpected error:", err);
            alert("Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0d1117] p-6 md:p-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-purple-300 hover:text-white transition"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back
                </button>

                <div className="flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="AI Mock Interviewer Logo"
                        className="h-10 w-10 object-contain"
                    />
                    <h1 className="text-3xl font-bold text-white">
                        Generated Interview Questions
                    </h1>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
                {["All", "Technical", "Behavioral", "Problem Solving", "Situational"].map(
                    (type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-1 rounded-full text-sm font-medium transition ${filter === type
                                    ? "bg-purple-700 text-white"
                                    : "bg-[#111827] text-purple-300 hover:bg-purple-600/10"
                                }`}
                        >
                            {type}
                        </button>
                    )
                )}
            </div>

            <div className="mb-6 text-sm text-purple-300">
                Showing {filteredQuestions.length} of {questions.length} questions
            </div>

            {/* Questions Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {filteredQuestions.map((q, index) => {
                    const isLong = q.question.length > MAX_LENGTH;
                    const truncated = q.question.slice(0, MAX_LENGTH) + "...";

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`rounded-xl border border-purple-800/30 bg-[#111827] p-5 shadow-md transition ${isLong
                                    ? "hover:shadow-lg cursor-pointer transform hover:-translate-y-1"
                                    : ""
                                }`}
                            onClick={() =>
                                isLong && setExpandedIndex(expandedIndex === index ? null : index)
                            }
                        >
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-sm font-semibold text-white">
                                    {index + 1}. {isLong && expandedIndex !== index ? truncated : q.question}
                                </p>
                                <span
                                    className={`text-xs px-3 py-1 rounded-full font-medium ${badgeColors[q.type] || "bg-gray-600 text-white"
                                        }`}
                                >
                                    {q.type}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Confirm Button */}
            <div className="mt-10 flex justify-center">
                <Button
                    onClick={handleConfirm}
                    disabled={saving}
                    className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-2"
                >
                    {saving ? "Saving..." : "Save and Generate Interview Link"}
                </Button>
            </div>
        </div>
    );
};

export default InterviewQuestions;