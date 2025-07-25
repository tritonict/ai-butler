'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'nl', label: 'Nederlands' }
];

export default function LanguageSwitcher() {
  const [selectedLang, setSelectedLang] = useState('en');
  const router = useRouter();

  useEffect(() => {
    const cookieLang = Cookies.get('locale') || 'en';
    setSelectedLang(cookieLang);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    Cookies.set('locale', lang, { expires: 365 });
    setSelectedLang(lang);
    
    // Geef de cookie even tijd om te settelen
  setTimeout(() => {
    router.refresh(); // trigger server-side render met nieuwe cookie
  }, 50);
    
    //router.refresh(); // herlaadt de pagina met nieuwe context
  };

  return (
    <div className="mb-4">
      <label htmlFor="language" className="mr-2">Taal</label>
      <select
        id="language"
        value={selectedLang}
        onChange={handleChange}
        className="border p-1 rounded"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}