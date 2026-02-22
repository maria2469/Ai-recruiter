// src/pages/TakeInterview.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface Interview {
    jobPosition: string;
    jobDescription: string;
    duration: string;
    interview_id: string;
}

const TakeInterview = () => {
    const { interviewId } = useParams<{ interviewId: string }>();
    const navigate = useNavigate();

    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [candidateName, setCandidateName] = useState("");

    useEffect(() => {
        if (!interviewId) return;

        const fetchInterview = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("Interviews")
                .select("jobPosition, jobDescription, duration, interview_id")
                .eq("interview_id", interviewId)
                .single();

            if (error || !data) {
                setError("Interview not found or invalid link.");
                setLoading(false);
                return;
            }

            setInterview(data);
            setLoading(false);
        };

        fetchInterview();
    }, [interviewId]);

    const joinInterview = () => {
        if (!candidateName.trim()) {
            alert("Please enter your name to proceed.");
            return;
        }

        // Navigate to the new InterviewStart page
        navigate("/interview-start", {
            state: { interview, candidateName },
        });
    };

    if (loading)
        return (
            <p className="text-white text-center mt-20 text-lg">
                Loading interview...
            </p>
        );
    if (error)
        return (
            <p className="text-red-500 text-center mt-20 text-lg">{error}</p>
        );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0c1a] p-6 md:p-12">
            {/* Logo & App Name */}
            <div className="flex flex-col items-center mb-6">
                <img src="/logo.png" alt="App Logo" className="h-16 w-16 object-contain mb-2" />
                <h1 className="text-2xl font-bold text-white">AI Mock Interviewer</h1>
                <p className="text-sm text-purple-300/70">AI-Powered Interview Platform</p>
            </div>

            {/* Illustration */}
            <div className="w-full flex justify-center mb-6">
                <img
                    src="/interviewer.png"
                    alt="Interview Illustration"
                    className="w-3/5 max-w-md h-auto rounded-lg"
                />
            </div>

            {/* Position & Duration */}
            <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-white">
                    {interview?.jobPosition} Interview
                </h2>
                <p className="text-sm text-purple-300/70 mt-1">⏱ {interview?.duration}</p>
            </div>

            {/* Candidate Name Input */}
            <input
                type="text"
                placeholder="Enter your full name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full max-w-md px-4 py-3 mb-4 rounded-lg border border-purple-500/40 bg-[#141526] text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {/* Instructions */}
            <div className="w-full max-w-md bg-purple-950/20 border border-purple-500/30 rounded-lg p-4 mb-6 text-left text-sm text-purple-300">
                <p className="font-semibold mb-2">Before you begin</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Test your camera and microphone</li>
                    <li>Ensure you have a stable internet connection</li>
                    <li>Find a quiet place for interview</li>
                </ul>
            </div>

            {/* Join Interview Button */}
            <Button
                onClick={joinInterview}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white w-full max-w-md py-3 text-lg rounded-full shadow-lg shadow-purple-600/25"
            >
                <Camera className="h-5 w-5" />
                Join Interview
            </Button>
        </div>
    );
};

export default TakeInterview;