import jwt from "jsonwebtoken";
import { user_access_token_payload } from "../interfaces/users";

export function createUserAccessToken(
  userAccessTokenPayload: user_access_token_payload,
): string {
  const { user_id, name } = userAccessTokenPayload;
  
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiry = process.env.JWT_ACCESSTOKEN_EXPIRY;
  
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  
  if (!jwtExpiry) {
    throw new Error("JWT_ACCESSTOKEN_EXPIRY environment variable is not defined");
  }
  
  const accessToken = jwt.sign(
    { user_id, name },
    jwtSecret,
    { expiresIn: jwtExpiry } as jwt.SignOptions
  );
  return accessToken as string;
}

export function createUserRefreshToken(
  userAccessTokenPayload: user_access_token_payload,
): string {
  const { user_id, name } = userAccessTokenPayload;
  
  const jwtSecretKey = process.env.JWT_SECRET_KEY;
  const jwtRefreshExpiry = process.env.JWT_REFRESHTOKEN_EXPIRY;
  
  if (!jwtSecretKey) {
    throw new Error("JWT_SECRET_KEY environment variable is not defined");
  }
  
  if (!jwtRefreshExpiry) {
    throw new Error("JWT_REFRESHTOKEN_EXPIRY environment variable is not defined");
  }
  
  const refreshToken = jwt.sign(
    { user_id, name },
    jwtSecretKey,
    { expiresIn: jwtRefreshExpiry } as jwt.SignOptions
  );
  return refreshToken as string;
}
