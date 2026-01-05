import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { demoCredentials } from "@/data/mockData";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(userId, password);

    if (result.success) {
      toast.success("Welcome back!", {
        description: "You have successfully logged in.",
      });

      // Route based on role
      if (userId === demoCredentials.admin.userId) {
        navigate("/admin");
      } else if (userId === demoCredentials.manager.userId) {
        navigate("/manager");
      } else {
        navigate("/staff");
      }
    } else {
      toast.error("Login failed", {
        description: result.error,
      });
    }

    setIsLoading(false);
  };

  const handleQuickLogin = (role: "admin" | "manager" | "staff") => {
    const creds = demoCredentials[role];
    setUserId(creds.userId);
    setPassword(creds.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <span className="text-3xl font-bold">ESWARI CRM</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6 animate-fade-in">
            Manage Your Real Estate
            <br />
            <span className="text-accent">Business Efficiently</span>
          </h1>

          <p className="text-lg text-white/80 max-w-md animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Streamline your leads, tasks, and team management with our comprehensive CRM solution designed for real
            estate professionals.
          </p>

          <div className="mt-12 flex gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="text-center">
              <div className="text-4xl font-bold">500+</div>
              <div className="text-white/70 text-sm">Active Leads</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">50+</div>
              <div className="text-white/70 text-sm">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">98%</div>
              <div className="text-white/70 text-sm">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-20 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-scale-in">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">PropertyCRM</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-foreground">
                User ID
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="userId"
                  type="text"
                  placeholder="Enter your User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="pl-12 h-12 input-field"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 input-field"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full h-12 btn-primary text-base font-medium" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 p-6 glass-card rounded-2xl">
            <p className="text-sm text-muted-foreground text-center mb-4">Quick login for demo:</p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin("admin")}
                className="text-xs"
              >
                Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin("manager")}
                className="text-xs"
              >
                Manager
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin("staff")}
                className="text-xs"
              >
                Staff
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
