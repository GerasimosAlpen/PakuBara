import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.ALERT_LINK_SECRET || "pakubara-jwt-secret-token-key-2026-safe"
);

export interface AlertTokenPayload {
  alert_id: string;
  node_id: string;
  org_id: string;
  [key: string]: unknown;
}

/**
 * Generates a signed JWT token valid for 24 hours for field responders.
 */
export async function generateAlertToken(payload: AlertTokenPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET_KEY);
}

/**
 * Verifies a 24-hour alert token from WhatsApp URL parameter.
 */
export async function verifyAlertToken(token: string): Promise<AlertTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as AlertTokenPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

