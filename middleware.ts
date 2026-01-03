import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    const { pathname } = request.nextUrl;

    // Protected routes that require authentication
    const isProtectedRoute = pathname.startsWith('/dashboard');

    // Auth routes (signin/signup) - redirect to dashboard if already logged in
    const isAuthRoute = pathname.startsWith('/signin') || pathname.startsWith('/signup');

    // If trying to access protected route without session, redirect to signin
    if (isProtectedRoute && !session) {
        const response = NextResponse.redirect(new URL('/signin', request.url));
        // Add headers to prevent caching
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    }

    // If logged in and trying to access auth routes, redirect to dashboard
    if (isAuthRoute && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // For protected routes, add cache-control headers to prevent browser caching
    if (isProtectedRoute && session) {
        const response = NextResponse.next();
        // Prevent browser from caching authenticated pages
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/signin',
        '/signup',
    ],
};
