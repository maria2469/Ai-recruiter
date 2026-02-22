import { Bot } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-purple-800/30 bg-[#0d1117] py-12 relative overflow-hidden">
      {/* Decorative floating shapes */}
      <div className="absolute -top-10 -left-10 h-24 w-24 rounded-full bg-purple-600/10 blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl animate-pulse-slow"></div>

      <div className="container mx-auto flex flex-col items-center gap-4 px-6 text-center md:flex-row md:justify-between md:text-left relative z-10">
        <div className="flex items-center gap-2 text-white">
          <Bot className="h-5 w-5 text-purple-400" />
          <span className="font-bold text-white">
            Ai <span className="font-normal text-purple-300/70">Mock Interviewer</span>
          </span>
        </div>
        <p className="text-sm text-purple-300/60">
          © 2024 Ai Mock Interviewer. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;