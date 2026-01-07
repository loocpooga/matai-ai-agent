// Document processing utilities

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;
    const chunk = text.slice(start, end);

    if (chunk.trim()) {
      chunks.push(chunk.trim());
    }

    start = end - overlap;
  }

  return chunks;
}

export function extractTextFromTxt(buffer: Buffer): string {
  return buffer.toString('utf-8');
}

// Helper to clean text
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
    .trim();
}
