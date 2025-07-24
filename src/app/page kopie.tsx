import {getTranslations} from 'next-intl/server';
 
export default async function HomePage() {
  const t = await getTranslations('homepage');
  return <h1>{t('welcome')}</h1>;
}