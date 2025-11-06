import Tesseract from 'tesseract.js';

/**
 * Extract text from an image using Tesseract.js (client-side OCR)
 * @param imageFile - Image file to process
 * @param onProgress - Optional progress callback (0-1)
 * @returns Extracted text
 */
export async function extractTextFromImage(
  imageFile: File | string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const result = await Tesseract.recognize(
      imageFile,
      'eng', // English language
      {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(m.progress);
          }
        },
      }
    );
    return result.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Parse book metadata from OCR text
 * Uses simple heuristics to identify title, author, ISBN, etc.
 */
export function parseBookMetadata(ocrText: string): {
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
} {
  const lines = ocrText.split('\n').filter(line => line.trim());

  // Simple heuristics - in production, use NLP/ML
  const isbnMatch = ocrText.match(/ISBN[:\s-]*([0-9-]{10,17})/i);

  // Assume first substantial line is title
  const title = lines.find(line => line.length > 3 && line.length < 100);

  // Look for "by" pattern for author
  const authorMatch = ocrText.match(/by[:\s]+([A-Za-z\s.]+)/i);

  // Look for publisher patterns
  const publisherMatch = ocrText.match(/published by[:\s]+([A-Za-z\s&.]+)/i) ||
                         ocrText.match(/publisher[:\s]+([A-Za-z\s&.]+)/i);

  // Look for edition
  const editionMatch = ocrText.match(/(\d+(?:st|nd|rd|th)\s+edition)/i);

  return {
    title: title?.trim(),
    author: authorMatch?.[1]?.trim(),
    isbn: isbnMatch?.[1]?.replace(/[^0-9X]/gi, ''),
    publisher: publisherMatch?.[1]?.trim(),
    edition: editionMatch?.[1]?.trim(),
  };
}

/**
 * Enrich book data using Open Library API (no key required)
 * This is optional and can be disabled via feature flag
 */
export async function enrichBookDataFromISBN(isbn: string): Promise<{
  title?: string;
  author?: string;
  publisher?: string;
  publishDate?: string;
  coverUrl?: string;
}> {
  try {
    const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
    if (!response.ok) throw new Error('Book not found');

    const data = await response.json();

    return {
      title: data.title,
      author: data.authors?.[0]?.name,
      publisher: data.publishers?.[0],
      publishDate: data.publish_date,
      coverUrl: data.cover ? `https://covers.openlibrary.org/b/id/${data.cover}-L.jpg` : undefined,
    };
  } catch (error) {
    console.warn('Open Library enrichment failed:', error);
    return {};
  }
}
