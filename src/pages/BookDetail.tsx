// src/pages/BookDetail.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Star, Shield, Camera, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { getBookById, createTransaction } from "@/utils/api";
import { compareImages } from "@/lib/tesseract";
import UploadImage from "@/components/UploadImage";
import { useTranslation } from "@/lib/i18n";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("details");

  const [borrowDates, setBorrowDates] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);

  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Load book on mount
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await getBookById(id || "");
        setBook(data);
      } catch (error) {
        console.error("Failed to fetch book:", error);
        toast.error("Failed to load book details");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleBorrow = () => {
    if (!borrowDates.startDate || !borrowDates.endDate) {
      toast.error("Please select borrow dates");
      return;
    }

    const days = Math.ceil(
      (borrowDates.endDate.getTime() - borrowDates.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const totalCost = days * book.dailyRate;
    const deposit = Math.round(book.fakePrice * 0.2);

    // Show a confirmation dialog
    const confirmBorrow = window.confirm(
      `Are you sure you want to borrow "${book.title}"?\n\n` +
      `Borrow Period: ${days} days\n` +
      `Total Cost: ৳${totalCost}\n` +
      `Security Deposit: ৳${deposit}\n` +
      `Total Payment: ৳${totalCost + deposit}`
    );

    if (!confirmBorrow) return;

    // TODO: Replace with real transaction API
    createTransaction({
      bookId: book.id,
      borrowerId: "current-user",
      lenderId: book.ownerId,
      startDate: borrowDates.startDate.toISOString(),
      endDate: borrowDates.endDate.toISOString(),
      totalCost,
      deposit,
      status: "pending"
    });

    toast.success(`Borrow request sent! Total cost: ৳${totalCost} (including ৳${deposit} deposit)`);

    setTimeout(() => {
      toast.success("Owner has approved your request! Enjoy reading.");
      navigate("/dashboard");
    }, 2000);
  };

  const handleImageUpload = (imageUrl: string, type: "before" | "after") => {
    if (type === "before") setBeforeImage(imageUrl);
    else setAfterImage(imageUrl);
  };

  const handleCompareImages = async () => {
    if (!beforeImage || !afterImage) {
      toast.error("Please upload both before and after images");
      return;
    }

    setIsComparing(true);

    try {
      const result = await compareImages(beforeImage, afterImage);
      setComparisonResult(result);
      toast.success("Images compared successfully!");
    } catch (error) {
      console.error("Comparison failed:", error);
      toast.error("Failed to compare images");
    } finally {
      setIsComparing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-boisheba-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Book not found</h2>
          <p className="text-muted-foreground mb-4">
            The book you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/books")}>Back to Books</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{book.title}</CardTitle>
                <CardDescription>by {book.author}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Image */}
                <div className="aspect-[3/4] relative overflow-hidden bg-muted rounded-lg mb-6">
                  <img
                    src={book.images?.[0] || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={book.available ? "default" : "secondary"}
                      className={book.available ? "bg-boisheba-600" : ""}
                    >
                      {book.available ? "Available" : "Lent"}
                    </Badge>
                  </div>
                </div>

                {/* Publication & Condition */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Publication Details</h3>
                    <div className="space-y-2 text-sm">
                      <DetailRow label="Publisher" value={book.publisher} />
                      <DetailRow label="ISBN" value={book.isbn} />
                      <DetailRow label="Edition" value={book.edition} />
                      <DetailRow label="Language" value={book.language} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Condition Details</h3>
                    <div className="space-y-2 text-sm">
                      <DetailRow label="Condition" value={book.condition} />

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">AI Score:</span>
                        <div className="flex items-center">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-boisheba-600 rounded-full"
                              style={{ width: `${book.conditionScore}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 font-medium">
                            {book.conditionScore}/100
                          </span>
                        </div>
                      </div>

                      <DetailRow
                        label="Fingerprint"
                        value={
                          <span className="font-mono text-xs">
                            {book.fingerprint}
                          </span>
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {book.description}
                  </p>
                </div>

                {/* Owner Info */}
                <div>
                  <h3 className="font-semibold mb-2">Owner Information</h3>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-12 h-12 bg-boisheba-100 rounded-full flex items-center justify-center">
                      <span className="text-boisheba-600 font-bold">
                        {book.owner.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{book.owner.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-500" />
                        <span>{book.owner.rating}</span>
                        <span>({book.owner.booksLent} books lent)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Borrow Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Borrow This Book</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <DateInput
                    label="Start Date"
                    onChange={(e) =>
                      setBorrowDates((prev) => ({
                        ...prev,
                        startDate: new Date(e.target.value),
                      }))
                    }
                  />
                  <DateInput
                    label="End Date"
                    onChange={(e) =>
                      setBorrowDates((prev) => ({
                        ...prev,
                        endDate: new Date(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <BorrowInfo label="Daily Rate" value={`৳${book.dailyRate}`} />
                  <BorrowInfo
                    label="Deposit (20%)"
                    value={`৳${Math.round(book.fakePrice * 0.2)}`}
                  />
                </div>

                <Button
                  className="w-full bg-boisheba-600 hover:bg-boisheba-700"
                  onClick={handleBorrow}
                  disabled={!book.available}
                >
                  <img
                    src="/boisheba.png"
                    alt="Boisheba Logo"
                    className="w-4 h-4"
                  />
                  Request to Borrow
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-2">
                  Secured by blockchain-based escrow system
                </p>
              </CardContent>
            </Card>

            {/* Image Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Condition Check</CardTitle>
                <CardDescription>
                  Upload "before" and "after" images to detect damage
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">
                      <FileText className="h-4 w-4 mr-1" />
                      Details
                    </TabsTrigger>

                    <TabsTrigger value="compare">
                      <Camera className="h-4 w-4 mr-1" />
                      Compare Images
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <ImageUploadRow
                      beforeImage={beforeImage}
                      afterImage={afterImage}
                      handleImageUpload={handleImageUpload}
                    />
                  </TabsContent>

                  <TabsContent value="compare" className="space-y-4">
                    <ImageUploadRow
                      beforeImage={beforeImage}
                      afterImage={afterImage}
                      handleImageUpload={handleImageUpload}
                    />

                    <Button
                      className="w-full mt-4"
                      onClick={handleCompareImages}
                      disabled={!beforeImage || !afterImage || isComparing}
                    >
                      {isComparing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-boisheba-600 border-t-transparent mr-2"></div>
                          Comparing...
                        </>
                      ) : (
                        <>
                          <img
                            src="/boisheba.png"
                            alt="Boisheba Logo"
                            className="w-4 h-4"
                          />
                          Compare Images
                        </>
                      )}
                    </Button>

                    {/* ✅ Updated Visual Comparison */}
                    {comparisonResult && (
                      <div className="mt-4 p-4 bg-boisheba-50 rounded-lg border border-boisheba-200">
                        <h4 className="font-semibold mb-2 text-boisheba-800 flex items-center">
                          <img
                            src="/boisheba.png"
                            alt="Boisheba Logo"
                            className="w-5 h-5"
                          />
                          Comparison Results
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="font-medium">Similarity Score:</span>
                            <div className="flex items-center mt-1">
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-boisheba-600 rounded-full"
                                  style={{ width: `${comparisonResult.ssim * 100}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm font-medium">{Math.round(comparisonResult.ssim * 100)}%</span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Suggested Fine:</span>
                            <p className="text-lg font-bold text-boisheba-600">৳{comparisonResult.suggestedFine}</p>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Damage Report:</span>
                          <p className="text-sm text-muted-foreground mt-1">{comparisonResult.report}</p>
                        </div>
                        <div className="mt-3">
                          <span className="font-medium">Damage Areas:</span>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {comparisonResult.diffs.map((diff: any, index: number) => (
                              <div key={index} className="text-xs p-2 bg-white rounded border">
                                <span className="font-medium">Severity:</span> {diff.severity}<br />
                                <span className="font-medium">Position:</span> ({diff.x}, {diff.y})<br />
                                <span className="font-medium">Size:</span> {diff.w}x{diff.h}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------ Helper Components ------------------ */
const DetailRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}:</span>
    <span>{value}</span>
  </div>
);

const DateInput = ({
  label,
  onChange,
}: {
  label: string;
  onChange: (e: any) => void;
}) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <input
      type="date"
      className="w-full p-2 border rounded-md"
      onChange={onChange}
    />
  </div>
);

const BorrowInfo = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-xl font-bold text-boisheba-600">{value}</p>
  </div>
);

const ImageUploadRow = ({
  beforeImage,
  afterImage,
  handleImageUpload,
}: any) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <h4 className="font-medium mb-2">Before Loan</h4>
      <UploadImage onImageUploaded={(url) => handleImageUpload(url, "before")} />
      {beforeImage && (
        <img
          src={beforeImage}
          alt="Before loan"
          className="w-full h-32 object-cover rounded-md mt-2"
        />
      )}
    </div>

    <div>
      <h4 className="font-medium mb-2">After Return</h4>
      <UploadImage onImageUploaded={(url) => handleImageUpload(url, "after")} />
      {afterImage && (
        <img
          src={afterImage}
          alt="After return"
          className="w-full h-32 object-cover rounded-md mt-2"
        />
      )}
    </div>
  </div>
);

export default BookDetail;