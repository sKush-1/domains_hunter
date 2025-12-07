import { Request, Response } from "express";
import { validateRegisterWithEmail } from "../utils/schemaValidation.util";
import { sendResponse } from "../utils/sendresponse.util";
import { error } from "console";
import redis from "../config/database/redis";
import {
  checkUserExists,
  userEmailRegisterService,
} from "../services/user.service";
import {
  user_access_token_payload,
  user_email_registeration,
} from "../interfaces/users";
import {
  createUserAccessToken,
  createUserRefreshToken,
} from "../utils/jwt.util";

export async function registerWithEmail(req: Request, res: Response) {
  const { email, name, password }: user_email_registeration = req.body;

  const validationResult = validateRegisterWithEmail(req.body);

  if (validationResult.error) {
    return sendResponse(res, 400, true, validationResult.error);
  }

  const userAlreadyExists = await checkUserExists(email);

  if (!userAlreadyExists) {
    return sendResponse(res, 400, false, "user already exists.");
  }

  const isEmailVerified = await redis.get(`user:verified:${email}`);

  if (!isEmailVerified) {
    return sendResponse(res, 401, false, "Email is not verified yet.");
  }

  const registerUserID = await userEmailRegisterService(email, name, password);

  const accessTokenPayload: user_access_token_payload = {
    user_id: registerUserID,
    name: name,
  };
  const accessToken = await createUserAccessToken(accessTokenPayload);
  const refreshToken = await createUserRefreshToken(accessTokenPayload);

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json({
      message: "User registered successfully",
      accessToken,
    });
}
