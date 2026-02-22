import { Clock, BarChart3, Users } from "lucide-react";

const features = [
  {
    icon: <Clock className="h-10 w-10 text-purple-400" />,
    title: "Save Time",
    description: "Automate initial screening interviews so you can focus on final candidate selection.",
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-blue-400" />,
    title: "Data-Driven Insights",
    description: "Receive detailed analytics and candidate comparisons based on AI interview responses.",
  },
  {
    icon: <Users className="h-10 w-10 text-cyan-400" />,
    title: "Reduce Bias",
    description: "Standardized AI interviews help minimize unconscious bias in your hiring process.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-[#0d1117] relative overflow-hidden">
      {/* Decorative floating shapes */}
      <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-purple-600/10 blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl animate-pulse-slow"></div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl font-bold text-white">
          Streamline Your Hiring Process
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-purple-300/60">
          AI Mock Interviewer helps you save time and hire better candidates with AI-powered mock interviews.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-purple-800/30 bg-[#111827] p-8 text-center transition transform hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-600/30"
            >
              <div className="mb-5 flex justify-center">{f.icon}</div>
              <h3 className="text-lg font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-purple-300/60">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;