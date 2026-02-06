import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = 'admin@feedbackloop.dev';
const ADMIN_PASSWORD = 'admin123';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    console.log('[Admin Login] Starting admin login flow');

    // Verify hardcoded credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Use raw supabase-js client with service role for admin operations
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Cookie-aware client for sign-in
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
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Step 1: Try to sign in first (user may already exist)
    console.log('[Admin Login] Trying sign in first...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (signInData?.session) {
      console.log('[Admin Login] Sign in successful (existing user)');
      // Make sure profile has admin role
      await adminClient
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', signInData.user.id);
      return NextResponse.json({ success: true, redirect: '/feed' });
    }

    console.log('[Admin Login] Sign in failed:', signInError?.message);

    // Step 2: User doesn't exist. Create via admin API.
    // First, clean up any orphaned profiles with username 'admin'
    console.log('[Admin Login] Cleaning up orphaned profiles...');
    await adminClient.from('profiles').delete().eq('username', 'admin');

    console.log('[Admin Login] Creating new user...');
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { is_admin: true },
    });

    if (createError) {
      console.error('[Admin Login] Create user error:', createError.message);

      // If creation still fails, the trigger is probably the problem.
      // Try to delete any partial data and retry
      console.log('[Admin Login] Attempting cleanup and retry...');
      
      // Delete any auth user that might exist
      const { data: users } = await adminClient.auth.admin.listUsers();
      if (users?.users) {
        const existing = users.users.find((u: any) => u.email === ADMIN_EMAIL);
        if (existing) {
          console.log('[Admin Login] Found existing auth user, deleting...');
          await adminClient.auth.admin.deleteUser(existing.id);
          await adminClient.from('profiles').delete().eq('id', existing.id);
        }
      }

      // Delete orphaned profiles again
      await adminClient.from('profiles').delete().eq('username', 'admin');

      // Retry create
      console.log('[Admin Login] Retrying user creation...');
      const { data: retryUser, error: retryError } = await adminClient.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { is_admin: true },
      });

      if (retryError) {
        console.error('[Admin Login] Retry also failed:', retryError.message);
        return NextResponse.json(
          { error: 'User creation failed. Please run the trigger fix SQL in Supabase. Error: ' + retryError.message },
          { status: 500 }
        );
      }

      // Retry create succeeded - ensure profile exists
      if (retryUser?.user) {
        console.log('[Admin Login] Retry succeeded, ensuring profile...');
        await adminClient.from('profiles').upsert({
          id: retryUser.user.id,
          username: 'admin',
          display_name: 'Admin',
          role: 'admin',
        }, { onConflict: 'id' });
      }

      // Now sign in
      const { error: retrySignInErr } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      if (retrySignInErr) {
        return NextResponse.json({ error: 'Sign in failed after user creation: ' + retrySignInErr.message }, { status: 500 });
      }

      console.log('[Admin Login] Sign in successful after retry!');
      return NextResponse.json({ success: true, redirect: '/feed' });
    }

    // Step 3: User created successfully. Ensure profile has admin role.
    if (newUser?.user) {
      console.log('[Admin Login] User created:', newUser.user.id);
      await adminClient.from('profiles').upsert({
        id: newUser.user.id,
        username: 'admin',
        display_name: 'Admin',
        role: 'admin',
      }, { onConflict: 'id' });
    }

    // Step 4: Sign in with the new user
    console.log('[Admin Login] Signing in...');
    const { data: finalSignIn, error: finalSignInErr } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (finalSignInErr) {
      return NextResponse.json({ error: 'Sign in failed: ' + finalSignInErr.message }, { status: 500 });
    }

    console.log('[Admin Login] Complete! Session:', !!finalSignIn.session);
    return NextResponse.json({ success: true, redirect: '/feed' });
  } catch (error: any) {
    console.error('[Admin Login] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Login failed: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
