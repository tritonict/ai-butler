import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSSRServerClient() {
  const cookieStore = await cookies(); // dit is nu correct awaitable in gebruik
  

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {
          // Niet nodig voor alleen lezen (GET) verzoeken
        },
        remove() {
          // Niet nodig voor alleen lezen (GET) verzoeken
        },
      },
    }
  );

  return supabase;
}
