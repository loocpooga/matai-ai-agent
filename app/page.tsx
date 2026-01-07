"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-white via-primary-50 to-white shadow-md border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Matai RAG
            </h1>
            <p className="text-sm text-gray-600">AI Knowledge Assistant · Documents auto-synced from Google Drive</p>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center mt-20">
              <div className="max-w-2xl mx-auto bg-gradient-to-br from-primary-50/50 to-accent-50/50 rounded-2xl p-8 mb-6">
                <div className="text-primary-600 text-5xl mb-4">💡</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Welcome to Matai RAG!
                </h2>
                <p className="text-gray-600 text-lg">
                  Ask questions about your documents. They're automatically synced from Google Drive every 15 minutes.
                </p>
              </div>
              <div className="max-w-2xl mx-auto">
                <p className="text-sm text-gray-500 mb-3 font-medium">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setInput("What services do you offer?")}
                    className="bg-white border-2 border-primary-200 hover:border-primary-600 px-4 py-2 rounded-full text-sm text-gray-700 hover:text-primary-600 transition-all duration-200 hover:shadow-md"
                  >
                    What services do you offer?
                  </button>
                  <button
                    onClick={() => setInput("How does your pricing work?")}
                    className="bg-white border-2 border-primary-200 hover:border-primary-600 px-4 py-2 rounded-full text-sm text-gray-700 hover:text-primary-600 transition-all duration-200 hover:shadow-md"
                  >
                    How does your pricing work?
                  </button>
                  <button
                    onClick={() => setInput("What's your typical process?")}
                    className="bg-white border-2 border-primary-200 hover:border-primary-600 px-4 py-2 rounded-full text-sm text-gray-700 hover:text-primary-600 transition-all duration-200 hover:shadow-md"
                  >
                    What's your typical process?
                  </button>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3xl px-6 py-4 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl rounded-tr-sm shadow-md"
                      : "bg-white text-gray-900 rounded-2xl rounded-tl-sm shadow-lg border-2 border-primary-100"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none leading-relaxed [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>*:last-child]:mb-0">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-3xl px-6 py-4 rounded-2xl rounded-tl-sm bg-white shadow-lg border-2 border-primary-100">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-lg p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question about your documents..."
              className="flex-1 px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
