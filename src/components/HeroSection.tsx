import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardPreview from "./DashboardPreview";
import HeroCanvas from "./HeroCanvas";

const HeroSection = () => {
  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 30% 50%, hsl(225 40% 12%) 0%, hsl(220 25% 6%) 100%)",
      }}
    >
      {/* Animated Canvas Background */}
      <HeroCanvas />

      {/* Gradient overlay for text readability */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, transparent 60%)",
        }}
      />

      <div className="container relative z-10 mx-auto px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Text Column */}
          <div className="animate-fade-in">
            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
              </span>
              AI-Powered Interview Assistant
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
              AI Mock
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, hsl(260 100% 65%), hsl(240 90% 55%), hsl(280 80% 65%))",
                }}
              >
                Interviewer
                <br />
                for Recruiters
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-lg text-base leading-relaxed text-purple-100/60 md:text-lg">
              Conduct interviews effortlessly with AI that listens, scores, and provides
              instant insights. Make faster, fairer, and smarter hiring decisions.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="gap-2 rounded-full bg-purple-600 px-7 text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500 hover:shadow-purple-500/30"
              >
                Start Mock Interview <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full text-purple-300 hover:bg-purple-500/10 hover:text-white"
              >
                Watch Demo
              </Button>
            </div>

            {/* Mini stats */}
            <div className="mt-10 flex gap-8">
              {[
                { value: "10k+", label: "Mock Interviews" },
                { value: "95%", label: "Assessment Accuracy" },
                { value: "3x", label: "Faster Hiring" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-purple-300/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Column */}
          <div className="hidden md:block animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              {/* Glow behind preview */}
              <div
                className="absolute -inset-4 rounded-2xl opacity-30 blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, hsl(270 94% 50% / 0.4), transparent 70%)",
                }}
              />
              <div className="relative">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;