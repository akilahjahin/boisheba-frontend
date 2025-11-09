import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import UploadImage, { OcrMetadata } from "@/components/UploadImage";
import DamageDetection from "@/components/DamageDetection";
import { createBook, CreateBookRequest, BookCategory, BookCondition, getStoredAuth, DamageDetectionResponse } from "@/utils/api";
import { useTranslation } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";

const AddBook = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [damageDetected, setDamageDetected] = useState(false);
  const [showDamageDetection, setShowDamageDetection] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    edition: "",
    category: "" as BookCategory,
    description: "",
    condition: BookCondition.GOOD,
    language: "",
    totalPages: undefined as number | undefined,
    publicationYear: undefined as number | undefined,
    rentalPricePerDay: 30,
    suggestedDeposit: 300,
    location: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    tags: "",
  });

  const handleCoverImageUploaded = (imageUrl: string) => {
    setCoverImageUrl(imageUrl);
  };

  const handleMetadataExtracted = (metadata: OcrMetadata | null) => {
    if (!metadata) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      title: metadata.title ?? prev.title,
      author: metadata.author ?? prev.author,
      isbn: metadata.isbn ?? prev.isbn,
      publisher: metadata.publisher ?? prev.publisher,
      edition: metadata.edition ?? prev.edition,
      description: metadata.description ?? prev.description,
      language: metadata.language ?? prev.language,
      category: metadata.category ?? prev.category,
      publicationYear: metadata.publicationYear ?? prev.publicationYear,
    }));
  };

  const handleDamageDetectionComplete = (result: DamageDetectionResponse) => {
    // You could use this to automatically adjust the book condition
    // based on the damage detection results
    console.log("Damage detection result:", result);
    setDamageDetected(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === "totalPages" || name === "publicationYear" || name === "rentalPricePerDay" || name === "suggestedDeposit"
        ? value ? Number(value) : undefined
        : value 
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.author) {
      toast.error("Title and Author are required");
      return;
    }

    const auth = getStoredAuth();
    if (!auth?.user?.id) {
      toast.error("Please login to add a book");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const request: CreateBookRequest = {
        ownerId: Number(auth.user.id),
        title: formData.title,
        author: formData.author,
        publisher: formData.publisher || undefined,
        edition: formData.edition || undefined,
        isbn: formData.isbn || undefined,
        category: formData.category as BookCategory,
        description: formData.description || undefined,
        condition: formData.condition as BookCondition,
        language: formData.language || undefined,
        totalPages: formData.totalPages,
        publicationYear: formData.publicationYear,
        suggestedDeposit: formData.suggestedDeposit,
        rentalPricePerDay: formData.rentalPricePerDay,
  coverImageUrl: coverImageUrl || undefined,
  titlePageImageUrl: coverImageUrl || undefined,
        location: formData.location || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
        tags: formData.tags || undefined,
      };

      const createdBook = await createBook(request);
      
      toast.success(
        createdBook.verified 
          ? "Book added and verified successfully!" 
          : "Book added! Pending verification."
      );
      
      navigate("/dashboard");
    } catch (error) {
      console.error('Submit Error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to add book");
    } finally {
      setIsSubmitting(false);
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
              {/* Cover Image Upload with OCR */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Cover Image</Label>
                <UploadImage 
                  onImageUploaded={handleCoverImageUploaded}
                  onMetadataExtracted={handleMetadataExtracted}
                  showOCR={true} 
                />
              </div>

              {/* Optional Damage Detection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Damage Detection (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDamageDetection(!showDamageDetection)}
                  >
                    {showDamageDetection ? "Hide" : "Show"} Damage Detection
                  </Button>
                </div>
                {showDamageDetection && (
                  <DamageDetection 
                    onDetectionComplete={handleDamageDetectionComplete}
                    className="border-2"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t('addBook.form.title')} *</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      required 
                      placeholder="Enter book title" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">{t('addBook.form.author')} *</Label>
                    <Input 
                      id="author" 
                      name="author" 
                      value={formData.author} 
                      onChange={handleChange} 
                      required 
                      placeholder="Enter author name" 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">{t('addBook.form.isbn')}</Label>
                    <Input 
                      id="isbn" 
                      name="isbn" 
                      value={formData.isbn} 
                      onChange={handleChange} 
                      placeholder="978-0-123456-7" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publisher">{t('addBook.form.publisher')}</Label>
                    <Input 
                      id="publisher" 
                      name="publisher" 
                      value={formData.publisher} 
                      onChange={handleChange} 
                      placeholder="Publisher name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edition">{t('addBook.form.edition')}</Label>
                    <Input 
                      id="edition" 
                      name="edition" 
                      value={formData.edition} 
                      onChange={handleChange} 
                      placeholder="e.g., First Edition, 2023" 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleSelectChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(BookCategory).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select 
                      value={formData.condition} 
                      onValueChange={(value) => handleSelectChange("condition", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(BookCondition).map((cond) => (
                          <SelectItem key={cond} value={cond}>
                            {cond.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input 
                      id="language" 
                      name="language" 
                      value={formData.language} 
                      onChange={handleChange} 
                      placeholder="e.g., English, Bengali" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('addBook.form.description')}</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows={3} 
                    placeholder="Brief description of the book" 
                  />
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalPages">Total Pages</Label>
                    <Input 
                      id="totalPages" 
                      name="totalPages" 
                      type="number" 
                      value={formData.totalPages || ""} 
                      onChange={handleChange} 
                      placeholder="250" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publicationYear">Publication Year</Label>
                    <Input 
                      id="publicationYear" 
                      name="publicationYear" 
                      type="number" 
                      value={formData.publicationYear || ""} 
                      onChange={handleChange} 
                      placeholder="2020" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rentalPricePerDay">{t('addBook.form.dailyRate')} *</Label>
                    <Input 
                      id="rentalPricePerDay" 
                      name="rentalPricePerDay" 
                      type="number" 
                      value={formData.rentalPricePerDay} 
                      onChange={handleChange} 
                      required 
                      min="1" 
                      placeholder="30" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="suggestedDeposit">Deposit *</Label>
                    <Input 
                      id="suggestedDeposit" 
                      name="suggestedDeposit" 
                      type="number" 
                      value={formData.suggestedDeposit} 
                      onChange={handleChange} 
                      required 
                      min="0" 
                      placeholder="300" 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      name="location" 
                      value={formData.location} 
                      onChange={handleChange} 
                      placeholder="e.g., Dhaka, Bangladesh" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input 
                      id="tags" 
                      name="tags" 
                      value={formData.tags} 
                      onChange={handleChange} 
                      placeholder="fiction, thriller, bestseller" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={!formData.title || !formData.author || isSubmitting}
                  className="bg-boisheba-600 hover:bg-boisheba-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Book...
                    </>
                  ) : (
                    <>
                      <img src="/boisheba.png" alt="Boisheba Logo" className="w-4 h-4 mr-2" />
                      {t('addBook.submit')}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="border-boisheba-600 text-boisheba-600 hover:bg-boisheba-50"
                  disabled={isSubmitting}
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
