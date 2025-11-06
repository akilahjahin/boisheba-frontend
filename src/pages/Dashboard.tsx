import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data
  const stats = {
    booksShared: 12,
    booksLent: 8,
    booksBorrowed: 5,
    reputation: 4.8,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your books and borrowing activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<BookOpen />} label="Books Shared" value={stats.booksShared} />
          <StatCard icon={<TrendingUp />} label="Books Lent" value={stats.booksLent} />
          <StatCard icon={<Users />} label="Books Borrowed" value={stats.booksBorrowed} />
          <StatCard icon={<TrendingUp />} label="Reputation" value={stats.reputation} suffix="★" />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link to="/add-book">
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/books">Browse Books</Link>
            </Button>
          </div>
        </div>

        {/* My Books Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Books</h2>
            <Button variant="ghost" asChild>
              <Link to="/my-books">View All</Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Placeholder book cards */}
            <BookCard
              title="The Alchemist"
              author="Paulo Coelho"
              status="available"
            />
            <BookCard
              title="1984"
              author="George Orwell"
              status="lent"
            />
            <BookCard
              title="To Kill a Mockingbird"
              author="Harper Lee"
              status="available"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, suffix = "" }: { icon: React.ReactNode; label: string; value: number; suffix?: string }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}{suffix}</p>
          </div>
          <div className="text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const BookCard = ({ title, author, status }: { title: string; author: string; status: string }) => {
  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant={status === "available" ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>
        <CardDescription>{author}</CardDescription>
      </CardHeader>
    </Card>
  );
};

export default Dashboard;
