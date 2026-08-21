import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ShieldCheck, X } from "lucide-react";

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

function isSafeRelative(next: string | null): next is string {
  return !!next && next.startsWith("/") && !next.startsWith("//");
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const oauth = (supabase.auth as any).oauth as OAuthApi | undefined;

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      if (!oauth) return setError("This backend does not expose OAuth authorization APIs.");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message ?? String(error));
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    if (!oauth) return;
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message ?? String(error));
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("No redirect returned by the authorization server.");
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-black text-white">
        <Card className="max-w-md w-full p-6 bg-zinc-900 border-zinc-800">
          <h1 className="text-xl font-semibold mb-2">Could not load this authorization</h1>
          <p className="text-sm text-zinc-400">{error}</p>
        </Card>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-black text-white">
        <div className="flex items-center gap-2 text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading authorization…
        </div>
      </main>
    );
  }

  const clientName = details.client?.name ?? details.client?.client_name ?? "an app";
  const redirectUri = details.client?.redirect_uris?.[0] ?? details.redirect_url ?? "";
  const scopes: string[] = (details.scope ?? details.scopes ?? "openid email profile")
    .toString()
    .split(/\s+/)
    .filter(Boolean);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-black text-white">
      <Card className="max-w-lg w-full p-6 bg-zinc-900 border-zinc-800 space-y-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <h1 className="text-xl font-semibold">Connect {clientName} to AI FitMind Care</h1>
        </div>
        <p className="text-sm text-zinc-400">
          {clientName} will be able to call this app's enabled tools while you are signed in. This
          does not bypass FitMind Care's permissions or backend policies.
        </p>
        {redirectUri && (
          <p className="text-xs text-zinc-500 break-all">Redirect: {redirectUri}</p>
        )}
        <div>
          <p className="text-sm font-medium mb-1">This connection can:</p>
          <ul className="text-sm text-zinc-300 list-disc pl-5 space-y-1">
            <li>Read your voice health logs, moods, symptoms, and nutrition entries</li>
            <li>Add new mood, symptom, nutrition, or biometric entries as you</li>
          </ul>
        </div>
        {scopes.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Identity scopes requested:</p>
            <div className="flex flex-wrap gap-2">
              {scopes.map((s) => (
                <span key={s} className="text-xs bg-zinc-800 px-2 py-1 rounded">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <Button onClick={() => decide(true)} disabled={busy} className="flex-1">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
          </Button>
          <Button onClick={() => decide(false)} disabled={busy} variant="secondary" className="flex-1">
            <X className="h-4 w-4 mr-1" /> Cancel connection
          </Button>
        </div>
      </Card>
    </main>
  );
}
