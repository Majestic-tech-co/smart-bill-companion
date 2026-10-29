import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

// Renders children only for a signed-in user; otherwise shows the sign-in screen.
export function AuthGate({ children }: { children: (session: Session) => ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabaseConfigured) {
    return (
      <AuthShell>
        <p className="text-sm text-muted-foreground">
          Sign-in isn't configured. Set <code className="font-mono">VITE_SUPABASE_URL</code> and{" "}
          <code className="font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code>, then rebuild.
        </p>
      </AuthShell>
    );
  }

  if (session === undefined) return <FullScreenLoader />;
  if (session === null) return <AuthForm />;
  return <>{children(session)}</>;
}

export function FullScreenLoader() {
  return (
    <div className="min-h-screen grid place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="h-12 w-12 rounded-xl grid place-items-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">
            Smart Bill<span className="text-gradient"> & Savings</span>
          </h1>
        </div>
        <div className="card-surface p-6">{children}</div>
      </div>
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = getSupabase();
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) setError(error.message);
        // No session means the project requires email confirmation first.
        else if (!data.session)
          setNotice("Check your email to confirm your account, then sign in.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v as "signin" | "signup");
          setError(null);
          setNotice(null);
        }}
      >
        <TabsList className="w-full grid grid-cols-2 bg-secondary/60">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Create account</TabsTrigger>
        </TabsList>
        {(["signin", "signup"] as const).map((m) => (
          <TabsContent key={m} value={m} className="mt-5">
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={`${m}-email`}>Email</Label>
                <Input
                  id={`${m}-email`}
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${m}-password`}>Password</Label>
                <Input
                  id={`${m}-password`}
                  type="password"
                  autoComplete={m === "signin" ? "current-password" : "new-password"}
                  minLength={m === "signup" ? 8 : undefined}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {m === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>
          </TabsContent>
        ))}
      </Tabs>
    </AuthShell>
  );
}
