import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getVectorStore } from "@/lib/vectorStore";

export async function POST(request: NextRequest) {
  try {
    // Debug: Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    console.log("API Key exists:", !!apiKey);
    console.log("API Key prefix:", apiKey?.substring(0, 10));

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Initialize OpenAI inside the function to ensure env vars are loaded
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    const userQuery = lastMessage.content;

    // Search vector store for relevant context
    const vectorStore = getVectorStore();
    const relevantDocs = await vectorStore.search(userQuery, 3);

    // Build context from relevant documents
    let context = "";
    if (relevantDocs.length > 0) {
      context = "Here is relevant information from the knowledge base:\n\n";
      relevantDocs.forEach((doc, i) => {
        context += `${doc.content}\n\n`;
      });
      context += "---\n\n";
    } else {
      context =
        "Note: No relevant documents found in the knowledge base. Please answer based on general knowledge.\n\n";
    }

    // Create system message with context
    const systemMessage = {
      role: "system" as const,
      content: `You are a helpful AI assistant for Matai Tech. Use the provided context to answer questions accurately and naturally. Answer as if you are representing the company directly. If the context doesn't contain relevant information, say so.

${context}`,
    };

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0].message.content;

    // Add metadata about sources used
    const sources = relevantDocs.map((doc) => ({
      source: doc.metadata.source,
      page: doc.metadata.page,
    }));

    return NextResponse.json({
      message: assistantMessage,
      sources: sources.length > 0 ? sources : null,
      documentsSearched: vectorStore.getCount(),
    });
  } catch (error: any) {
    console.error("Chat error:", error);

    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your .env file." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
