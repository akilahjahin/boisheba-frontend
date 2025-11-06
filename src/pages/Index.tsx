import { Button } from "@/components/ui/button";
import { BookOpen, Search, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Share Books, Build Community
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              BoiSheba connects book lovers through AI-powered lending. Share your collection, discover new reads, and earn while helping others.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20" asChild>
                <Link to="/books">Browse Books</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How BoiSheba Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="AI-Powered OCR"
              description="Upload a photo of your book. Our AI extracts title, author, and condition automatically."
            />
            <FeatureCard
              icon={<Search className="w-8 h-8" />}
              title="Smart Recommendations"
              description="Discover books based on your reading history and community preferences."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Secure Lending"
              description="Blockchain-secured deposits ensure your books are returned safely."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl font-bold mb-4">Ready to Share Your Library?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of book lovers sharing knowledge and building connections.
          </p>
          <Button size="lg" asChild>
            <Link to="/signup">Create Your Library</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-soft hover:shadow-medium transition-shadow">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;
