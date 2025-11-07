import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, X, BookOpen } from 'lucide-react';
import { extractTextFromImage, parseBookMetadata, enrichBookDataFromISBN } from '@/lib/tesseract';
import { toast } from 'sonner';

interface UploadImageProps {
  onImageUploaded: (imageUrl: string, file?: File) => void;
  onMetadataExtracted?: (metadata: any) => void;
  showOCR?: boolean;
}

export default function UploadImage({ onImageUploaded, onMetadataExtracted, showOCR = true }: UploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<any>(null);

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

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      onImageUploaded(result, file);
    };
    reader.readAsDataURL(file);

    // Process with OCR if enabled
    if (showOCR) {
      setIsProcessing(true);
      setProgress(0);
      toast.info('Processing image with OCR...');

      try {
        // Extract text using Tesseract.js
        const ocrText = await extractTextFromImage(file, (p) => {
          setProgress(Math.floor(p * 100));
        });

        console.log('OCR Text:', ocrText);

        // Parse book metadata from OCR text
        const metadata = parseBookMetadata(ocrText);
        console.log('Parsed Metadata:', metadata);
        setOcrResult(metadata);

        // Try to enrich with Open Library if ISBN found
        if (metadata.isbn && import.meta.env.VITE_ENABLE_OPEN_LIBRARY === 'true') {
          try {
            const enrichedData = await enrichBookDataFromISBN(metadata.isbn);
            Object.assign(metadata, {
              ...metadata,
              ...enrichedData,
            });
            toast.success('Book data enriched from Open Library!');
          } catch (error) {
            console.warn('Open Library enrichment skipped');
          }
        }

        // Notify parent component about extracted metadata
        if (onMetadataExtracted) {
          onMetadataExtracted(metadata);
        }

        toast.success('Book details extracted! Please review and edit.');
      } catch (error) {
        console.error('OCR Error:', error);
        toast.error('Failed to extract text. Please fill details manually.');
      } finally {
        setIsProcessing(false);
        setProgress(0);
      }
    } else {
      // Just upload without OCR if disabled
      if (onMetadataExtracted) {
        onMetadataExtracted(null);
      }
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setOcrResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-boisheba-200 rounded-lg p-8 text-center hover:border-boisheba-400 transition-colors relative">
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Book preview"
              className="max-h-64 mx-auto rounded-lg shadow-soft"
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
                  Processing OCR... {progress}%
                </div>
                <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-boisheba-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <img
                src="/boisheba.png"
                alt="Boisheba Logo"
                className="h-16 w-16"
              />
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
                disabled={isProcessing}
                className="border-boisheba-600 text-boisheba-600 hover:bg-boisheba-50"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={triggerFileInput}
                disabled={isProcessing}
                className="text-boisheba-600 hover:text-boisheba-700"
              >
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
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
            OCR Results
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
          </div>
          {ocrResult.isbn && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // TODO: Replace with real Open Library API call
                toast.info("Open Library integration would fetch additional metadata");
              }}
              className="mt-3 w-full border-boisheba-600 text-boisheba-600 hover:bg-boisheba-50"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Fetch Metadata (Open Library)
            </Button>
          )}
        </div>
      )}
    </div>
  );
}