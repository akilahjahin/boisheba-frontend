import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, MessageSquare, X, Minimize2, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { getCurrentUser, getBooksByOwner, Book } from "@/utils/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const BookChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userBooks, setUserBooks] = useState<Book[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini
  const genAI = import.meta.env.VITE_GEMINI_API_KEY
    ? new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
    : null;

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getCurrentUser();
        setUserData(user);

        // Load user's books
        const booksResponse = await getBooksByOwner(Number(user.id), 0, 100);
        setUserBooks(booksResponse.content || []);
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };

    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Build context for Gemini
  const buildContext = () => {
    const booksList = userBooks
      .map(
        (book, idx) =>
          `${idx + 1}. "${book.title}" by ${book.author} - ${book.category} - Status: ${
            book.available ? "Available" : "Borrowed"
          } - Daily Rate: ৳${book.rentalPricePerDay} - Condition: ${book.condition}`
      )
      .join("\n");

    return `You are a helpful AI assistant for BoiSheba, a book-sharing platform. You're helping a user manage their books and transactions.

User Information:
- Name: ${userData?.name || "Unknown"}
- Total Books Listed: ${userBooks.length}
- Available Books: ${userBooks.filter((b) => b.available).length}
- Currently Borrowed: ${userBooks.filter((b) => !b.available).length}
- Trust Score: ${userData?.trustScore || "N/A"}
- Average Rating: ${userData?.averageRating || "N/A"}

User's Books:
${booksList || "No books listed yet."}

You can answer questions about:
- What books the user has
- Which books are available or borrowed
- Book details (author, category, price, condition)
- Statistics about their book collection
- Recommendations for pricing or managing books
- General book-sharing advice

Keep answers concise and friendly. Use ৳ symbol for prices. If asked about transactions or borrowers, explain that detailed transaction data requires database access, but you can see which books are currently borrowed (not available).`;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (!genAI) {
      toast.error("Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const context = buildContext();
      const prompt = `${context}\n\nUser Question: ${input}\n\nAssistant:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const assistantMessage: Message = {
        role: "assistant",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling Gemini:", error);
      toast.error("Failed to get response from AI assistant");
      
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again or rephrase your question.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What books do I have?",
    "Which books are currently borrowed?",
    "What's my most expensive book?",
    "Show me books by category",
    "How many fiction books do I have?",
  ];

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-boisheba-600 hover:bg-boisheba-700 z-50"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-6 right-6 w-80 shadow-xl z-50">
        <CardHeader className="flex flex-row items-center justify-between py-3 cursor-pointer" onClick={() => setIsMinimized(false)}>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-boisheba-600" />
            <CardTitle className="text-sm">Book Assistant</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-xl flex flex-col z-50">
      <CardHeader className="flex flex-row items-center justify-between py-3 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-boisheba-100 flex items-center justify-center">
            <Bot className="h-5 w-5 text-boisheba-600" />
          </div>
          <div>
            <CardTitle className="text-sm">Book Assistant</CardTitle>
            <p className="text-xs text-muted-foreground">Powered by Gemini AI</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-boisheba-100 flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-boisheba-600" />
                </div>
                <h3 className="font-semibold mb-2">Hello! I'm your Book Assistant</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  I can help you manage your books and answer questions about your collection.
                </p>
                <div className="text-left space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Try asking:</p>
                  {suggestedQuestions.map((q, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => {
                        setInput(q);
                        handleSendMessage();
                      }}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-boisheba-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-boisheba-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-boisheba-600 text-white"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === "user" ? "text-boisheba-100" : "text-muted-foreground"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-boisheba-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {userData?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-boisheba-100 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-boisheba-600" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your books..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              size="icon"
              className="bg-boisheba-600 hover:bg-boisheba-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Analyzing {userBooks.length} books in your collection
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookChatbot;
