import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, X, BookOpen } from 'lucide-react';
import { performOcr, OcrResponse, BookCategory } from '@/utils/api';
import { uploadImage } from '@/lib/supabase';
import { toast } from 'sonner';

export interface OcrMetadata {
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  category?: BookCategory;
  publicationYear?: number;
  language?: string;
  description?: string;
}

interface UploadImageProps {
  onImageUploaded: (imageUrl: string, file?: File) => void;
  onMetadataExtracted?: (metadata: OcrMetadata | null) => void;
  showOCR?: boolean;
}

const sanitizeText = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  const dequoted = trimmed.replace(/^['"]+|['"]+$/g, "").trim();
  return dequoted.length > 0 ? dequoted : undefined;
};

const normalizeCategory = (value?: string | null): BookCategory | undefined => {
  const sanitized = sanitizeText(value);
  if (!sanitized) return undefined;
  const normalized = sanitized.toUpperCase().replace(/[-\s]+/g, "_");
  return (Object.values(BookCategory) as string[]).includes(normalized)
    ? (normalized as BookCategory)
    : undefined;
};

const parsePublicationYear = (value?: string | null): number | undefined => {
  const sanitized = sanitizeText(value);
  if (!sanitized) return undefined;
  const match = sanitized.match(/(19|20)\d{2}/);
  return match ? Number.parseInt(match[0], 10) : undefined;
};

const mapOcrResponseToMetadata = (response: OcrResponse): OcrMetadata => ({
  title: sanitizeText(response.title),
  author: sanitizeText(response.author),
  isbn: sanitizeText(response.isbn),
  publisher: sanitizeText(response.publisher),
  edition: sanitizeText(response.edition),
  category: normalizeCategory(response.category),
  publicationYear: parsePublicationYear(response.publication_year),
  language: sanitizeText(response.language),
  description: sanitizeText(response.description),
});

const hasMetadataValues = (metadata: OcrMetadata): boolean =>
  Object.values(metadata).some((value) => value !== undefined && value !== null && value !== '');

const mergeMetadata = (base: OcrMetadata, extra: OcrMetadata): OcrMetadata => {
  const result: OcrMetadata = { ...base };
  const typedResult = result as Record<keyof OcrMetadata, string | number | BookCategory | undefined>;
  const typedExtra = extra as Record<keyof OcrMetadata, string | number | BookCategory | undefined>;

  for (const key of Object.keys(typedExtra) as Array<keyof OcrMetadata>) {
    const value = typedExtra[key];
    if (value === undefined || value === null || (typeof value === 'string' && value.length === 0)) {
      continue;
    }

    const current = typedResult[key];
    if (current === undefined || current === null || (typeof current === 'string' && current.length === 0)) {
      typedResult[key] = value;
    }
  }

  return result;
};

const extractJsonObject = (input: string): string | null => {
  if (!input) return null;
  const codeBlockMatch = input.match(/```(?:json)?\s*([\s\S]+?)\s*```/i);
  const candidate = codeBlockMatch ? codeBlockMatch[1] : input;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  return candidate.slice(start, end + 1);
};

const parseMetadataFromJson = (input: string): OcrMetadata => {
  const metadata: OcrMetadata = {};
  const jsonSegment = extractJsonObject(input);
  if (!jsonSegment) return metadata;

  try {
    const parsed = JSON.parse(jsonSegment);
    const candidate = Array.isArray(parsed) ? parsed[0] : parsed;
    if (!candidate || typeof candidate !== 'object') {
      return metadata;
    }

    const record = candidate as Record<string, unknown>;
    const stringFromKeys = (...keys: string[]): string | undefined => {
      for (const key of keys) {
        if (!(key in record)) continue;
        const value = record[key];
        if (typeof value === 'string') return value;
        if (typeof value === 'number' && Number.isFinite(value)) {
          return value.toString();
        }
      }
      return undefined;
    };

    const title = sanitizeText(stringFromKeys('title', 'Title'));
    if (title) metadata.title = title;

    const author = sanitizeText(stringFromKeys('author', 'Author', 'writer', 'Writer'));
    if (author) metadata.author = author;

    const isbnRaw = sanitizeText(stringFromKeys('isbn', 'ISBN'));
    if (isbnRaw) {
      const cleaned = isbnRaw.replace(/[^0-9Xx-]/g, '');
      metadata.isbn = cleaned.length > 0 ? cleaned : isbnRaw;
    }

    const publisher = sanitizeText(stringFromKeys('publisher', 'Publisher'));
    if (publisher) metadata.publisher = publisher;

    const edition = sanitizeText(stringFromKeys('edition', 'Edition'));
    if (edition) metadata.edition = edition;

    const categoryRaw = stringFromKeys('category', 'Category');
    const normalizedCategory = normalizeCategory(categoryRaw);
    if (normalizedCategory) metadata.category = normalizedCategory;

    const language = sanitizeText(stringFromKeys('language', 'Language'));
    if (language) metadata.language = language;

    const description = sanitizeText(stringFromKeys('description', 'Description', 'summary', 'Summary'));
    if (description) metadata.description = description;

    const yearValue = stringFromKeys('publication_year', 'publicationYear', 'year', 'Year');
    const publicationYear = parsePublicationYear(yearValue);
    if (publicationYear) metadata.publicationYear = publicationYear;
  } catch (error) {
    console.warn('Failed to parse JSON OCR metadata', error);
  }

  return metadata;
};

const parseMetadataFromText = (ocrText: string): OcrMetadata => {
  if (!ocrText) {
    return {};
  }

  const metadata: OcrMetadata = {};
  const jsonSegment = extractJsonObject(ocrText);
  const withoutJson = jsonSegment ? ocrText.replace(jsonSegment, ' ') : ocrText;
  const cleanedText = withoutJson
    .replace(/```(?:json)?/gi, '')
    .replace(/```/g, '');

  const isbnMatch = cleanedText.match(/ISBN[-:\s]*([\dXx-]{10,17})/i);
  if (isbnMatch) {
    const cleanedIsbn = isbnMatch[1].replace(/[^0-9Xx]/g, '');
    if (cleanedIsbn.length > 0) {
      metadata.isbn = cleanedIsbn;
    }
  }

  const lines = cleanedText
    .split(/\r?\n/)
    .map((line) => sanitizeText(line))
    .filter((line): line is string => Boolean(line));

  if (!metadata.title && lines.length > 0) {
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.startsWith('title') || lower.startsWith('author') || lower.startsWith('isbn')) {
        continue;
      }
      if (line.length >= 3 && line.length <= 200 && !line.match(/ISBN|copyright|page|chapter/i)) {
        metadata.title = line;
        break;
      }
    }
  }

  if (!metadata.author) {
    for (let i = 0; i < lines.length; i++) {
      const authorMatch = lines[i].match(/by[\s:]+(.+)/i);
      if (authorMatch) {
        const author = sanitizeText(authorMatch[1]);
        if (author) {
          metadata.author = author;
          break;
        }
      }
      if (!metadata.author && i > 0) {
        const candidate = lines[i];
        const lower = candidate.toLowerCase();
        if (lower.startsWith('author') || lower.startsWith('isbn') || lower.startsWith('publisher')) {
          continue;
        }
        if (candidate.length > 3 && candidate.length < 100) {
          metadata.author = candidate;
          break;
        }
      }
    }
  }

  if (!metadata.publisher) {
    const publisherMatch = cleanedText.match(/(?:published by|publisher)[:\s]+(.+)/i);
    if (publisherMatch) {
      const publisher = sanitizeText(publisherMatch[1].split('\n')[0]);
      if (publisher) {
        metadata.publisher = publisher;
      }
    }
  }

  if (!metadata.publicationYear) {
    const yearMatch = cleanedText.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      const parsedYear = Number.parseInt(yearMatch[0], 10);
      if (!Number.isNaN(parsedYear)) {
        metadata.publicationYear = parsedYear;
      }
    }
  }

  if (!metadata.category) {
    for (const category of Object.values(BookCategory)) {
      const label = category.replace(/_/g, ' ');
      const pattern = new RegExp(`\\b${label.replace(/\s+/g, '\\s+')}\\b`, 'i');
      if (pattern.test(cleanedText)) {
        metadata.category = category;
        break;
      }
    }
  }

  return metadata;
};

export default function UploadImage({ onImageUploaded, onMetadataExtracted, showOCR = true }: UploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrMetadata | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Create preview for UI
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setIsProcessing(true);
    toast.info('Uploading image to storage...');
    
    try {
      const imageUrl = await uploadImage(file, 'book-images', 'covers');
      console.log('Image uploaded to:', imageUrl);
      onImageUploaded(imageUrl, file);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      setImagePreview(null);
      setIsProcessing(false);
      return;
    }

    // Process with OCR if enabled
    if (showOCR) {
      setOcrResult(null);
      toast.info('Processing image with backend OCR...');

      try {
        const ocrResponse: OcrResponse = await performOcr(file);

        if (ocrResponse.error) {
          throw new Error(ocrResponse.error);
        }

        let metadata = mapOcrResponseToMetadata(ocrResponse);
        console.debug('OCR response payload:', ocrResponse);
        console.debug('Mapped metadata from OCR response:', metadata);

        const rawText = (ocrResponse as Record<string, unknown>).extracted_text;
        if (typeof rawText === 'string' && rawText.trim().length > 0) {
          const jsonMetadata = parseMetadataFromJson(rawText);
          if (hasMetadataValues(jsonMetadata)) {
            console.debug('Parsed metadata from JSON payload:', jsonMetadata);
          }
          metadata = mergeMetadata(metadata, jsonMetadata);

          const fallbackMetadata = parseMetadataFromText(rawText);
          if (hasMetadataValues(fallbackMetadata)) {
            console.debug('Parsed metadata from OCR text fallback:', fallbackMetadata);
          }
          metadata = mergeMetadata(metadata, fallbackMetadata);
        }

        if (hasMetadataValues(metadata)) {
          setOcrResult(metadata);
          if (onMetadataExtracted) {
            onMetadataExtracted(metadata);
          }
          toast.success('Book details extracted successfully!');
        } else {
          setOcrResult(null);
          if (onMetadataExtracted) {
            onMetadataExtracted(null);
          }
          toast.info('Image uploaded, but no book data was detected. Please fill in the details manually.');
        }
      } catch (error) {
        console.error('OCR Error:', error);
        
        // More specific error handling
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (errorMessage.includes('400 Bad Request')) {
          toast.warning('OCR service had an issue processing this image. Image uploaded successfully - please fill in book details manually.');
          console.warn('Backend OCR failed, but image upload succeeded. User can proceed manually.');
        } else if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch')) {
          toast.warning('Could not reach OCR service. Image uploaded successfully - please fill in book details manually.');
          console.warn('OCR service unavailable, but image upload succeeded.');
        } else {
          toast.warning('Could not extract book details automatically. Image uploaded successfully - please fill in details manually.');
        }

        // Don't block the user - image is already uploaded
        if (onMetadataExtracted) {
          onMetadataExtracted(null);
        }
      } finally {
        setIsProcessing(false);
      }
    } else {
      setIsProcessing(false);
      if (onMetadataExtracted) {
        onMetadataExtracted(null);
      }
    }
  };

  const parseBookMetadata = (ocrText: string): OcrMetadata => {
    if (!ocrText) {
      return {};
    }

    const metadata: OcrMetadata = {};

    // Extract ISBN
    const isbnMatch = ocrText.match(/ISBN[-:\s]*([\d-]{10,17})/i);
    if (isbnMatch) {
      const cleanedIsbn = isbnMatch[1].replace(/[^0-9X]/gi, '');
      metadata.isbn = cleanedIsbn.length > 0 ? cleanedIsbn : undefined;
    }

    const lines = ocrText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Extract title
    if (lines.length > 0) {
      for (const line of lines) {
        if (line.length >= 3 && line.length <= 200 && !line.match(/ISBN|copyright|page|chapter/i)) {
          const sanitizedTitle = sanitizeText(line);
          if (sanitizedTitle) {
            metadata.title = sanitizedTitle;
            break;
          }
        }
      }
    }

    // Extract author
    for (let i = 0; i < lines.length; i++) {
      const authorMatch = lines[i].match(/by[\s:]+(.+)/i);
      if (authorMatch) {
        const author = sanitizeText(authorMatch[1]);
        if (author) {
          metadata.author = author;
          break;
        }
      }
      if (!metadata.author && i > 0 && lines[i].length > 3 && lines[i].length < 100) {
        const potentialAuthor = sanitizeText(lines[i]);
        if (potentialAuthor) {
          metadata.author = potentialAuthor;
          break;
        }
      }
    }

    // Extract publisher
    const publisherMatch = ocrText.match(/(?:published by|publisher)[:\s]+(.+)/i);
    if (publisherMatch) {
      const publisher = sanitizeText(publisherMatch[1].split('\n')[0]);
      if (publisher) {
        metadata.publisher = publisher;
      }
    }

    // Extract publication year
    const yearMatch = ocrText.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      const parsedYear = Number.parseInt(yearMatch[0], 10);
      if (!Number.isNaN(parsedYear)) {
        metadata.publicationYear = parsedYear;
      }
    }

    return metadata;
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setOcrResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageUploaded('');
    if (onMetadataExtracted) {
      onMetadataExtracted(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className={`border-2 border-dashed rounded-lg text-center hover:border-boisheba-400 transition-colors relative ${showOCR ? 'border-boisheba-200 p-8' : 'border-gray-300 p-4'}`}>
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Book preview"
              className={`mx-auto rounded-lg shadow-soft ${showOCR ? 'max-h-64' : 'max-h-32'}`}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              onClick={handleRemoveImage}
              disabled={isProcessing}
            >
              <X className="h-4 w-4 text-gray-700" />
            </Button>
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
                <div className="text-white text-sm font-medium">
                  Processing OCR with backend...
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {showOCR && (
              <div className="flex justify-center mb-4">
                <img
                  src="/boisheba.png"
                  alt="Boisheba Logo"
                  className="h-16 w-16"
                />
              </div>
            )}
            <div className={showOCR ? '' : 'flex flex-col gap-2'}>
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
                disabled={isProcessing}
                className="border-boisheba-600 text-boisheba-600 hover:bg-boisheba-50 hover:text-boisheba-700 hover:border-boisheba-700 w-full"
                size={showOCR ? "default" : "sm"}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={triggerFileInput}
                disabled={isProcessing}
                className="text-boisheba-600 hover:bg-boisheba-50 hover:text-boisheba-700 w-full"
                size={showOCR ? "default" : "sm"}
              >
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG up to 10MB
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          disabled={isProcessing}
        />
      </div>

      {/* OCR Results Section */}
      {showOCR && ocrResult && (
        <div className="mt-4 p-4 bg-boisheba-50 rounded-lg border border-boisheba-200">
          <h3 className="font-semibold mb-2 text-boisheba-800 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            OCR Results (Backend)
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Title:</span>
              <p className="text-muted-foreground">{ocrResult.title || "Not detected"}</p>
            </div>
            <div>
              <span className="font-medium">Author:</span>
              <p className="text-muted-foreground">{ocrResult.author || "Not detected"}</p>
            </div>
            <div>
              <span className="font-medium">Publisher:</span>
              <p className="text-muted-foreground">{ocrResult.publisher || "Not detected"}</p>
            </div>
            <div>
              <span className="font-medium">ISBN:</span>
              <p className="text-muted-foreground">{ocrResult.isbn || "Not detected"}</p>
            </div>
            <div>
              <span className="font-medium">Edition:</span>
              <p className="text-muted-foreground">{ocrResult.edition || "Not detected"}</p>
            </div>
            <div>
              <span className="font-medium">Category:</span>
              <p className="text-muted-foreground">{ocrResult.category ? ocrResult.category.replace(/_/g, ' ') : "Not detected"}</p>
            </div>
            <div>
              <span className="font-medium">Language:</span>
              <p className="text-muted-foreground">{ocrResult.language || "Not detected"}</p>
            </div>
            {ocrResult.publicationYear && (
              <div>
                <span className="font-medium">Publication Year:</span>
                <p className="text-muted-foreground">{ocrResult.publicationYear}</p>
              </div>
            )}
            <div className="md:col-span-2">
              <span className="font-medium">Description:</span>
              <p className="text-muted-foreground">{ocrResult.description || "Not detected"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
