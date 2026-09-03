import { createRemoteJWKSet, jwtVerify } from "jose"
import { AppError } from "./errors"

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"))
const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v3/userinfo"

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

/** Verify a GIS OAuth access token via Google's userinfo endpoint. */
export async function verifyGoogleAccessToken(accessToken: string): Promise<GoogleProfile> {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new AppError("Google login is not configured", 500)
  }

  let res: Response
  try {
    res = await fetch(GOOGLE_USERINFO, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  } catch {
    throw new AppError("Could not reach Google", 502)
  }

  if (!res.ok) {
    throw new AppError("Invalid Google credential", 401)
  }

  const data = (await res.json()) as {
    sub?: unknown
    email?: unknown
    name?: unknown
    picture?: unknown
    email_verified?: unknown
  }

  if (
    typeof data.sub !== "string" ||
    typeof data.email !== "string" ||
    typeof data.name !== "string" ||
    data.email_verified !== true
  ) {
    throw new AppError("Invalid Google credential", 401)
  }

  return {
    googleId: data.sub,
    email: data.email,
    name: data.name,
    picture: typeof data.picture === "string" ? data.picture : undefined,
  }
}

export async function verifyGoogleAuth(input: {
  accessToken?: string
  credential?: string
}): Promise<GoogleProfile> {
  if (input.accessToken) {
    return verifyGoogleAccessToken(input.accessToken)
  }
  if (input.credential) {
    return verifyGoogleIdToken(input.credential)
  }
  throw new AppError("Missing Google credential", 400)
}
