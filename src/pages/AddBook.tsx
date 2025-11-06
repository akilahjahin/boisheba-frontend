import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import UploadImage from "@/components/UploadImage";
import { createBook } from "@/utils/api";
import { useTranslation } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";

const AddBook = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [images, setImages] = useState<string[]>([]);
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

  const handleMetadataExtracted = (metadata: any) => {
    setFormData(prev => ({
      ...prev,
      ...metadata,
      condition: metadata.condition || "Good",
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBook({ ...formData, images });
      toast.success(t('addBook.submit') + " successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to add book");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end mb-4">
          <LanguageToggle />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('addBook.title')}</CardTitle>
            <CardDescription>{t('addBook.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <UploadImage
                onImageUploaded={(url) => setImages([url])}
                onMetadataExtracted={handleMetadataExtracted}
              />

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t('addBook.form.title')} *</Label>
                    <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">{t('addBook.form.author')} *</Label>
                    <Input id="author" name="author" value={formData.author} onChange={handleChange} required />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">{t('addBook.form.isbn')}</Label>
                    <Input id="isbn" name="isbn" value={formData.isbn} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publisher">{t('addBook.form.publisher')}</Label>
                    <Input id="publisher" name="publisher" value={formData.publisher} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edition">{t('addBook.form.edition')}</Label>
                    <Input id="edition" name="edition" value={formData.edition} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('addBook.form.description')}</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condition">{t('addBook.form.condition')}</Label>
                    <Input id="condition" name="condition" value={formData.condition} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyRate">{t('addBook.form.dailyRate')}</Label>
                    <Input id="dailyRate" name="dailyRate" type="number" value={formData.dailyRate} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={!formData.title}>
                  <Check className="mr-2 h-4 w-4" />
                  {t('addBook.submit')}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
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