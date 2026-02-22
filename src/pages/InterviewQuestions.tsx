import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

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

const MAX_LENGTH = 160; // truncate length

const InterviewQuestions = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { questions } = location.state as { questions: Question[] };

    const [filter, setFilter] = useState<string>("All");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const filteredQuestions =
        filter === "All"
            ? questions
            : questions.filter((q) => q.type === filter);

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

                {/* Logo + Header Text */}
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

            {/* Progress */}
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
        </div>
    );
};

export default InterviewQuestions;