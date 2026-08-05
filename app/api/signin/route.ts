import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import {
    AUTH_COOKIE_MAX_AGE,
    AUTH_COOKIE_NAME,
    createAuthToken,
    signinSchema,
} from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = signinSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input" },
                { status: 400 }
            );
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 400 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid password" }, { status: 400 });
        }

        const token = await createAuthToken(user.id);

        const res = NextResponse.json(
            { message: "Signin successful" },
            { status: 200 }
        );

        res.cookies.set(AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: AUTH_COOKIE_MAX_AGE,
        });

        return res;
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
