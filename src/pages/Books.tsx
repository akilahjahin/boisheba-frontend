import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

// Mock book data
const mockBooks = [
  {
    id: 1,
    title: "The Alchemist",
    author: "Paulo Coelho",
    condition: "Excellent",
    available: true,
    deposit: 500,
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    condition: "Good",
    available: false,
    deposit: 400,
  },
  {
    id: 3,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    condition: "Very Good",
    available: true,
    deposit: 450,
  },
  {
    id: 4,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    condition: "Good",
    available: true,
    deposit: 350,
  },
];

const Books = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = mockBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Browse Books</h1>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No books found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const BookCard = ({ book }: { book: typeof mockBooks[0] }) => {
  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
          <Badge variant={book.available ? "default" : "secondary"}>
            {book.available ? "Available" : "Lent"}
          </Badge>
        </div>
        <CardDescription>{book.author}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Condition:</span>
            <span className="font-medium">{book.condition}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Deposit:</span>
            <span className="font-medium">৳{book.deposit}</span>
          </div>
        </div>
        <Button className="w-full" asChild disabled={!book.available}>
          <Link to={`/books/${book.id}`}>
            {book.available ? "View Details" : "Unavailable"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default Books;
