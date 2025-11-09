// src/pages/Books.tsx
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { getBooks } from "@/utils/api";

const Books = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Extended genres for filtering
  const genres = [
    { value: "all", label: "All Books" },
    { value: "fiction", label: "Fiction" },
    { value: "non-fiction", label: "Non-Fiction" },
    { value: "academic", label: "Academic" },
    { value: "religious", label: "Religious" },
    { value: "children", label: "Children" },
    { value: "classic", label: "Classic Literature" },
    { value: "mystery", label: "Mystery" },
    { value: "romance", label: "Romance" },
    { value: "scifi", label: "Science Fiction" },
  ];

  // Languages for filtering
  const languages = [
    { value: "all", label: "All Languages" },
    { value: "english", label: "English" },
    { value: "bengali", label: "Bengali" },
    { value: "arabic", label: "Arabic" },
  ];

  // Load books on mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getBooks();
        setBooks(data);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Updated filter logic
  const filteredBooks = books.filter((book) => {
  const matchesSearch =
    searchQuery === "" ||
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesGenre =
    selectedGenre === "all" ||
    book.title.toLowerCase().includes(selectedGenre.toLowerCase()) ||
    book.description?.toLowerCase().includes(selectedGenre.toLowerCase());

  const matchesLanguage =
    selectedLanguage === "all" ||
    (selectedLanguage === "bengali" && book.title.includes("বাংলা")) ||
    (selectedLanguage === "arabic" && book.title.includes("عربي")) ||
    (selectedLanguage === "english" &&
      !book.title.includes("বাংলা") &&
      !book.title.includes("عربي"));

  return matchesSearch && matchesGenre && matchesLanguage;
});

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Books</h1>
          <p className="text-muted-foreground">
            Discover books from our community collection
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-8 space-y-4">
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

          <div className="flex flex-wrap gap-4">
            {/* Genre Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-boisheba-600" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="border-boisheba-200 focus:border-boisheba-400 text-boisheba-700 rounded-md px-3 py-2 text-sm"
              >
                {genres.map((genre) => (
                  <option key={genre.value} value={genre.value}>
                    {genre.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-boisheba-600" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="border-boisheba-200 focus:border-boisheba-400 text-boisheba-700 rounded-md px-3 py-2 text-sm"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-boisheba-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              Found {filteredBooks.length} books
            </div>

            {/* Books Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* No Results */}
            {filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-boisheba-200">📚</div>
                <h3 className="text-xl font-semibold mb-2">No books found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Try adjusting your search terms or filters to find what you're
                  looking for.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-boisheba-600 text-boisheba-600 hover:bg-boisheba-50"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedGenre("all");
                    setSelectedLanguage("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ✅ UPDATED BOOKCARD COMPONENT
const BookCard = ({ book }: { book: any }) => {
  return (
    <Card className="overflow-hidden hover:shadow-medium transition-shadow">
      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
        <img
          src={book.coverImageUrl || "/placeholder.svg"}
          alt={book.title}
          className="w-full h-full object-cover"
        />

        {/* Availability Badge */}
        <div className="absolute top-2 right-2">
          <Badge
            variant={book.available ? "default" : "secondary"}
            className={book.available ? "bg-boisheba-600" : ""}
          >
            {book.available ? "Available" : "Lent"}
          </Badge>
        </div>

        {/* Language Badge */}
        {book.language && (
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="text-xs">
              {book.language === "bengali"
                ? "বাংলা"
                : book.language === "arabic"
                ? "عربي"
                : book.language === "english"
                ? "EN"
                : book.language}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-1">{book.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{book.author}</p>

        {/* Condition + Rate */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Condition</p>
            <p className="text-sm font-medium">{book.condition}</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">Daily Rate</p>
            <p className="text-lg font-bold text-boisheba-600">
              ৳{book.rentalPricePerDay}
            </p>
          </div>
        </div>

        {/* View Details Button */}
        <div className="mt-3 pt-3 border-t">
          <Button
            className="w-full bg-boisheba-600 hover:bg-boisheba-700 flex items-center justify-center gap-2"
            asChild
            disabled={!book.available}
          >
            <Link to={`/books/${book.id}`}>
              <img
                src="/boisheba.png"
                alt="Boisheba Logo"
                className="w-4 h-4"
              />
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Books;
