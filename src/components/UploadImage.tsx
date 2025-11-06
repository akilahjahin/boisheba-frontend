import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { extractTextFromImage, parseBookMetadata, enrichBookDataFromISBN } from '@/lib/tesseract';
import { toast } from 'sonner';

interface UploadImageProps {
  onImageUploaded: (imageUrl: string) => void;
  onMetadataExtracted: (metadata: any) => void;
}

export default function UploadImage({ onImageUploaded, onMetadataExtracted }: UploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

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
      onImageUploaded(result);
    };
    reader.readAsDataURL(file);

    // Process with OCR
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

      onMetadataExtracted(metadata);
      toast.success('Book details extracted! Please review and edit.');
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to extract text. Please fill details manually.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors relative">
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Book preview"
              className="max-h-64 mx-auto rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
                <div className="text-white text-sm font-medium">
                  Processing OCR... {progress}%
                </div>
                <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
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
    </div>
  );
}
