import jwt from "jsonwebtoken";
import { user_access_token_payload } from "../interfaces/users";

export async function createUserAccessToken(
  userAccessTokenPayload: user_access_token_payload,
) {
  const { user_id, name } = userAccessTokenPayload;
  const accessToken = jwt.sign(
    { user_id, name },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" },
  );
  return accessToken;
}

export async function createUserRefreshToken(
  userAccessTokenPayload: user_access_token_payload,
) {
  const { user_id, name } = userAccessTokenPayload;
  const refreshToken = jwt.sign(
    { user_id, name },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" },
  );
  return refreshToken;
}
