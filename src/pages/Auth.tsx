import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import authIllustration from "@/assets/auth-illustration.png";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for login events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:8080",
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">
            Ai<span className="font-normal">cruiter</span>
          </span>
        </div>

        <div className="rounded-xl bg-primary/5 p-4">
          <img
            src={authIllustration}
            alt="AI Interview illustration"
            className="mx-auto h-48 w-auto object-contain"
          />
        </div>

        <div>
          <h1 className="text-xl font-bold text-foreground">
            Welcome to AiCruiter
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with Google
          </p>
        </div>

        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? "Signing in..." : "Login with Google"}
        </Button>
      </div>
    </div>
  );
};

export default Auth;