import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const response = NextResponse.json({ success: true });

    // Determine cookie domain
    let rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
    if (!rootDomain) {
        const host = request.headers.get('host');
        if (host) {
            rootDomain = host.replace('www.', '').split(':')[0];
        }
    }
    if (rootDomain) {
        rootDomain = rootDomain.replace('https://', '').replace('http://', '');
    }

    const cookieOptions: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0 // Expire immediately
    };

    if (rootDomain && !rootDomain.includes('localhost') && !rootDomain.includes('vercel.app')) {
        cookieOptions.domain = `.${rootDomain}`;
    }

    response.cookies.set('user_session', '', cookieOptions);

    return response;
}
