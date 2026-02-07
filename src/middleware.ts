import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROLE_COOKIE_NAME = 'user_role';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        req.cookies.set(name, value);
                        res.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const url = req.nextUrl.clone();

    // 1. If user is NOT logged in and trying to access dashboard
    if (!session && url.pathname.startsWith('/dashboard')) {
        // Clear role cookie on logout
        res.cookies.set(ROLE_COOKIE_NAME, '', { maxAge: 0 });
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // 2. If user IS logged in
    if (session) {
        // Try to get role from cookie first (fast path)
        let userRole = req.cookies.get(ROLE_COOKIE_NAME)?.value;

        // Only fetch from DB if no cached role
        if (!userRole) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            userRole = profile?.role ?? 'worker';

            // Cache the role in a cookie for 1 hour
            res.cookies.set(ROLE_COOKIE_NAME, userRole, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60, // 1 hour
            });
        }

        // Prevent cross-dashboard access
        if (url.pathname.startsWith('/dashboard/admin') && userRole !== 'admin' && userRole !== 'super_admin') {
            url.pathname = '/dashboard/worker';
            return NextResponse.redirect(url);
        }

        if (url.pathname.startsWith('/dashboard/worker') && !['admin', 'super_admin', 'worker'].includes(userRole || '')) {
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        // Redirect logged in users away from auth pages
        if (url.pathname === '/login' || url.pathname === '/signup') {
            url.pathname = (userRole === 'admin' || userRole === 'super_admin') ? '/dashboard/admin' : '/dashboard/worker';
            return NextResponse.redirect(url);
        }
    }

    return res;
}

export const config = {
    // Note: /sign/:path* is NOT included here - it's a public route for email link signing
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};
