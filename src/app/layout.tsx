import {NextIntlClientProvider} from 'next-intl';
import {getLocale} from 'next-intl/server';
import '@/styles/globals.css'
import { AuthProvider } from '@/components/AuthProvider'
 
export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
 
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
        	<AuthProvider>
        		{children}
        	</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}