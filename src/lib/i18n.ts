import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'bn';

interface I18nStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'boisheba-language',
    }
  )
);

// Translation keys
export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.books': 'Browse Books',
    'nav.dashboard': 'Dashboard',
    'nav.addBook': 'Add Book',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',

    // Landing
    'landing.hero.title': 'Share Books, Build Community',
    'landing.hero.subtitle': 'AI-powered book lending with secure deposits',
    'landing.cta.getStarted': 'Get Started',
    'landing.feature.ocr': 'AI-Powered OCR',
    'landing.feature.ocrDesc': 'Upload a photo and we extract book details automatically',
    'landing.feature.recs': 'Smart Recommendations',
    'landing.feature.recsDesc': 'Find books you\'ll love based on your reading history',
    'landing.feature.secure': 'Secure Lending',
    'landing.feature.secureDesc': 'Blockchain-backed deposits protect both lenders and borrowers',

    // Add Book
    'addBook.title': 'Add a New Book',
    'addBook.subtitle': 'Upload a photo and we\'ll extract the details automatically',
    'addBook.upload': 'Upload Image',
    'addBook.processing': 'Processing with OCR...',
    'addBook.processed': 'Book details extracted! Please review and edit.',
    'addBook.form.title': 'Title',
    'addBook.form.author': 'Author',
    'addBook.form.isbn': 'ISBN',
    'addBook.form.publisher': 'Publisher',
    'addBook.form.edition': 'Edition',
    'addBook.form.description': 'Description',
    'addBook.form.condition': 'Condition (AI-detected)',
    'addBook.form.dailyRate': 'Daily Rate (৳)',
    'addBook.submit': 'Add Book',
    'addBook.cancel': 'Cancel',

    // Book Detail
    'bookDetail.condition': 'Condition Score',
    'bookDetail.owner': 'Owner',
    'bookDetail.dailyRate': 'Daily Rate',
    'bookDetail.deposit': 'Deposit',
    'bookDetail.borrow': 'Borrow This Book',
    'bookDetail.compare': 'Compare Condition',

    // Borrow Modal
    'borrow.title': 'Borrow Book',
    'borrow.selectDates': 'Select Dates',
    'borrow.from': 'From',
    'borrow.to': 'To',
    'borrow.summary': 'Summary',
    'borrow.days': 'Days',
    'borrow.totalCost': 'Total Cost',
    'borrow.depositRequired': 'Deposit Required',
    'borrow.confirm': 'Confirm Borrow',
    'borrow.cancel': 'Cancel',

    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.stats.shared': 'Books Shared',
    'dashboard.stats.lent': 'Currently Lent',
    'dashboard.stats.borrowed': 'Borrowed',
    'dashboard.stats.reputation': 'Reputation',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.myBooks': 'My Books',

    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Full Name',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.hasAccount': 'Already have an account?',
  },
  bn: {
    // Navigation (Bengali)
    'nav.home': 'হোম',
    'nav.books': 'বই ব্রাউজ করুন',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.addBook': 'বই যোগ করুন',
    'nav.login': 'লগইন',
    'nav.signup': 'সাইন আপ',

    // Landing
    'landing.hero.title': 'বই শেয়ার করুন, সম্প্রদায় গড়ুন',
    'landing.hero.subtitle': 'নিরাপদ ডিপোজিট সহ এআই-চালিত বই ধার',
    'landing.cta.getStarted': 'শুরু করুন',
    'landing.feature.ocr': 'এআই-চালিত ওসিআর',
    'landing.feature.ocrDesc': 'একটি ফটো আপলোড করুন এবং আমরা স্বয়ংক্রিয়ভাবে বইর বিবরণ বের করব',
    'landing.feature.recs': 'স্মার্ট সুপারিশ',
    'landing.feature.recsDesc': 'আপনার পড়ার ইতিহাসের উপর ভিত্তি করে আপনার পছন্দের বই খুঁজুন',
    'landing.feature.secure': 'নিরাপদ ধার',
    'landing.feature.secureDesc': 'ব্লকচেইন-সমর্থিত ডিপোজিট ঋণদাতা এবং ঋণগ্রহীতা উভয়কে রক্ষা করে',

    // Add Book
    'addBook.title': 'নতুন বই যোগ করুন',
    'addBook.subtitle': 'একটি ফটো আপলোড করুন এবং আমরা স্বয়ংক্রিয়ভাবে বিবরণ বের করব',
    'addBook.upload': 'ছবি আপলোড করুন',
    'addBook.processing': 'ওসিআর দিয়ে প্রসেস করা হচ্ছে...',
    'addBook.processed': 'বইয়ের বিবরণ বের করা হয়েছে! অনুগ্রহ করে পর্যালোচনা করুন এবং সম্পাদনা করুন।',
    'addBook.form.title': 'শিরোনাম',
    'addBook.form.author': 'লেখক',
    'addBook.form.isbn': 'আইএসবিএন',
    'addBook.form.publisher': 'প্রকাশক',
    'addBook.form.edition': 'সংস্করণ',
    'addBook.form.description': 'বর্ণনা',
    'addBook.form.condition': 'অবস্থা (এআই-সনাক্ত)',
    'addBook.form.dailyRate': 'দৈনিক হার (৳)',
    'addBook.submit': 'বই যোগ করুন',
    'addBook.cancel': 'বাতিল',

    // Book Detail
    'bookDetail.condition': 'অবস্থা স্কোর',
    'bookDetail.owner': 'মালিক',
    'bookDetail.dailyRate': 'দৈনিক হার',
    'bookDetail.deposit': 'জামানত',
    'bookDetail.borrow': 'এই বই ধার নিন',
    'bookDetail.compare': 'অবস্থা তুলনা করুন',

    // Borrow Modal
    'borrow.title': 'বই ধার নিন',
    'borrow.selectDates': 'তারিখ নির্বাচন করুন',
    'borrow.from': 'থেকে',
    'borrow.to': 'পর্যন্ত',
    'borrow.summary': 'সারাংশ',
    'borrow.days': 'দিন',
    'borrow.totalCost': 'মোট খরচ',
    'borrow.depositRequired': 'জামানত প্রয়োজন',
    'borrow.confirm': 'ধার নিশ্চিত করুন',
    'borrow.cancel': 'বাতিল',

    // Dashboard
    'dashboard.welcome': 'স্বাগতম',
    'dashboard.stats.shared': 'শেয়ার করা বই',
    'dashboard.stats.lent': 'বর্তমানে ধার দেওয়া',
    'dashboard.stats.borrowed': 'ধার নেওয়া',
    'dashboard.stats.reputation': 'খ্যাতি',
    'dashboard.quickActions': 'দ্রুত ক্রিয়া',
    'dashboard.myBooks': 'আমার বই',

    // Auth
    'auth.login': 'লগইন',
    'auth.signup': 'সাইন আপ',
    'auth.email': 'ইমেইল',
    'auth.password': 'পাসওয়ার্ড',
    'auth.name': 'পুরো নাম',
    'auth.noAccount': 'অ্যাকাউন্ট নেই?',
    'auth.hasAccount': 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?',
  },
};

export function useTranslation() {
  const { language } = useI18n();

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return { t, language };
}
