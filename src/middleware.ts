import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    // COMPLETELY DISABLE SERVER-SIDE AUTH CHECK FOR NOW
    // to prevent cookie conflicts between client and server.
    // We will rely on AdminLayout.tsx (Client Side) to protect the routes.

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
