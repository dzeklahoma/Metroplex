import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

type Mode = "login" | "register";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getErrorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError = useMemo(() => {
    if (!email) return "Email is required";
    if (!isValidEmail(email)) return "Email is not valid";
    return null;
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  }, [password]);

  const canSubmit = !emailError && !passwordError && !submitting;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) return;

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password);
      }
      navigate("/trips", { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Auth failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Metroplex</h1>

          <div className="inline-flex rounded-xl border border-black/10 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                mode === "login" ? "bg-black text-white" : "hover:bg-black/5"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                mode === "register" ? "bg-black text-white" : "hover:bg-black/5"
              }`}
            >
              Register
            </button>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600">
          {mode === "login"
            ? "Sign in to manage your trips."
            : "Create an account to start planning."}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className={`mt-1 w-full rounded-xl border p-2 outline-none ${
                emailError ? "border-red-500" : "border-black/10"
              }`}
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
            />
            {email && emailError && (
              <div className="mt-1 text-sm text-red-600">{emailError}</div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className={`mt-1 w-full rounded-xl border p-2 outline-none ${
                passwordError ? "border-red-500" : "border-black/10"
              }`}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
            {password && passwordError && (
              <div className="mt-1 text-sm text-red-600">{passwordError}</div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-black py-2.5 font-medium text-white disabled:opacity-50"
          >
            {submitting
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          Backend: <span className="font-mono">/api/auth/*</span> • JWT stored
          in <span className="font-mono">localStorage</span>
        </div>
      </div>
    </div>
  );
}
