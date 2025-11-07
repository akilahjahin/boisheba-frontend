import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book as BookType } from '@/utils/api';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

interface BookCardProps {
  book: BookType;
}

export default function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
        <img
          src={book.images[0]}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        {!book.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="secondary" className="text-base">
              Currently Unavailable
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold line-clamp-2 min-h-[3rem]">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          by {book.author}
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{book.ownerName}</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs text-muted-foreground">Daily Rate</p>
            <p className="text-lg font-bold text-primary">৳{book.dailyRate}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Condition</p>
            <Badge variant="outline">{book.conditionScore}/100</Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={() => navigate(`/books/${book.id}`)}
          variant={book.available ? 'default' : 'outline'}
          disabled={!book.available}
          aria-label={`View details for ${book.title}`}
        >
          <img
            src="/boisheba.png"
            alt="Boisheba Logo"
            className="mr-2 h-4 w-4"
          />
          {book.available ? 'View Details' : 'Unavailable'}
        </Button>
      </CardFooter>
    </Card>
  );
}