import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check } from "lucide-react";

const GenerateInterviewLink = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { interviewId, jobPosition, duration } = location.state as {
        interviewId: string;
        jobPosition: string;
        duration: string;
    };

    const [copied, setCopied] = useState(false);
    const interviewLink = `${window.location.origin}/take-interview/${interviewId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(interviewLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        const url = `https://wa.me/?text=You%20have%20been%20invited%20to%20an%20interview%20for%20${encodeURIComponent(
            jobPosition
        )}.%20Take%20the%20interview%20here:%20${encodeURIComponent(interviewLink)}`;
        window.open(url, "_blank");
    };

    const shareSlack = () => {
        const url = `https://slack.com/send?text=You%20have%20been%20invited%20to%20an%20interview%20for%20${encodeURIComponent(
            jobPosition
        )}.%20Take%20the%20interview%20here:%20${encodeURIComponent(interviewLink)}`;
        window.open(url, "_blank");
    };

    const shareEmail = () => {
        const subject = `Interview Invitation: ${jobPosition}`;
        const body = `You have been invited to take an interview for ${jobPosition}.\n\nTake the interview here: ${interviewLink}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(
            subject
        )}&body=${encodeURIComponent(body)}`;
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0d1117] p-6 md:p-12">
            {/* Status Message + Header - Centered */}
            <div className="flex flex-col items-center justify-center mb-12 w-full text-center gap-3">
                <div className="flex items-center gap-2 bg-green-700/20 text-green-400 px-4 py-2 rounded-full font-medium">
                    <Check className="h-5 w-5" />
                    ✅ Your interview is ready!
                </div>
                <img
                    src="/logo.png"
                    alt="Logo"
                    className="h-14 w-14 object-contain mt-2"
                />
                <h1 className="text-4xl font-bold text-white mb-2">
                    Share Interview Link
                </h1>
                <p className="text-sm text-purple-300 max-w-xl">
                    Send this interview link to candidates via WhatsApp, Slack, or Email.
                    They can click the link to start the interview instantly.
                </p>
            </div>

            {/* Link Card */}
            <div className="bg-[#111827] border border-purple-700 rounded-xl p-6 mb-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
                <span className="text-purple-300 break-all font-medium">{interviewLink}</span>
                <Button
                    onClick={handleCopy}
                    className="ml-0 md:ml-4 flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-6 py-2"
                >
                    <Copy className="h-4 w-4" /> {copied ? "Copied!" : "Copy"}
                </Button>
            </div>

            {/* Share Buttons Card */}
            <div className="bg-[#111827] border border-purple-700 rounded-xl p-6 shadow-md flex flex-col md:flex-row items-center justify-around gap-4">
                <Button
                    onClick={shareWhatsApp}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1 py-3"
                >
                    Share on WhatsApp
                </Button>
                <Button
                    onClick={shareSlack}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex-1 py-3"
                >
                    Share on Slack
                </Button>
                <Button
                    onClick={shareEmail}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1 py-3"
                >
                    Share via Email
                </Button>
            </div>
        </div>
    );
};

export default GenerateInterviewLink;