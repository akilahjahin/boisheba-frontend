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
 * Uses improved heuristics to identify title, author, ISBN, etc.
 */
export function parseBookMetadata(ocrText: string): {
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  year?: string;
} {
  const lines = ocrText.split('\n').filter(line => line.trim());

  // Enhanced ISBN detection patterns
  const isbnPatterns = [
    /ISBN[-\s]*13[:\s-]*([0-9-]{10,17})/gi,
    /ISBN[-\s]*10[:\s-]*([0-9-]{9,13})/gi,
    /(?:978|979)[-0-9-]{10,17}/gi,
    /(?:0|1)[-0-9-]{9,13}/gi
  ];

  let isbn = null;
  for (const pattern of isbnPatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      isbn = match[0].replace(/[^0-9X]/gi, '');
      break;
    }
  }

  // Enhanced title detection - look for common patterns
  const titlePatterns = [
    /^(Title:|Book:|BOOK:)\s*(.+)/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/,  // Capitalized words (likely titles)
    /^.{10,80}$/,  // Any line that's 10-80 chars (likely title)
  ];

  let title = null;
  for (const pattern of titlePatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      title = match[1]?.trim();
      break;
    }
  }

  // If no title found, use first non-empty line that's not too long
  if (!title) {
    for (const line of lines) {
      if (line.length > 3 && line.length < 80 && !line.match(/\d{4,}/)) {
        title = line.trim();
        break;
      }
    }
  }

  // Enhanced author detection - look for common patterns
  const authorPatterns = [
    /(?:by|author|written by|by\s+the\s+author)[:\s-]*([A-Za-z\s.]+)/i,
    /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/,  // Capitalized names
  ];

  let author = null;
  for (const pattern of authorPatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      author = match[1]?.trim();
      break;
    }
  }

  // If no author found, look for second line that might be author
  if (!author && lines.length > 1) {
    const secondLine = lines[1].trim();
    if (secondLine.length > 3 && secondLine.length < 50 && !secondLine.match(/\d{4,}/)) {
      author = secondLine;
    }
  }

  // Publisher detection
  const publisherPatterns = [
    /(?:published by|publisher|publishing house)[:\s-]*([A-Za-z\s&.]+)/i,
    /([A-Z][a-z]+\s+(?:Publishing|Publishers|Press|Books))/i,
  ];

  let publisher = null;
  for (const pattern of publisherPatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      publisher = match[1]?.trim();
      break;
    }
  }

  // Edition detection
  const editionPatterns = [
    /(\d+(?:st|nd|rd|th)\s+edition)/i,
    /(?:edition|ed|ver|version)[:\s-]*([\d.]+)/i,
  ];

  let edition = null;
  for (const pattern of editionPatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      edition = match[1]?.trim() || match[0];
      break;
    }
  }

  // Year detection
  const yearMatch = ocrText.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch?.[0];

  return {
    title: title?.trim(),
    author: author?.trim(),
    isbn: isbn,
    publisher: publisher?.trim(),
    edition: edition?.trim(),
    year: year,
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
  description?: string;
  subjects?: string[];
  pages?: number;
}> {
  try {
    // Clean ISBN to only digits
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');

    const response = await fetch(`https://openlibrary.org/isbn/${cleanIsbn}.json`);
    if (!response.ok) throw new Error('Book not found');

    const data = await response.json();

    // Extract additional data
    const description = data.description?.value || '';
    const subjects = data.subjects?.map((s: any) => s.name) || [];
    const pages = data.number_of_pages;

    return {
      title: data.title,
      author: data.authors?.[0]?.name,
      publisher: data.publishers?.[0],
      publishDate: data.publish_date,
      coverUrl: data.cover ? `https://covers.openlibrary.org/b/id/${data.cover}-L.jpg` : undefined,
      description,
      subjects,
      pages,
    };
  } catch (error) {
    console.warn('Open Library enrichment failed:', error);
    return {};
  }
}

/**
 * Create a fingerprint for image comparison
 * In production, replace with proper image hashing algorithm
 */
export function generateImageFingerprint(imageData: string): string {
  // Simple hash for demo purposes
  // TODO: Replace with proper perceptual hashing algorithm
  let hash = 0;
  for (let i = 0; i < imageData.length; i++) {
    const char = imageData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

/**
 * Compare two images and return diff information
 * This is a mock implementation for demo purposes
 */
export async function compareImages(
  beforeImage: string,
  afterImage: string
): Promise<{
  ssim: number;
  diffs: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    severity: 'minor' | 'moderate' | 'major';
  }>;
  suggestedFine: number;
  report: string;
}> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock comparison result
  // In a real implementation, this would use pixelmatch or similar library
  return {
    ssim: 0.92,
    diffs: [
      { x: 120, y: 50, w: 60, h: 40, severity: 'minor' },
      { x: 200, y: 150, w: 80, h: 30, severity: 'minor' },
      { x: 300, y: 200, w: 40, h: 60, severity: 'moderate' },
    ],
    suggestedFine: 75,
    report: "Minor pen marks on page 3 and slight crease on cover. Overall condition is good with minor cosmetic damage.",
  };
}