import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Loader2, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

export default function Auth() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/dashboard");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setEmailSent(true);
        toast.success("Magic link sent! Check your email.");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container py-4">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold w-fit">
            <Home className="h-6 w-6 text-primary" />
            <span>RoofSites</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {emailSent ? "Check your email" : "Welcome to RoofSites"}
            </CardTitle>
            <CardDescription>
              {emailSent 
                ? "We sent you a magic link to sign in" 
                : "Sign in with your email to get started"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click the link in your email to sign in. The link will expire in 1 hour.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setEmailSent(false)}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Try a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    disabled={loading}
                    required
                    className={error ? "border-destructive" : ""}
                  />
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending magic link...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send magic link
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
