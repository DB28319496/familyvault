import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { assistantTools, runAssistantTool } from "@/lib/assistant/tools";

// The Vault Assistant: a streaming, tool-grounded financial / family-legacy
// specialist. Runs server-side so ANTHROPIC_API_KEY never reaches the browser.

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `You are the FamilyVault Assistant — a calm, knowledgeable specialist in family financial preparedness, estate planning, and legacy/emergency readiness.

FamilyVault is an app where a household organizes its financial accounts, debts, insurance, legal documents, key contacts, monthly bills, digital access, a letter of intent, and a preparedness action plan — so that if something happens to a parent, the family is protected and nothing critical is lost.

How you work:
- Ground every answer in the household's actual data. Use the provided tools to look things up before answering questions about their money, coverage, documents, or plan. Do not guess at numbers you can fetch.
- Be specific and practical. Reference their real figures, carriers, and gaps. Prioritize what matters most for protecting the family.
- When you spot a meaningful gap (e.g. no will, missing beneficiaries, underinsurance relative to net worth, undocumented digital access), point it out plainly and suggest a concrete next step.
- You can add tasks to their action plan with create_action_item — but propose the task and get the user's agreement first, then confirm once it's added.
- Keep responses focused and readable. Lead with the answer, then the supporting detail.

Important boundaries: You provide general educational guidance, not legal, tax, or investment advice. For binding decisions (drafting a will, tax strategy, large investment moves), recommend they confirm with a licensed professional — and offer to note the relevant contact if one is on file.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "AI assistant is not configured." }),
      { status: 503, headers: { "content-type": "application/json" } }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const history = (body.messages ?? [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-20);
  if (history.length === 0) {
    return new Response(JSON.stringify({ error: "No messages provided" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // The signed-in user's household, used to scope writes.
  const { data: profile } = await supabase
    .from("profiles")
    .select("household_id")
    .eq("id", user.id)
    .maybeSingle();
  const householdId = profile?.household_id ?? null;

  const anthropic = new Anthropic({ apiKey });

  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (text: string) => controller.enqueue(encoder.encode(text));
      try {
        // Tool-use loop: stream each turn; if the model calls tools, run them
        // and continue; stop when it answers without tools.
        for (let round = 0; round < 6; round++) {
          const turn = anthropic.messages.stream({
            model: MODEL,
            max_tokens: 4096,
            system: [
              {
                type: "text",
                text: SYSTEM_PROMPT,
                cache_control: { type: "ephemeral" },
              },
            ],
            tools: assistantTools,
            messages,
          });

          turn.on("text", (delta) => send(delta));

          const final = await turn.finalMessage();
          messages.push({ role: "assistant", content: final.content });

          if (final.stop_reason !== "tool_use") break;

          const toolUses = final.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
          );
          const results: Anthropic.ToolResultBlockParam[] = [];
          for (const tu of toolUses) {
            const out = await runAssistantTool(
              supabase,
              user.id,
              householdId,
              tu.name,
              (tu.input ?? {}) as Record<string, unknown>
            );
            results.push({
              type: "tool_result",
              tool_use_id: tu.id,
              content: JSON.stringify(out),
            });
          }
          messages.push({ role: "user", content: results });
        }
      } catch (err) {
        console.error("Assistant error:", err);
        send("\n\n_Sorry — something went wrong reaching the assistant._");
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
