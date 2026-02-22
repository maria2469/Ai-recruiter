const steps = [
  {
    num: "1",
    title: "Create Interview",
    desc: "Set up your interview questions and customize the AI interviewer to match your requirements.",
  },
  {
    num: "2",
    title: "Share with Candidates",
    desc: "Send interview links to candidates who can complete them at their convenience.",
  },
  {
    num: "3",
    title: "Review Results",
    desc: "Get AI-powered insights and detailed analysis of each candidate's responses.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="bg-[#0d1117] py-20 relative overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-purple-600/10 blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl animate-pulse-slow"></div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl font-bold text-white">
          How{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(260 100% 65%), hsl(240 90% 55%), hsl(280 80% 65%))",
            }}
          >
            AI Mock Interviewer
          </span>{" "}
          Works
        </h2>
        <p className="mt-4 text-purple-300/60">
          Three simple steps to transform your recruitment process
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className="flex flex-col items-center rounded-xl border border-purple-800/30 bg-[#111827] p-6 text-center transition transform hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-600/30"
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 text-white text-xl font-bold shadow-lg"
              >
                {s.num}
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm text-purple-300/60">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;