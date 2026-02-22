// src/pages/InterviewStart.tsx
import { useLocation } from "react-router-dom";

const InterviewStart = () => {
    const location = useLocation();
    const { interview, candidateName } = location.state || {};

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0c1a]">
            <h1 className="text-3xl font-bold text-white text-center">
                🚧 Under Construction! 🚧
            </h1>
            <p className="text-purple-300 mt-4 text-center">
                {candidateName ? `Hello ${candidateName}, your interview for ${interview?.jobPosition} will start soon.` : ""}
            </p>
        </div>
    );
};

export default InterviewStart;