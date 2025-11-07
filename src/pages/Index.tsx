// src/pages/Index.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Index = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    "/img_1.jpg",
    "/img_2.jpg",
    "/img_3.jpg",
    "/img_4.jpg",
    "/img_5.jpg",
    "/img_6.jpg"
  ];

  // Image credits information
  const imageCredits = [
    { credit: "Noor-A-Alam | Habibur Rahman (Habib chacha) - TBS News" },
    { credit: "ITTEFAQ | Shishu Chattar - Ekushey Boi Mela" },
    { credit: "Orchid Chakma | Struggles of Nilkhet booksellers: The Daily Star" },
    { credit: "Ashraful Haque | Baatighar, Bishwo Shahitto Kendro - TBS News" },
    { credit: "[Unknown] | Baatighar, Bishwo Shahitto Kendro - TBS News" },
    { credit: "Shariful Islam - Bangla Old Books | TBS News" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Sliding Images */}
      <section className="relative h-[90vh] overflow-hidden">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <div className="flex justify-center mb-4">
                  <img
                    src="/boisheba.png"
                    alt="Boisheba Logo"
                    className="w-24 h-24"
                  />
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Share Books, Build Community
                </h1>
                <p className="text-l text-white/87 mb-8 max-w-2xl mx-auto">
                  BoiSheba connects book lovers through AI-powered lending. Share your collection, discover new reads, and earn while helping others.
                </p>
                <br></br>
                <br></br>
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
            {/* Image Attribution Overlay */}
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              Photo: {imageCredits[index].credit}
            </div>
          </div>
        ))}

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentImage ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setCurrentImage(index)}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How BoiSheba Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="AI-Powered OCR"
              description="Upload a photo of your book. Our AI extracts title, author, and condition automatically."
            />
            <FeatureCard
              title="Smart Recommendations"
              description="Discover books based on your reading history and community preferences."
            />
            <FeatureCard
              title="Secure Lending"
              description="Blockchain-secured deposits ensure your books are returned safely."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/boisheba.png"
              alt="Boisheba Logo"
              className="w-16 h-16"
            />
          </div>
          <h2 className="text-3xl font-bold mb-4">Ready to Share Your Library?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of book lovers sharing knowledge and building connections.
          </p>
          <Button size="lg" asChild>
            <Link to="/signup">Create Your Library</Link>
          </Button>
        </div>
      </section>

      {/* Image Credits Section */}
      <section className="py-8 px-4 bg-muted/30 border-t">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">Image Credits</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
            {imageCredits.map((credit, index) => (
              <div key={index} className="flex flex-col">
                <span className="font-medium">Image {index + 1}:</span>
                <span>{credit.credit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-soft hover:shadow-medium transition-shadow">
      <div className="flex justify-center mb-4">
        <img
          src="/boisheba.png"
          alt="Boisheba Logo"
          className="w-12 h-12"
        />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-muted-foreground text-center">{description}</p>
    </div>
  );
};

export default Index;