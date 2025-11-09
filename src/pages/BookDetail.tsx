// src/pages/BookDetail.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, MapPin, Star, Shield, Camera, Upload, FileText, CheckCircle, AlertCircle, Book as BookIcon, User, Eye, TrendingUp, Mail, Phone, Award, BookOpen, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { getBookById, createTransaction, Book, BookStatus, getUser, User as UserType, getCurrentUser } from "@/utils/api";
import { compareImages } from "@/lib/tesseract";
import UploadImage from "@/components/UploadImage";
import { useTranslation } from "@/lib/i18n";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownerDetails, setOwnerDetails] = useState<UserType | null>(null);
  const [loadingOwner, setLoadingOwner] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [ownerName, setOwnerName] = useState<string>("Loading...");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("details");

  const [borrowDates, setBorrowDates] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);

  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Load current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUserId(user.id);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        // User might not be logged in, which is okay
        setCurrentUserId(null);
      }
    };
    fetchCurrentUser();
  }, []);

  // Load book on mount
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookId = parseInt(id || "0", 10);
        if (!bookId) {
          toast.error("Invalid book ID");
          navigate("/books");
          return;
        }
        const data = await getBookById(bookId);
        setBook(data);
        
        // Fetch owner name if available
        if (data.ownerId) {
          try {
            const owner = await getUser(data.ownerId);
            setOwnerName(owner.name || "Unknown Owner");
          } catch (error) {
            console.error("Failed to fetch owner name:", error);
            setOwnerName(data.ownerName || "Unknown Owner");
          }
        }
      } catch (error) {
        console.error("Failed to fetch book:", error);
        toast.error("Failed to load book details");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, navigate]);

  // Fetch owner details
  const fetchOwnerDetails = async () => {
    if (!book?.ownerId) {
      toast.error("Owner information not available");
      return;
    }

    setLoadingOwner(true);
    try {
      const ownerData = await getUser(book.ownerId);
      setOwnerDetails(ownerData);
      setShowOwnerModal(true);
    } catch (error) {
      console.error("Failed to fetch owner details:", error);
      toast.error("Failed to load owner details");
    } finally {
      setLoadingOwner(false);
    }
  };

  const handleBorrow = () => {
    if (!book) return;
    
    if (!borrowDates.startDate || !borrowDates.endDate) {
      toast.error("Please select borrow dates");
      return;
    }

    const days = Math.ceil(
      (borrowDates.endDate.getTime() - borrowDates.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const totalCost = days * book.rentalPricePerDay;
    const deposit = book.suggestedDeposit;

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
      bookId: String(book.id),
      borrowerId: "current-user",
      lenderId: String(book.ownerId),
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

  // Helper to get status badge variant
  const getStatusBadgeVariant = (status: BookStatus) => {
    switch (status) {
      case BookStatus.APPROVED:
      case BookStatus.ACTIVE:
        return "default";
      case BookStatus.PENDING_APPROVAL:
        return "secondary";
      case BookStatus.REJECTED:
      case BookStatus.DELETED:
        return "destructive";
      case BookStatus.BORROWED:
        return "outline";
      default:
        return "secondary";
    }
  };

  // Helper to format status text
  const formatStatus = (status: BookStatus) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Check if current user is the owner of this book
  const isOwner = currentUserId && book && String(book.ownerId) === currentUserId;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/books")}
            className="mb-2"
          >
            ← Back to Books
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl">{book.title}</CardTitle>
                    <CardDescription className="text-lg mt-2">by {book.author}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge
                      variant={book.available ? "default" : "secondary"}
                      className={book.available ? "bg-boisheba-600" : ""}
                    >
                      {book.available ? "Available" : "Borrowed"}
                    </Badge>
                    {book.verified && (
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Image */}
                <div className="aspect-[3/4] relative overflow-hidden bg-muted rounded-lg">
                  <img
                    src={book.coverImageUrl || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  {!book.available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge variant="secondary" className="text-base">
                        Currently Borrowed
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Book Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Eye className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-bold text-boisheba-600">{book.viewCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-bold text-boisheba-600">{book.borrowCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Borrows</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Star className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-bold text-boisheba-600">
                      {book.averageRating ? book.averageRating.toFixed(1) : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>

                {/* Publication & Condition */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BookIcon className="h-4 w-4" />
                      Publication Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <DetailRow label="Publisher" value={book.publisher || "N/A"} />
                      <DetailRow label="ISBN" value={book.isbn || "N/A"} />
                      <DetailRow label="Edition" value={book.edition || "N/A"} />
                      <DetailRow label="Language" value={book.language || "N/A"} />
                      <DetailRow label="Year" value={book.publicationYear || "N/A"} />
                      <DetailRow label="Pages" value={book.totalPages || "N/A"} />
                      <DetailRow label="Category" value={book.category?.replace(/_/g, ' ') || "N/A"} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Book Status
                    </h3>
                    <div className="space-y-2 text-sm">
                      <DetailRow 
                        label="Condition" 
                        value={
                          <Badge variant="outline">
                            {book.condition?.replace(/_/g, ' ')}
                          </Badge>
                        } 
                      />
                      <DetailRow 
                        label="Status" 
                        value={
                          <Badge variant={getStatusBadgeVariant(book.status)}>
                            {formatStatus(book.status)}
                          </Badge>
                        } 
                      />
                      <DetailRow 
                        label="Availability" 
                        value={book.available ? "Available" : "Borrowed"} 
                      />
                      {book.createdAt && (
                        <DetailRow 
                          label="Listed" 
                          value={format(new Date(book.createdAt), "MMM dd, yyyy")} 
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {book.description && (
                  <div>
                    <h3 className="font-semibold mb-3">Description</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {book.tags && book.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {book.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                {book.location && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {book.location}
                    </p>
                    {book.distanceKm && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Approximately {book.distanceKm.toFixed(1)} km away
                      </p>
                    )}
                  </div>
                )}

                {/* Owner Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Owner Information
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-12 h-12 bg-boisheba-100 rounded-full flex items-center justify-center">
                      {ownerName && ownerName !== "Loading..." && ownerName !== "Unknown Owner" ? (
                        <span className="text-boisheba-600 font-bold text-lg">
                          {ownerName.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User className="h-6 w-6 text-boisheba-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{ownerName}</p>
                      <p className="text-sm text-muted-foreground">
                        Owner ID: {book.ownerId}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchOwnerDetails}
                      disabled={loadingOwner}
                      className="ml-auto"
                    >
                      {loadingOwner ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-boisheba-600 border-t-transparent mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Borrow Card - Only show if user is not the owner */}
            {!isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {book.available ? "Borrow This Book" : "Currently Unavailable"}
                  </CardTitle>
                  {book.available && (
                    <CardDescription>
                      Select your rental period
                    </CardDescription>
                  )}
                </CardHeader>

              <CardContent className="space-y-4">
                {/* Pricing Info - Always visible */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-boisheba-50 rounded-lg border border-boisheba-100">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Daily Rate</p>
                    <p className="text-2xl font-bold text-boisheba-600">
                      ৳{book.rentalPricePerDay}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Security Deposit</p>
                    <p className="text-2xl font-bold text-boisheba-600">
                      ৳{book.suggestedDeposit}
                    </p>
                  </div>
                </div>

                {book.available ? (
                  <>
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

                    {/* Cost Calculation */}
                    {borrowDates.startDate && borrowDates.endDate && (
                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Duration:</span>
                          <span className="font-medium">
                            {Math.ceil(
                              (borrowDates.endDate.getTime() - borrowDates.startDate.getTime()) /
                                (1000 * 60 * 60 * 24)
                            )} days
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Rental Cost:</span>
                          <span className="font-medium">
                            ৳
                            {Math.ceil(
                              (borrowDates.endDate.getTime() - borrowDates.startDate.getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) * book.rentalPricePerDay}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Deposit:</span>
                          <span className="font-medium">৳{book.suggestedDeposit}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-boisheba-600">
                            ৳
                            {Math.ceil(
                              (borrowDates.endDate.getTime() - borrowDates.startDate.getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) * book.rentalPricePerDay +
                              book.suggestedDeposit}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full bg-boisheba-600 hover:bg-boisheba-700"
                      onClick={handleBorrow}
                      disabled={!book.available}
                    >
                      <img
                        src="/boisheba.png"
                        alt="Boisheba Logo"
                        className="w-4 h-4 mr-2"
                      />
                      Request to Borrow
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Secured by blockchain-based escrow system
                    </p>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      This book is currently borrowed by another user.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate("/books")}
                    >
                      Browse Other Books
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            )}

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

        {/* Owner Details Modal */}
        <Dialog open={showOwnerModal} onOpenChange={setShowOwnerModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <User className="h-6 w-6 text-boisheba-600" />
                Owner Details
              </DialogTitle>
              <DialogDescription>
                Complete information about the book owner
              </DialogDescription>
            </DialogHeader>

            {ownerDetails && (
              <div className="space-y-6 mt-4">
                {/* Profile Section */}
                <div className="flex items-start gap-6 p-6 bg-gradient-to-br from-boisheba-50 to-boisheba-100/50 rounded-lg border border-boisheba-200">
                  <div className="relative">
                    {ownerDetails.profileImageUrl || ownerDetails.avatar ? (
                      <img
                        src={ownerDetails.profileImageUrl || ownerDetails.avatar || ""}
                        alt={ownerDetails.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-boisheba-600 flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-white font-bold text-3xl">
                          {ownerDetails.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    {ownerDetails.emailVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-white">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-boisheba-800 mb-1">
                      {ownerDetails.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={ownerDetails.status === "ACTIVE" ? "default" : "secondary"} className="bg-boisheba-600">
                        {ownerDetails.status || "Active"}
                      </Badge>
                      {ownerDetails.role && (
                        <Badge variant="outline">
                          {ownerDetails.role}
                        </Badge>
                      )}
                      {ownerDetails.emailVerified && (
                        <Badge variant="outline" className="border-green-600 text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {ownerDetails.bio && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {ownerDetails.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{ownerDetails.email}</p>
                      </div>
                      {ownerDetails.emailVerified && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    
                    {ownerDetails.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{ownerDetails.phone}</p>
                        </div>
                        {ownerDetails.phoneVerified && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    )}

                    {(ownerDetails.address || ownerDetails.city || ownerDetails.district) && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="font-medium">
                            {[
                              ownerDetails.address,
                              ownerDetails.city,
                              ownerDetails.district,
                              ownerDetails.postalCode
                            ].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-boisheba-100 flex items-center justify-center mb-2">
                          <Award className="h-6 w-6 text-boisheba-600" />
                        </div>
                        <p className="text-2xl font-bold text-boisheba-600">
                          {ownerDetails.trustScore?.toFixed(1) || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">Trust Score</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {ownerDetails.totalBooksListed || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Books Listed</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          {ownerDetails.totalBooksLent || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Books Lent</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                          <BookIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                          {ownerDetails.totalBooksBorrowed || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Books Borrowed</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                          <Star className="h-6 w-6 text-yellow-600" />
                        </div>
                        <p className="text-2xl font-bold text-yellow-600">
                          {ownerDetails.averageRating?.toFixed(1) || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rating ({ownerDetails.totalRatings || 0})
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                          <CheckCircle className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">
                          {ownerDetails.completedTransactions || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Member Since:</span>
                      <span className="font-medium">
                        {ownerDetails.createdAt 
                          ? format(new Date(ownerDetails.createdAt), "MMMM dd, yyyy")
                          : "N/A"}
                      </span>
                    </div>
                    {ownerDetails.lastLoginAt && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Last Login:</span>
                        <span className="font-medium">
                          {format(new Date(ownerDetails.lastLoginAt), "MMM dd, yyyy 'at' HH:mm")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Account Status:</span>
                      <Badge variant={ownerDetails.status === "ACTIVE" ? "default" : "secondary"}>
                        {ownerDetails.status || "Active"}
                      </Badge>
                    </div>
                    {ownerDetails.latitude && ownerDetails.longitude && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium text-xs">
                          {ownerDetails.latitude.toFixed(6)}, {ownerDetails.longitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Action Button */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowOwnerModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

/* ------------------ Helper Components ------------------ */
const DetailRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium text-right">{value}</span>
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
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-3">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-boisheba-100 text-boisheba-600 text-xs font-bold">
          1
        </span>
        Before Loan
      </h4>
      <UploadImage 
        onImageUploaded={(url) => handleImageUpload(url, "before")} 
        showOCR={false}
      />
      {beforeImage && (
        <div className="relative">
          <img
            src={beforeImage}
            alt="Before loan"
            className="w-full h-40 object-cover rounded-md border-2 border-boisheba-200"
          />
          <Badge className="absolute top-2 left-2 bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Uploaded
          </Badge>
        </div>
      )}
    </div>

    <div className="space-y-3">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-boisheba-100 text-boisheba-600 text-xs font-bold">
          2
        </span>
        After Return
      </h4>
      <UploadImage 
        onImageUploaded={(url) => handleImageUpload(url, "after")} 
        showOCR={false}
      />
      {afterImage && (
        <div className="relative">
          <img
            src={afterImage}
            alt="After return"
            className="w-full h-40 object-cover rounded-md border-2 border-boisheba-200"
          />
          <Badge className="absolute top-2 left-2 bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Uploaded
          </Badge>
        </div>
      )}
    </div>
  </div>
);

export default BookDetail;