import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Camera, Upload, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import UploadImage from "@/components/UploadImage";
import { createBook } from "@/utils/api";
import { useTranslation } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";
import Tesseract from "tesseract.js";

const AddBook = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    edition: "",
    description: "",
    condition: "",
    dailyRate: 30,
  });

  const processOCR = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await Tesseract.recognize(
        file,
        'eng',
        { logger: m => console.log(m) }
      );

      const lines = result.data.text.split('\n').filter(line => line.trim());
      const parsed = { title: "", author: "", publisher: "", isbn: "" };

      const isbnMatch = result.data.text.match(/\b(?:ISBN[-\s]?13|97[8-9])\b[:\s]?\d{1,5}[\dX]?\b/gi);
      if (isbnMatch) parsed.isbn = isbnMatch[0].replace(/[^0-9X]/g, '');

      if (lines.length > 0) parsed.title = lines[0].replace(/^(title|book):?\s*/i, '').trim();

      for (let i = 1; i < lines.length; i++) {
        const authorMatch = lines[i].match(/by\s+(.+)/i);
        if (authorMatch) {
          parsed.author = authorMatch[1].trim();
          break;
        }
        if (!parsed.author && lines[i].length > 0 && lines[i].length < 50) parsed.author = lines[i].trim();
      }

      setOcrResult(parsed);
      setFormData(prev => ({ ...prev, ...parsed, condition: "Good - AI detected" }));
      toast.success("OCR completed successfully!");
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchMetadata = async () => {
    if (!ocrResult?.isbn) {
      toast.error("No ISBN found to fetch metadata");
      return;
    }

    try {
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${ocrResult.isbn}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const book = data[0];
        setFormData(prev => ({
          ...prev,
          title: book.title || prev.title,
          author: book.author_name?.[0] || prev.author,
          publisher: book.publishers?.[0] || prev.publisher,
        }));
        toast.success("Metadata fetched successfully!");
      }
    } catch (error) {
      console.error('Open Library Error:', error);
      toast.error("Failed to fetch metadata");
    }
  };

  const handleImageUploaded = (imageUrl: string, file?: File) => {
    setImages([imageUrl]);
    if (file) processOCR(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.author) {
      toast.error("Title and Author are required");
      return;
    }

    try {
      await createBook({
        ...formData,
        images,
        fingerprint: `hash-${Date.now()}`,
        conditionScore: 85,
      });
      toast.success(t('addBook.submit') + " successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error('Submit Error:', error);
      toast.error("Failed to add book");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t('addBook.title')}</h1>
          <LanguageToggle />
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex items-center gap-3">
              <img src="/boisheba.png" alt="Boisheba Logo" className="w-10 h-10" />
              <div>
                <CardTitle className="text-2xl">{t('addBook.title')}</CardTitle>
                <CardDescription>{t('addBook.subtitle')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">{t('addBook.uploadImage')}</Label>
                <UploadImage onImageUploaded={handleImageUploaded} className="w-full" showOCR={true} />
                {isProcessing && (
                  <div className="flex items-center gap-2 text-boisheba-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Processing OCR...</span>
                  </div>
                )}
                {ocrResult && (
                  <div className="mt-4 p-4 bg-boisheba-50 rounded-lg border border-boisheba-200">
                    <h3 className="font-semibold mb-2 text-boisheba-800">OCR Results</h3>
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
                      <Button type="button" variant="outline" onClick={fetchMetadata} className="mt-3 w-full">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Fetch Metadata (Open Library)
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t('addBook.form.title')} *</Label>
                    <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="Enter book title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">{t('addBook.form.author')} *</Label>
                    <Input id="author" name="author" value={formData.author} onChange={handleChange} required placeholder="Enter author name" />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">{t('addBook.form.isbn')}</Label>
                    <Input id="isbn" name="isbn" value={formData.isbn} onChange={handleChange} placeholder="978-0-123456-7" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publisher">{t('addBook.form.publisher')}</Label>
                    <Input id="publisher" name="publisher" value={formData.publisher} onChange={handleChange} placeholder="Publisher name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edition">{t('addBook.form.edition')}</Label>
                    <Input id="edition" name="edition" value={formData.edition} onChange={handleChange} placeholder="e.g., First Edition, 2023" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('addBook.form.description')}</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Brief description of the book" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condition">{t('addBook.form.condition')}</Label>
                    <Input id="condition" name="condition" value={formData.condition} onChange={handleChange} placeholder="e.g., Like New, Good, Fair" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyRate">{t('addBook.form.dailyRate')}</Label>
                    <Input id="dailyRate" name="dailyRate" type="number" value={formData.dailyRate} onChange={handleChange} required min="1" placeholder="30" />
                  </div>
                </div>
              </div>

              {/* ✅ Updated Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={!formData.title || !formData.author || isProcessing}
                  className="bg-boisheba-600 hover:bg-boisheba-700"
                >
                  <img src="/boisheba.png" alt="Boisheba Logo" className="w-4 h-4" />
                  {t('addBook.submit')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="border-boisheba-600 text-boisheba-600 hover:bg-boisheba-50"
                >
                  {t('addBook.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddBook;