import { NextResponse } from "next/server";

// Manual upload is disabled - documents are now ingested via n8n workflow from Google Drive
export async function POST() {
  return NextResponse.json(
    {
      error: "Manual upload is disabled",
      message: "Documents are automatically synced from Google Drive every 15 minutes via n8n workflow. Please upload your .txt files to the 'Matai RAG Documents' folder in Google Drive.",
    },
    { status: 410 } // 410 Gone - resource no longer available
  );
}

export async function GET() {
  return NextResponse.json(
    {
      status: "disabled",
      message: "Manual upload is disabled. Documents are automatically synced from Google Drive.",
    },
    { status: 410 }
  );
}
