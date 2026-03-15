"use client";

import { useState } from "react";
import { useHousehold, useProfile } from "@/lib/hooks/use-data";
import { Settings, Users, Mail, Trash2, Copy, Check, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { household, members, invites, loading, sendInvite, revokeInvite } = useHousehold();
  const { monthlyIncome, loading: profileLoading } = useProfile();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setSuccess("");
    setSending(true);
    try {
      const invite = await sendInvite(email.trim());
      setSuccess(`Invite created! Share this link with ${email}:`);
      setEmail("");
      // Copy invite link
      const link = `${window.location.origin}/join?token=${invite.token}`;
      await navigator.clipboard.writeText(link);
      setCopied(invite.id);
      setTimeout(() => setCopied(null), 3000);
    } catch (err) {
      setError("Failed to create invite. Make sure the email is valid.");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const copyInviteLink = async (invite: { id: string; token: string }) => {
    const link = `${window.location.origin}/join?token=${invite.token}`;
    await navigator.clipboard.writeText(link);
    setCopied(invite.id);
    setTimeout(() => setCopied(null), 3000);
  };

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Settings
        </h1>
        <p className="text-muted mt-1">Manage your household and account</p>
      </div>

      {/* Household Info */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-teal" />
          Household
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted">Household Name</label>
            <p className="text-foreground font-medium">{household?.name || "My Family"}</p>
          </div>

          <div>
            <label className="text-sm text-muted">Members</label>
            <div className="mt-1 space-y-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 py-2 px-3 bg-surface rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center text-teal font-medium text-sm">
                    {(m.display_name || "?")[0].toUpperCase()}
                  </div>
                  <span className="text-foreground">{m.display_name || "Unknown"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Member */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-teal" />
          Invite a Family Member
        </h2>
        <p className="text-sm text-muted mb-4">
          Send an invite link so your spouse or partner can join your household and see all the same data.
        </p>

        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal"
          />
          <button
            type="submit"
            disabled={sending || !email.trim()}
            className="px-4 py-2 bg-teal text-white rounded-lg font-medium hover:bg-teal/90 transition disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Invite"}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2">{success}</p>}

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted mb-2">Pending Invites</h3>
            <div className="space-y-2">
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-2 px-3 bg-surface rounded-lg"
                >
                  <div>
                    <span className="text-foreground text-sm">{inv.email}</span>
                    <span className="text-muted text-xs ml-2">
                      expires {new Date(inv.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyInviteLink(inv)}
                      className="p-1.5 rounded hover:bg-surface-hover transition"
                      title="Copy invite link"
                    >
                      {copied === inv.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted" />
                      )}
                    </button>
                    <button
                      onClick={() => revokeInvite(inv.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 transition"
                      title="Revoke invite"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Account</h2>
        <div>
          <label className="text-sm text-muted">Monthly Take-Home Income</label>
          <p className="text-foreground font-medium">
            ${monthlyIncome.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
