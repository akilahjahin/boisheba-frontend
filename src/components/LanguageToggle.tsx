import { Button } from '@/components/ui/button';
import { useI18n, Language } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleLanguage}
      title={`Switch to ${language === 'en' ? 'বাংলা' : 'English'}`}
    >
      <Globe className="h-4 w-4" />
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}
