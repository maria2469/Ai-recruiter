import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "Free",
    desc: "Perfect for trying out AI Mock Interviewer",
    features: ["5 interviews/month", "Basic analytics", "Email support"],
  },
  {
    name: "Professional",
    price: "$49",
    desc: "For growing teams",
    features: ["50 interviews/month", "Advanced analytics", "Priority support", "Custom branding"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For large organizations",
    features: ["Unlimited interviews", "Full analytics suite", "Dedicated support", "API access", "SSO"],
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-[#0d1117] relative overflow-hidden">
      {/* Decorative floating shapes */}
      <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-purple-600/10 blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl animate-pulse-slow"></div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl font-bold text-white">Simple, Transparent Pricing</h2>
        <p className="mt-4 text-purple-300/60">Choose the plan that works for your team</p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-xl border p-8 text-left transition transform hover:-translate-y-2 hover:shadow-xl ${p.popular
                ? "border-purple-600 bg-gradient-to-tr from-purple-600/20 via-blue-500/20 to-cyan-400/10 shadow-purple-500/30"
                : "border-purple-800/30 bg-[#111827]"
                }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                  Most Popular
                </span>
              )}

              <h3 className="text-xl font-bold text-white mt-4">{p.name}</h3>
              <p className="mt-1 text-sm text-purple-300/60">{p.desc}</p>

              <p className={`mt-6 text-3xl font-extrabold ${p.popular ? "bg-gradient-to-r from-purple-500 to-blue-400 bg-clip-text text-transparent" : "text-white"}`}>
                {p.price}
                {p.price !== "Free" && p.price !== "Custom" && (
                  <span className="text-sm font-normal text-purple-300/60">/mo</span>
                )}
              </p>

              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-purple-300/60">
                    <Check className="h-4 w-4 text-purple-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={`mt-8 w-full ${p.popular ? "bg-purple-600 hover:bg-purple-500 text-white" : "border border-purple-500/30 text-purple-300 hover:bg-purple-600/10 hover:text-white"}`}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;