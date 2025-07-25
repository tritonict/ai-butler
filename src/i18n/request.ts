import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies(); // ← let op: await!
  const locale = cookieStore.get('locale')?.value ?? 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});