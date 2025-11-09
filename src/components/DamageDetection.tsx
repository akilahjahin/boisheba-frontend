import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, CheckCircle2, AlertTriangle, XCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { performDamageDetectionFastAPI, DamageDetectionResponse } from "@/utils/api";

interface DamageDetectionProps {
  onDetectionComplete?: (result: DamageDetectionResponse) => void;
  className?: string;
}

interface DetectionResult {
  status: string;
  hasDamage: boolean;
  damageLevel: "none" | "minor" | "moderate" | "severe";
  confidence: number;
  detectedIssues: string[];
  roboflowResponse?: any;
}

const DamageDetection = ({ onDetectionComplete, className = "" }: DamageDetectionProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    setSelectedImage(file);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeDamage = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await performDamageDetectionFastAPI(selectedImage);

      // Parse Roboflow response and extract damage information
      const detectionResult = parseRoboflowResponse(response);
      
      setResult(detectionResult);
      
      if (onDetectionComplete) {
        onDetectionComplete(response);
      }

      // Show appropriate toast
      if (detectionResult.hasDamage) {
        toast.warning(`Damage detected: ${detectionResult.damageLevel.toUpperCase()} level`);
      } else {
        toast.success("No damage detected - book is in good condition");
      }
    } catch (error) {
      console.error("Damage detection error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseRoboflowResponse = (response: DamageDetectionResponse): DetectionResult => {
    const roboflowData = response.roboflow_response;
    const detectedIssues: string[] = [];
    let hasDamage = false;
    let damageLevel: "none" | "minor" | "moderate" | "severe" = "none";
    let maxConfidence = 0;

    console.log("Parsing Roboflow response:", roboflowData);

    // Parse Roboflow workflow output
    if (roboflowData) {
      // Handle array of outputs format
      if (Array.isArray(roboflowData.outputs)) {
        roboflowData.outputs.forEach((output: any) => {
          // Check for nested predictions.predictions structure
          if (output.predictions && output.predictions.predictions && Array.isArray(output.predictions.predictions)) {
            output.predictions.predictions.forEach((pred: any) => {
              if (pred.class && pred.confidence) {
                // Filter out very low confidence predictions (< 10%)
                if (pred.confidence > 0.1) {
                  hasDamage = true;
                  detectedIssues.push(`${pred.class} (${(pred.confidence * 100).toFixed(1)}%)`);
                  maxConfidence = Math.max(maxConfidence, pred.confidence);
                }
              }
            });
          }
          // Also check for direct predictions array
          else if (output.predictions && Array.isArray(output.predictions)) {
            output.predictions.forEach((pred: any) => {
              if (pred.class && pred.confidence) {
                if (pred.confidence > 0.1) {
                  hasDamage = true;
                  detectedIssues.push(`${pred.class} (${(pred.confidence * 100).toFixed(1)}%)`);
                  maxConfidence = Math.max(maxConfidence, pred.confidence);
                }
              }
            });
          }
        });
      }
      // Handle object outputs format
      else if (roboflowData.outputs && typeof roboflowData.outputs === "object") {
        const outputs = roboflowData.outputs;
        
        // Look for detection results in various possible output formats
        for (const key in outputs) {
          const output = outputs[key];
          
          if (output && typeof output === "object") {
            // Handle nested predictions.predictions
            if (output.predictions && output.predictions.predictions && Array.isArray(output.predictions.predictions)) {
              output.predictions.predictions.forEach((pred: any) => {
                if (pred.class && pred.confidence && pred.confidence > 0.1) {
                  hasDamage = true;
                  detectedIssues.push(`${pred.class} (${(pred.confidence * 100).toFixed(1)}%)`);
                  maxConfidence = Math.max(maxConfidence, pred.confidence);
                }
              });
            }
            // Handle object detection format
            else if (output.predictions && Array.isArray(output.predictions)) {
              output.predictions.forEach((pred: any) => {
                if (pred.class && pred.confidence && pred.confidence > 0.1) {
                  hasDamage = true;
                  detectedIssues.push(`${pred.class} (${(pred.confidence * 100).toFixed(1)}%)`);
                  maxConfidence = Math.max(maxConfidence, pred.confidence);
                }
              });
            }
            
            // Handle classification format
            if (output.predicted_classes && Array.isArray(output.predicted_classes)) {
              output.predicted_classes.forEach((cls: string) => {
                if (cls.toLowerCase().includes("damage") || 
                    cls.toLowerCase().includes("torn") ||
                    cls.toLowerCase().includes("ripped") ||
                    cls.toLowerCase().includes("worn") ||
                    cls.toLowerCase().includes("wornout") ||
                    cls.toLowerCase().includes("stain")) {
                  hasDamage = true;
                  detectedIssues.push(cls);
                }
              });
            }
            
            // Handle top prediction
            if (output.top && output.confidence) {
              maxConfidence = Math.max(maxConfidence, output.confidence);
              if (output.top.toLowerCase().includes("damage") ||
                  output.top.toLowerCase().includes("ripped") ||
                  output.top.toLowerCase().includes("worn")) {
                hasDamage = true;
                detectedIssues.push(`${output.top} (${(output.confidence * 100).toFixed(1)}%)`);
              }
            }
          }
        }
      }
    }

    console.log("Detected issues:", detectedIssues);
    console.log("Has damage:", hasDamage);
    console.log("Max confidence:", maxConfidence);

    // Determine damage level based on number of issues and confidence
    if (hasDamage) {
      if (detectedIssues.length >= 5 || maxConfidence > 0.9) {
        damageLevel = "severe";
      } else if (detectedIssues.length >= 3 || maxConfidence > 0.7) {
        damageLevel = "moderate";
      } else {
        damageLevel = "minor";
      }
    }

    return {
      status: response.status,
      hasDamage,
      damageLevel,
      confidence: maxConfidence,
      detectedIssues: detectedIssues.length > 0 ? detectedIssues : ["No specific issues detected"],
      roboflowResponse: roboflowData,
    };
  };

  const getDamageLevelColor = (level: string) => {
    switch (level) {
      case "none": return "bg-green-500";
      case "minor": return "bg-yellow-500";
      case "moderate": return "bg-orange-500";
      case "severe": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDamageLevelIcon = (level: string) => {
    switch (level) {
      case "none": return <CheckCircle2 className="h-5 w-5" />;
      case "minor": return <AlertTriangle className="h-5 w-5" />;
      case "moderate": return <AlertTriangle className="h-5 w-5" />;
      case "severe": return <XCircle className="h-5 w-5" />;
      default: return <ImageIcon className="h-5 w-5" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          AI Book Damage Detection
        </CardTitle>
        <CardDescription>
          Upload a photo to automatically detect any damage or wear on the book
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Upload */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          
          {!imagePreview ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload book image
                </span>
              </div>
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="relative rounded-lg overflow-hidden border">
                <img
                  src={imagePreview}
                  alt="Selected book"
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  Change Image
                </Button>
                <Button
                  type="button"
                  onClick={analyzeDamage}
                  disabled={isAnalyzing}
                  className="flex-1 bg-boisheba-600 hover:bg-boisheba-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Damage"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Analysis Results</h3>
              <Badge className={getDamageLevelColor(result.damageLevel)}>
                {result.damageLevel.toUpperCase()}
              </Badge>
            </div>

            <Alert className={result.hasDamage ? "border-orange-500" : "border-green-500"}>
              <div className="flex items-start gap-3">
                <div className={result.hasDamage ? "text-orange-500" : "text-green-500"}>
                  {getDamageLevelIcon(result.damageLevel)}
                </div>
                <div className="flex-1">
                  <AlertDescription>
                    {result.hasDamage ? (
                      <>
                        <p className="font-medium mb-2">
                          Damage detected with {(result.confidence * 100).toFixed(1)}% confidence
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {result.detectedIssues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="font-medium">
                        No damage detected. The book appears to be in good condition.
                      </p>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            {/* Recommendations */}
            {result.hasDamage && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Recommendations:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {result.damageLevel === "severe" && (
                    <>
                      <li>• Consider repairing the book before lending</li>
                      <li>• Adjust rental price to reflect condition</li>
                      <li>• Take additional photos to document damage</li>
                    </>
                  )}
                  {result.damageLevel === "moderate" && (
                    <>
                      <li>• Document damage clearly in the description</li>
                      <li>• Consider a lower rental price</li>
                      <li>• Mention condition prominently to borrowers</li>
                    </>
                  )}
                  {result.damageLevel === "minor" && (
                    <>
                      <li>• Minor wear is acceptable for used books</li>
                      <li>• Mention condition in the description</li>
                      <li>• No major adjustments needed</li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Technical Info */}
        {result && result.roboflowResponse && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">
              View Technical Details
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-40">
              {JSON.stringify(result.roboflowResponse, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

export default DamageDetection;
