import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Bot className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">
            AI <span className="font-normal">Mock Interviewer</span>
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-base font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-base font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="text-base font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
        </div>

        {/* Dashboard Button */}
        <Button
          size="sm"
          onClick={() => navigate("/auth")} // Use client-side navigation
        >
          Dashboard
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;