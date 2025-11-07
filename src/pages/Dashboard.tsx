import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Dashboard = () => {
  // Mock data
  const stats = {
    booksShared: 12,
    booksLent: 8,
    booksBorrowed: 5,
    reputation: 4.8,
    totalEarnings: 2450,
    activeTransactions: 3,
  };

  // Mock book data
  const [myBooks] = useState([
    {
      id: "1",
      title: "The Alchemist",
      author: "Paulo Coelho",
      status: "available",
      dailyRate: 30,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    {
      id: "2",
      title: "1984",
      author: "George Orwell",
      status: "lent",
      dailyRate: 35,
      image:
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
    },
    {
      id: "3",
      title: "পথের দাবা",
      author: "তারাশঙ্কর বন্দ্যোপাধ্যায়",
      status: "available",
      dailyRate: 25,
      image:
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
    },
  ]);

  // Mock borrowed books
  const [borrowedBooks] = useState([
    {
      id: "7",
      title: "Pride and Prejudice",
      author: "Jane Austen",
      returnDate: "2025-01-25",
      dailyRate: 28,
      image:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    },
    {
      id: "8",
      title: "সংহতি",
      author: "শরৎচন্দ্র চট্টোপাধ্যায়",
      returnDate: "2025-01-30",
      dailyRate: 20,
      image:
        "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400",
    },
  ]);

  // Mock recommendations
  const [recommendations] = useState([
    {
      id: "9",
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400",
    },
    {
      id: "10",
      title: "অপরাজিত",
      author: "হুমায়ূন আহমেদ",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    },
    {
      id: "11",
      title: "The Kite Runner",
      author: "Khaled Hosseini",
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400",
    },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your books and borrowing activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<BookOpen className="h-5 w-5 text-boisheba-600" />}
            label="Books Shared"
            value={stats.booksShared}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-boisheba-600" />}
            label="Books Lent"
            value={stats.booksLent}
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-boisheba-600" />}
            label="Books Borrowed"
            value={stats.booksBorrowed}
          />
          <StatCard
            icon={<Star className="h-5 w-5 text-boisheba-600" />}
            label="Reputation"
            value={stats.reputation}
            suffix="★"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <StatCard
            icon={<DollarSign className="h-5 w-5 text-boisheba-600" />}
            label="Total Earnings"
            value={stats.totalEarnings}
            prefix="৳"
          />
          <StatCard
            icon={<Calendar className="h-5 w-5 text-boisheba-600" />}
            label="Active Transactions"
            value={stats.activeTransactions}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-boisheba-600 hover:bg-boisheba-700" asChild>
              <Link to="/add-book">
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-boisheba-600 text-boisheba-600 hover:bg-boisheba-50"
              asChild
            >
              <Link to="/books">Browse Books</Link>
            </Button>
            <Button
              variant="outline"
              className="border-boisheba-600 text-boisheba-600 hover:bg-boisheba-50"
              asChild
            >
              <Link to="/transactions">View Transactions</Link>
            </Button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* My Books */}
          <Section title="My Books" link="/my-books">
            {myBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </Section>

          {/* Borrowed Books */}
          <Section title="Borrowed Books" link="/borrowed-books">
            {borrowedBooks.map((book) => (
              <BorrowedBookCard key={book.id} book={book} />
            ))}
          </Section>

          {/* Recommendations */}
          <Section title="Recommended for You" link="/recommendations">
            {recommendations.map((book) => (
              <RecommendationCard key={book.id} book={book} />
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
};

// ----------------------------
// Reusable Components
// ----------------------------

const StatCard = ({ icon, label, value, suffix = "", prefix = "" }: any) => (
  <Card className="shadow-soft hover:shadow-medium transition-shadow">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">
            {prefix}
            {value}
            {suffix}
          </p>
        </div>
        <div className="p-2 bg-boisheba-50 rounded-full">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const Section = ({
  title,
  link,
  children,
}: {
  title: string;
  link: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Button
        variant="ghost"
        className="text-boisheba-600 hover:text-boisheba-700"
        asChild
      >
        <Link to={link}>View All</Link>
      </Button>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
  </div>
);

// ----------------------------
// ✅ Updated BookCard Components
// ----------------------------

const BookCard = ({ book }: { book: any }) => {
  return (
    <Card className="overflow-hidden hover:shadow-medium transition-shadow">
      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
        <img
          src={book.image}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge
            variant={book.status === "available" ? "default" : "secondary"}
            className={book.status === "available" ? "bg-boisheba-600" : ""}
          >
            {book.status === "available" ? "Available" : "Lent"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-1">{book.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{book.author}</p>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-boisheba-600">
            ৳{book.dailyRate}/day
          </span>
          <img
            src="/boisheba.png"
            alt="Boisheba Logo"
            className="h-5 w-5"
          />
        </div>
      </CardContent>
    </Card>
  );
};

const BorrowedBookCard = ({ book }: { book: any }) => {
  return (
    <Card className="overflow-hidden hover:shadow-medium transition-shadow">
      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
        <img
          src={book.image}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge
            variant="outline"
            className="bg-orange-100 text-orange-800 border-orange-200"
          >
            Borrowed
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-1">{book.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{book.author}</p>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-muted-foreground">Return by</span>
            <span className="text-sm font-medium text-orange-600">
              {book.returnDate}
            </span>
          </div>
          <img
            src="/boisheba.png"
            alt="Boisheba Logo"
            className="h-5 w-5"
          />
        </div>
      </CardContent>
    </Card>
  );
};

const RecommendationCard = ({ book }: { book: any }) => {
  return (
    <Card className="overflow-hidden hover:shadow-medium transition-shadow">
      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
        <img
          src={book.image}
          alt={book.title}
          className="w-full h-full object-cover"
        />

        <div className="absolute top-2 right-2">
          <div className="flex items-center bg-white/90 rounded-full px-2 py-1">
            <Star className="h-3 w-3 text-yellow-500 mr-1" />
            <span className="text-xs font-medium">{book.rating}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-1">{book.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{book.author}</p>

        <div className="flex justify-between items-center">
          <Button size="sm" className="bg-boisheba-600 hover:bg-boisheba-700">
            <img
              src="/boisheba.png"
              alt="Boisheba Logo"
              className="w-4 h-4 mr-2"
            />
            View Details
          </Button>

          <img
            src="/boisheba.png"
            alt="Boisheba Logo"
            className="h-5 w-5"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
