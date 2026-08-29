import { createRemoteJWKSet, jwtVerify } from "jose"
import { AppError } from "./errors"

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"))

export interface GoogleProfile {
  googleId: string
  email: string
  name: string
  picture?: string
}

export async function verifyGoogleIdToken(credential: string): Promise<GoogleProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new AppError("Google login is not configured", 500)
  }

  let payload
  try {
    ;({ payload } = await jwtVerify(credential, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId,
    }))
  } catch {
    throw new AppError("Invalid Google credential", 401)
  }

  if (
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.name !== "string" ||
    payload.email_verified !== true
  ) {
    throw new AppError("Invalid Google credential", 401)
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: typeof payload.picture === "string" ? payload.picture : undefined,
  }
}
