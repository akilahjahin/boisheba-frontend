import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { compareBookCondition } from '@/utils/api';

interface CompareCanvasProps {
  bookId: string;
  originalImage: string;
  originalConditionScore: number;
}

export default function CompareCanvas({ 
  bookId, 
  originalImage, 
  originalConditionScore 
}: CompareCanvasProps) {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<{
    similarity: number;
    differences: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCurrentImage(reader.result as string);
      performComparison(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const performComparison = async (newImage: string) => {
    setIsComparing(true);
    setComparisonResult(null);

    try {
      // TODO: In production, send to backend for AI-based image comparison
      // For demo, use mock comparison
      const result = await compareBookCondition(bookId, newImage);
      
      setComparisonResult(result);
      
      if (result.similarity >= 90) {
        toast.success(`Excellent match! ${result.similarity}% similarity`);
      } else if (result.similarity >= 75) {
        toast.warning(`Good match with minor differences: ${result.similarity}%`);
      } else {
        toast.error(`Significant differences detected: ${result.similarity}%`);
      }

      // Draw comparison on canvas (simple side-by-side for demo)
      drawComparison(originalImage, newImage);
    } catch (error) {
      toast.error('Comparison failed');
      console.error(error);
    } finally {
      setIsComparing(false);
    }
  };

  const drawComparison = (img1Src: string, img2Src: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img1 = new Image();
    const img2 = new Image();

    img1.onload = () => {
      img2.onload = () => {
        // Set canvas size
        const width = Math.max(img1.width, img2.width);
        const height = Math.max(img1.height, img2.height);
        canvas.width = width * 2 + 40;
        canvas.height = height + 80;

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw original image
        ctx.fillStyle = '#000000';
        ctx.font = '16px sans-serif';
        ctx.fillText('Original', 10, 20);
        ctx.drawImage(img1, 10, 30, width, height);

        // Draw current image
        ctx.fillText('Current', width + 30, 20);
        ctx.drawImage(img2, width + 30, 30, width, height);

        // Draw divider
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width + 20, 0);
        ctx.lineTo(width + 20, canvas.height);
        ctx.stroke();
      };
      img2.src = img2Src;
    };
    img1.src = img1Src;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isComparing}
        >
          {isComparing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Current Photo
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          disabled={isComparing}
        />
      </div>

      {comparisonResult && (
        <div className="bg-muted rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Comparison Result</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Similarity:</span>
              <span className={`text-lg font-bold ${
                comparisonResult.similarity >= 90 ? 'text-green-600' :
                comparisonResult.similarity >= 75 ? 'text-amber-600' :
                'text-red-600'
              }`}>
                {comparisonResult.similarity}%
              </span>
            </div>
          </div>

          {comparisonResult.differences.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Detected Changes:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {comparisonResult.differences.map((diff, i) => (
                  <li key={i}>• {diff}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-muted-foreground pt-2 border-t">
            💡 <strong>Demo Mode:</strong> In production, this uses AI to detect scratches, tears, 
            water damage, and other condition changes using computer vision (pixelmatch or ML models).
          </p>
        </div>
      )}

      {currentImage && (
        <div className="border rounded-lg p-4">
          <canvas 
            ref={canvasRef} 
            className="w-full max-w-full"
            style={{ maxHeight: '500px', objectFit: 'contain' }}
          />
        </div>
      )}

      {!currentImage && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Upload a current photo of the book to compare with the original condition
          </p>
        </div>
      )}
    </div>
  );
}
