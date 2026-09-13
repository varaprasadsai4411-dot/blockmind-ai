import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";

type RequireAuthProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  redirectImmediately?: boolean;
};

export function RequireAuth({
  children,
  title = "Sign in to continue",
  description = "This page is available after you sign in.",
  redirectImmediately = false,
}: RequireAuthProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="text-sm text-muted-foreground">Checking your account…</div>
      </div>
    );
  }

  if (isAuthenticated) return <>{children}</>;

  const returnTo = `${location.pathname}${location.search}${location.hash}`;
  const authPath = `/auth?returnTo=${encodeURIComponent(returnTo)}`;

  if (redirectImmediately) {
    navigate(authPath, { replace: true });
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-2xl tracking-tight font-bold">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
        <button
          type="button"
          className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          onClick={() => navigate(authPath)}
        >
          Sign in
        </button>
      </section>
    </main>
  );
}
