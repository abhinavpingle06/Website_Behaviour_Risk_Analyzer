import { NextResponse } from 'next/server';
import { verifyToken } from './lib/verify';

export function middleware(request) {
    const token = request.cookies.get('secure360')?.value;
    const { pathname } = request.nextUrl;

    const publicRoutes = ['/', '/login', '/signup'];

    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    let isValid = verifyToken(token)
    if(!isValid){
        return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};