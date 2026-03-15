"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-teal" />
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}

function JoinContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "ready" | "joining" | "success" | "error" | "invalid">("loading");
  const [invite, setInvite] = useState<{ email: string; household_name: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    async function checkInvite() {
      const supabase = createClient();
      // Look up the invite
      const { data: inv, error: err } = await supabase
        .from("household_invites")
        .select("*, households(name)")
        .eq("token", token)
        .is("accepted_at", null)
        .single();

      if (err || !inv) {
        setStatus("invalid");
        return;
      }

      // Check if expired
      if (new Date(inv.expires_at) < new Date()) {
        setStatus("invalid");
        setError("This invite has expired.");
        return;
      }

      setInvite({
        email: inv.email,
        household_name: (inv.households as { name: string })?.name || "Family",
      });
      setStatus("ready");
    }

    checkInvite();
  }, [token]);

  const acceptInvite = async () => {
    setStatus("joining");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Not logged in — redirect to login with return URL
        window.location.href = `/login?redirect=/join?token=${token}`;
        return;
      }

      // Get the invite
      const { data: inv } = await supabase
        .from("household_invites")
        .select("*")
        .eq("token", token)
        .is("accepted_at", null)
        .single();

      if (!inv) {
        setStatus("error");
        setError("Invite not found or already used.");
        return;
      }

      // Update user's profile to join the household
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ household_id: inv.household_id })
        .eq("id", user.id);

      if (profileErr) throw profileErr;

      // Mark invite as accepted
      await supabase
        .from("household_invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", inv.id);

      // Update all existing data to the new household
      const tables = [
        "debts", "debt_payments", "net_worth_snapshots", "budget_categories",
        "expenses", "contacts", "legal_documents", "financial_accounts",
        "insurance_policies", "monthly_bills", "digital_access", "letter_of_intent", "action_items",
      ];
      for (const table of tables) {
        await supabase
          .from(table)
          .update({ household_id: inv.household_id })
          .eq("user_id", user.id);
      }

      setStatus("success");
    } catch (err) {
      console.error("Error accepting invite:", err);
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card rounded-xl border border-border p-8 text-center">
        <Shield className="w-12 h-12 text-teal mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">FamilyVault</h1>

        {status === "loading" && (
          <div className="py-8">
            <Loader2 className="w-8 h-8 animate-spin text-teal mx-auto" />
            <p className="text-muted mt-3">Checking invite...</p>
          </div>
        )}

        {status === "invalid" && (
          <div className="py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-foreground font-medium">Invalid or Expired Invite</p>
            <p className="text-muted text-sm mt-2">
              {error || "This invite link is no longer valid. Ask your family member to send a new one."}
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 px-4 py-2 bg-teal text-white rounded-lg font-medium hover:bg-teal/90 transition"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "ready" && invite && (
          <div className="py-6">
            <p className="text-foreground mb-1">You&apos;ve been invited to join</p>
            <p className="text-xl font-bold text-teal mb-6">{invite.household_name}</p>
            <p className="text-muted text-sm mb-6">
              Once you join, you&apos;ll share all financial data with this household.
              Any data you&apos;ve already added will be merged in.
            </p>
            <button
              onClick={acceptInvite}
              className="w-full px-4 py-3 bg-teal text-white rounded-lg font-medium hover:bg-teal/90 transition"
            >
              Accept & Join Household
            </button>
          </div>
        )}

        {status === "joining" && (
          <div className="py-8">
            <Loader2 className="w-8 h-8 animate-spin text-teal mx-auto" />
            <p className="text-muted mt-3">Joining household...</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-foreground font-medium">Welcome to the family!</p>
            <p className="text-muted text-sm mt-2">
              You now share all data with your household.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 px-4 py-3 bg-teal text-white rounded-lg font-medium hover:bg-teal/90 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-foreground font-medium">Error</p>
            <p className="text-muted text-sm mt-2">{error}</p>
            <button
              onClick={() => setStatus("ready")}
              className="inline-block mt-4 px-4 py-2 bg-teal text-white rounded-lg font-medium hover:bg-teal/90 transition"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
