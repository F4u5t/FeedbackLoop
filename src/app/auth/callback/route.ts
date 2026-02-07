import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash') ?? searchParams.get('token');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/feed';

  if (code || (tokenHash && type)) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, _options: CookieOptions) {
            cookieStore.delete(name);
          },
        },
      }
    );

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, request.url));
      }
    }

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'magiclink' | 'signup' | 'recovery' | 'email_change',
      });
      if (!error) {
        return NextResponse.redirect(new URL(next, request.url));
      }
    }
  }

  // Something went wrong, redirect to login with error
  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
}
