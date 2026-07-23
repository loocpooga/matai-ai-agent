import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";

export const maxDuration = 300;

// Rebuilds the Supabase knowledge base from the .txt files bundled with
// this deployment ("text files/" directory). Protected by ADMIN_SECRET.
//
//   curl -X POST https://<host>/api/reingest -H "x-admin-key: <ADMIN_SECRET>"

function chunkText(text: string, maxChars = 1400): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = "";

  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length > maxChars && current) {
      chunks.push(current.trim());
      current = p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export async function POST(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "ADMIN_SECRET is not configured on the server" },
      { status: 503 }
    );
  }
  if (request.headers.get("x-admin-key") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 503 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const dir = path.join(process.cwd(), "text files");

  let filenames: string[];
  try {
    filenames = fs.readdirSync(dir).filter((f) => f.endsWith(".txt"));
  } catch {
    return NextResponse.json(
      { error: `Knowledge directory not found at ${dir}` },
      { status: 500 }
    );
  }

  if (filenames.length === 0) {
    return NextResponse.json({ error: "No .txt files found" }, { status: 500 });
  }

  // Wipe existing knowledge (chunks cascade from documents)
  const { error: wipeError } = await supabase
    .from("documents")
    .delete()
    .not("id", "is", null);
  if (wipeError) {
    return NextResponse.json(
      { error: `Failed to clear old documents: ${wipeError.message}` },
      { status: 500 }
    );
  }

  const report: { file: string; chunks: number }[] = [];

  for (const filename of filenames) {
    const content = fs.readFileSync(path.join(dir, filename), "utf-8");
    const chunks = chunkText(content);

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({
        filename,
        file_path: `repo/text files/${filename}`,
        file_size: content.length,
        chunk_count: chunks.length,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { error: `Failed to insert document ${filename}: ${docError?.message}` },
        { status: 500 }
      );
    }

    const embeddings = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunks,
    });

    const rows = chunks.map((chunk, i) => ({
      document_id: doc.id,
      chunk_index: i,
      content: chunk,
      embedding: embeddings.data[i].embedding,
      token_count: Math.ceil(chunk.length / 4),
    }));

    const { error: chunkError } = await supabase
      .from("document_chunks")
      .insert(rows);
    if (chunkError) {
      return NextResponse.json(
        { error: `Failed to insert chunks for ${filename}: ${chunkError.message}` },
        { status: 500 }
      );
    }

    report.push({ file: filename, chunks: chunks.length });
  }

  return NextResponse.json({
    success: true,
    files: report,
    totalChunks: report.reduce((n, r) => n + r.chunks, 0),
  });
}
