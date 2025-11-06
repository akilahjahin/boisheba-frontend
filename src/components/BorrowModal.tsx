import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { differenceInDays, format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Book, createBorrowRequest } from '@/utils/api';
import { useTranslation } from '@/lib/i18n';

interface BorrowModalProps {
  book: Book;
  open: boolean;
  onClose: () => void;
}

export default function BorrowModal({ book, open, onClose }: BorrowModalProps) {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const days = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;
  const totalCost = days * book.dailyRate;

  const handleConfirm = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (endDate < startDate) {
      toast.error('End date must be after start date');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: In production, this will initiate blockchain escrow transaction
      await createBorrowRequest({
        bookId: book.id,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        totalCost,
        deposit: book.deposit,
      });

      toast.success('Borrow request submitted! (Demo mode: No actual transaction)');
      onClose();
    } catch (error) {
      toast.error('Failed to submit borrow request');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('borrow.title')}</DialogTitle>
          <DialogDescription>
            {book.title} by {book.author}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">{t('borrow.selectDates')}</Label>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">{t('borrow.from')}</Label>
                <div className="border rounded-md p-3">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    className="w-full"
                  />
                </div>
                {startDate && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(startDate, 'PPP')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">{t('borrow.to')}</Label>
                <div className="border rounded-md p-3">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < (startDate || new Date())}
                    className="w-full"
                  />
                </div>
                {endDate && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(endDate, 'PPP')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          {days > 0 && (
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">{t('borrow.summary')}</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('borrow.days')}:</span>
                  <span className="font-medium">{days}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>{t('bookDetail.dailyRate')}:</span>
                  <span className="font-medium">৳{book.dailyRate}</span>
                </div>
                
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">{t('borrow.totalCost')}:</span>
                  <span className="font-bold text-primary">৳{totalCost}</span>
                </div>
                
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">{t('borrow.depositRequired')}:</span>
                  <span className="font-bold text-amber-600">৳{book.deposit}</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">
                <p>
                  💡 <strong>Demo Mode:</strong> In production, this will create a blockchain-backed escrow transaction. 
                  The deposit (৳{book.deposit}) will be locked until the book is returned in good condition.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('borrow.cancel')}
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!startDate || !endDate || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              t('borrow.confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
