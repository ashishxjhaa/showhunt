import * as jose from "jose";
import { z } from "zod";

export const signupSchema = z.object({
    fullName: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
});

export const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return new TextEncoder().encode(secret);
}

export async function createAuthToken(userId: string) {
    return new jose.SignJWT({ userId })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(`${TOKEN_MAX_AGE_SECONDS}s`)
        .sign(getJwtSecret());
}

export const AUTH_COOKIE_NAME = "token";
export const AUTH_COOKIE_MAX_AGE = TOKEN_MAX_AGE_SECONDS;
