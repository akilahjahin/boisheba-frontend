import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import DamageDetection from "@/components/DamageDetection";
import LanguageToggle from "@/components/LanguageToggle";
import { DamageDetectionResponse } from "@/utils/api";

const DamageDetectionPage = () => {
  const navigate = useNavigate();
  const [detectionResult, setDetectionResult] = useState<DamageDetectionResponse | null>(null);

  const handleDetectionComplete = (result: DamageDetectionResponse) => {
    setDetectionResult(result);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Book Damage Detection</h1>
          </div>
          <LanguageToggle />
        </div>

        <div className="space-y-6">
          {/* Info Card */}
          <Card className="border-boisheba-200 bg-boisheba-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <img src="/boisheba.png" alt="Boisheba Logo" className="w-10 h-10" />
                <div>
                  <CardTitle className="text-xl">AI-Powered Damage Detection</CardTitle>
                  <CardDescription className="text-boisheba-700">
                    Use artificial intelligence to automatically assess book condition
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <h4 className="font-semibold text-boisheba-800">Fast Analysis</h4>
                  <p className="text-boisheba-600">
                    Get results in seconds using advanced computer vision
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-boisheba-800">Accurate Detection</h4>
                  <p className="text-boisheba-600">
                    Identifies tears, stains, wear, and other damage types
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-boisheba-800">Fair Pricing</h4>
                  <p className="text-boisheba-600">
                    Get recommendations for pricing based on condition
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Damage Detection Component */}
          <DamageDetection 
            onDetectionComplete={handleDetectionComplete}
            className="shadow-md"
          />

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="bg-boisheba-100 text-boisheba-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Upload Image</h4>
                  <p>Take a clear photo of your book, focusing on any visible damage</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-boisheba-100 text-boisheba-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">AI Analysis</h4>
                  <p>Our AI model processes the image and detects any damage or wear</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-boisheba-100 text-boisheba-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Get Results</h4>
                  <p>Receive detailed analysis with damage level and recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Tips for Best Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-900">
                <li className="flex gap-2">
                  <span>📸</span>
                  <span>Use good lighting - natural light works best</span>
                </li>
                <li className="flex gap-2">
                  <span>🎯</span>
                  <span>Ensure the entire book or damaged area is in frame</span>
                </li>
                <li className="flex gap-2">
                  <span>📏</span>
                  <span>Keep the camera steady to avoid blurry images</span>
                </li>
                <li className="flex gap-2">
                  <span>🔍</span>
                  <span>Take close-up shots of specific damage areas</span>
                </li>
                <li className="flex gap-2">
                  <span>📱</span>
                  <span>Use your phone's camera for convenient high-quality photos</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DamageDetectionPage;
