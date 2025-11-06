import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Star, Shield } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Mock book data
  const book = {
    id: parseInt(id || "1"),
    title: "The Alchemist",
    author: "Paulo Coelho",
    condition: "Excellent",
    conditionScore: 9.2,
    deposit: 500,
    dailyRate: 20,
    description: "A timeless tale about following your dreams and listening to your heart.",
    location: "Dhaka, Bangladesh",
    owner: {
      name: "Sarah Ahmed",
      rating: 4.8,
      booksLent: 23,
    },
    isbn: "978-0-06-112241-5",
  };

  const handleBorrow = () => {
    if (!startDate || !endDate) {
      toast.error("Please select borrow dates");
      return;
    }

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalCost = days * book.dailyRate;

    toast.info(`Total cost: ৳${totalCost + book.deposit} (including ৳${book.deposit} deposit)`);
    
    // TODO: Navigate to payment/escrow flow
    setTimeout(() => {
      toast.success("Borrow request sent! Awaiting owner approval.");
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Book Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Title & Badges */}
                <div>
                  <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
                  <p className="text-xl text-muted-foreground mb-4">{book.author}</p>
                  <div className="flex gap-2">
                    <Badge variant="default">{book.condition}</Badge>
                    <Badge variant="outline">ISBN: {book.isbn}</Badge>
                  </div>
                </div>

                {/* AI Condition Score */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">AI Condition Score</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-primary">{book.conditionScore}</div>
                    <p className="text-sm text-muted-foreground">
                      Based on automated analysis of cover wear, page condition, and binding integrity.
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{book.description}</p>
                </div>

                {/* Owner Info */}
                <div>
                  <h3 className="font-semibold mb-3">Book Owner</h3>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {book.owner.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{book.owner.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          {book.owner.rating}
                        </span>
                        <span>{book.owner.booksLent} books lent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Borrow Card */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Rate:</span>
                    <span className="font-semibold">৳{book.dailyRate}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit:</span>
                    <span className="font-semibold">৳{book.deposit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {book.location}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => !startDate || date <= startDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleBorrow}>
                  Borrow This Book
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secured by blockchain-based escrow
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
