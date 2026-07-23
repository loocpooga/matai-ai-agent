import { NextRequest } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

export const maxDuration = 60;

const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 1500;

// The whole knowledge base is ~14KB, so it ships inside the prompt on every
// request: perfect recall, no vector database to maintain or break.
let knowledgeCache: string | null = null;
function getKnowledge(): string {
  if (knowledgeCache === null) {
    try {
      const dir = path.join(process.cwd(), "text files");
      knowledgeCache = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".txt"))
        .map((f) => fs.readFileSync(path.join(dir, f), "utf-8").trim())
        .join("\n\n==========\n\n");
    } catch (err) {
      console.error("Failed to load knowledge base:", err);
      knowledgeCache = "";
    }
  }
  return knowledgeCache;
}

// Best-effort per-instance rate limiting (serverless instances are ephemeral,
// but this still stops casual abuse from a single visitor)
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  hits.set(ip, timestamps);
  if (hits.size > 5000) hits.clear();
  return false;
}

const SYSTEM_PROMPT = `You are Fin, the assistant on the Matai Tech website (mataitech.co). Matai Tech is a one-person business: Luke Pauga connects the CRMs, spreadsheets, and tools that trades businesses (roofing, solar, HVAC, windows, pools) already run, so leads stop slipping and nobody retypes the same job into three systems.

Who you are:
- You are Fin, an AI assistant Luke built. You are not Luke. Refer to Luke in the third person ("Luke builds...", "he'll say so on the call").
- You are yourself a small proof of what Luke builds. If someone asks what you are, say so plainly.

Voice:
- Plainspoken and warm, like a sharp person, not a platform. Short sentences. Contractions are fine.
- Your readers are trades business owners. No jargon like "leverage", "seamless", "intelligent automation", or "solutions".
- Never use em dashes.

Honesty rules (non-negotiable):
- Answer ONLY from the knowledge base below. If it doesn't cover something, say you don't know and suggest asking Luke directly on a call.
- NEVER invent prices, numbers, case studies, clients, or capabilities.
- Never quote specific dollar amounts for Matai Tech's services. Pricing depends on scope; Luke quotes a fixed price after a free 30-minute call.
- Marquis Pools is the only client case study. Luke's broader trades experience is professional background, never "Matai client results".

Your goals, in order:
1. Answer the visitor's question accurately from the knowledge base.
2. When it fits naturally, point them to the free 30-minute call: https://cal.com/luke-pauga-hlurq5/30min
3. If a visitor shows real interest (asks about their specific situation, pricing, timelines, or how to start), offer to take their name and email or phone number so Luke can reach out. If they share contact details, use the capture_lead tool. Never pressure; offer once, not repeatedly.

Formatting: keep replies short (a few sentences, occasionally a short list). This is a small chat window, not a blog.`;

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "capture_lead",
      description:
        "Send a visitor's contact details to Luke. Use ONLY when the visitor has explicitly shared contact info and wants Luke to follow up.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Visitor's name" },
          contact: {
            type: "string",
            description: "Email address or phone number the visitor shared",
          },
          business: {
            type: "string",
            description: "Their business name or trade, if mentioned",
          },
          summary: {
            type: "string",
            description:
              "One or two sentences on what they need, based on the conversation",
          },
        },
        required: ["contact", "summary"],
      },
    },
  },
];

// Leads are delivered through Luke's own n8n instance
// (workflow "Fin - Lead Intake": webhook -> Gmail)
async function sendLeadEmail(args: {
  name?: string;
  contact: string;
  business?: string;
  summary: string;
}): Promise<boolean> {
  const webhookUrl = process.env.N8N_LEAD_WEBHOOK;
  if (!webhookUrl) {
    console.error("N8N_LEAD_WEBHOOK is not configured");
    return false;
  }
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: args.name || "",
        contact: args.contact,
        business: args.business || "",
        summary: args.summary,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "Not configured" }, { status: 500 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return Response.json(
      { error: "Too many messages. Give it a few minutes, or just email luke@mataitech.co." },
      { status: 429 }
    );
  }

  let body: { messages?: { role: string; content: string }[]; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawMessages = body.messages;
  if (!rawMessages || !Array.isArray(rawMessages) || rawMessages.length === 0) {
    return Response.json({ error: "Invalid messages format" }, { status: 400 });
  }

  const messages = rawMessages
    .slice(-MAX_MESSAGES)
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content.slice(0, MAX_MESSAGE_CHARS),
    }));

  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") {
    return Response.json({ error: "Last message must be from user" }, { status: 400 });
  }

  const sessionId = (body.sessionId || "anonymous").slice(0, 64);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const knowledge = getKnowledge();
  const systemContent = knowledge
    ? `${SYSTEM_PROMPT}\n\nKNOWLEDGE BASE:\n\n${knowledge}`
    : `${SYSTEM_PROMPT}\n\nKNOWLEDGE BASE: unavailable right now. Be honest that you can't look things up at the moment and point visitors to luke@mataitech.co or the booking link.`;

  const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemContent },
    ...messages,
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      let fullReply = "";

      try {
        // Up to two rounds: one that may call capture_lead, one to finish
        let round = 0;
        let currentMessages = chatMessages;

        while (round < 2) {
          round++;
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: currentMessages,
            temperature: 0.5,
            max_tokens: 500,
            stream: true,
            tools: round === 1 ? tools : undefined,
          });

          const toolCalls: { id: string; name: string; args: string }[] = [];
          let finishReason: string | null = null;

          for await (const chunk of completion) {
            const choice = chunk.choices[0];
            if (!choice) continue;
            const delta = choice.delta;

            if (delta?.content) {
              fullReply += delta.content;
              send({ t: "delta", v: delta.content });
            }

            for (const tc of delta?.tool_calls || []) {
              if (tc.index !== undefined) {
                if (!toolCalls[tc.index]) {
                  toolCalls[tc.index] = { id: tc.id || "", name: "", args: "" };
                }
                if (tc.id) toolCalls[tc.index].id = tc.id;
                if (tc.function?.name) toolCalls[tc.index].name += tc.function.name;
                if (tc.function?.arguments)
                  toolCalls[tc.index].args += tc.function.arguments;
              }
            }

            if (choice.finish_reason) finishReason = choice.finish_reason;
          }

          if (finishReason === "tool_calls" && toolCalls.length > 0) {
            const call = toolCalls[0];
            let ok = false;
            if (call.name === "capture_lead") {
              try {
                const args = JSON.parse(call.args);
                if (args.contact) ok = await sendLeadEmail(args);
              } catch {
                ok = false;
              }
            }
            currentMessages = [
              ...currentMessages,
              {
                role: "assistant",
                tool_calls: [
                  {
                    id: call.id,
                    type: "function" as const,
                    function: { name: call.name, arguments: call.args },
                  },
                ],
              },
              {
                role: "tool",
                tool_call_id: call.id,
                content: ok
                  ? "Lead sent to Luke successfully. Confirm to the visitor that Luke will reach out."
                  : "Sending failed. Apologize briefly and give the visitor Luke's email (luke@mataitech.co) instead.",
              },
            ];
            continue; // second round streams the confirmation
          }

          break;
        }

        send({ t: "done" });
        controller.close();

        // Structured log line: readable in the Vercel dashboard's function logs
        console.log(
          JSON.stringify({
            fin_exchange: {
              session: sessionId,
              user: last.content.slice(0, 300),
              fin: fullReply.slice(0, 300),
            },
          })
        );
      } catch (err) {
        console.error("Chat error:", err instanceof Error ? err.message : err);
        send({
          t: "error",
          v: "Something went wrong on my end. Try again, or email luke@mataitech.co.",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
