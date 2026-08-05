import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jose from "jose"

function unauthorizedResponse(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.redirect(new URL("/signin", req.url))
}

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value
    if (!token) return unauthorizedResponse(req)

    const secretEnv = process.env.JWT_SECRET
    if (!secretEnv) return unauthorizedResponse(req)

    try {
        const secret = new TextEncoder().encode(secretEnv)
        const { payload } = await jose.jwtVerify(token, secret)

        const requestHeaders = new Headers(req.headers)
        requestHeaders.set("x-user-id", payload.userId as string)

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    } catch {
        return unauthorizedResponse(req)
    }
}


export const config = {
    matcher: [
        '/listings/:path*',
        '/profile/:path*',
        '/saved/:path*',
        '/api/me/:path*',
        '/api/uploadproject/:path*',
        '/api/projects/:path*',
        '/api/saved/:path*',
        '/api/listings/:path*',
    ],
};
