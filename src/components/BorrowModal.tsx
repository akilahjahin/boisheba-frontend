import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { differenceInDays, format } from 'date-fns';
import {
  CalendarIcon,
  Loader2,
  CreditCard,
  Smartphone,
  Wallet,
  AlertCircle
} from 'lucide-react';
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
  const [paymentMethod, setPaymentMethod] =
    useState<'bkash' | 'rocket' | 'nagad' | 'sheba-wallet'>('bkash');

  const days = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;
  const totalCost = days * book.dailyRate;
  const deposit = Math.round(book.fakePrice * 0.2); // 20% deposit

  const paymentMethods = [
    { id: 'bkash', name: 'bKash', icon: <Smartphone className="h-5 w-5" />, color: 'bg-pink-500' },
    { id: 'rocket', name: 'Rocket', icon: <CreditCard className="h-5 w-5" />, color: 'bg-purple-500' },
    { id: 'nagad', name: 'Nagad', icon: <Wallet className="h-5 w-5" />, color: 'bg-orange-500' },
    { id: 'sheba-wallet', name: 'Sheba Wallet', icon: <Wallet className="h-5 w-5" />, color: 'bg-boisheba-600' }
  ];

  const handleConfirm = async () => {
    if (!startDate || !endDate) {
      toast.error(t('borrow.error.dates'));
      return;
    }

    if (endDate < startDate) {
      toast.error(t('borrow.error.dateOrder'));
      return;
    }

    setIsSubmitting(true);

    try {
      await createBorrowRequest({
        bookId: book.id,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        totalCost,
        deposit,
        paymentMethod,
        status: 'pending'
      });

      toast.success(t('borrow.success.demo'));
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(t('borrow.error.request'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img
                src={book.images?.[0] || "/placeholder.svg"}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <DialogTitle className="text-xl">{t('borrow.title')}</DialogTitle>
              <DialogDescription className="text-base">
                {book.title} {t('borrow.by')} {book.author}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">{t('borrow.selectDates')}</Label>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label>{t('borrow.from')}</Label>
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

              {/* End Date */}
              <div className="space-y-2">
                <Label>{t('borrow.to')}</Label>
                <div className="border rounded-md p-3">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => !startDate || date <= startDate}
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
            <div className="bg-boisheba-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-boisheba-800">{t('borrow.summary')}</h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <span className="font-bold text-boisheba-600">৳{totalCost}</span>
                </div>

                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">{t('borrow.depositRequired')}:</span>
                  <span className="font-bold text-amber-600">৳{deposit}</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">
                <p className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Demo Mode:</strong> {t('borrow.depositNote')}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* ✅ Payment Method Section is now correctly placed */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">{t('borrow.paymentMethod')}</Label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? 'border-boisheba-600 bg-boisheba-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <div className={`flex justify-center mb-2 ${method.color} rounded-lg p-2`}>
                    {method.icon}
                  </div>
                  <p className="text-sm font-medium text-center">{method.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('borrow.cancel')}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={!startDate || !endDate || isSubmitting}
            className="bg-boisheba-600 hover:bg-boisheba-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('borrow.processing')}
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
