import { Request, Response } from "express";
import { validateRegisterWithEmail } from "../utils/schemaValidation.util";
import { sendResponse } from "../utils/sendresponse.util";
import { error } from "console";
import redis from "../config/database/redis";

export async function registerWithEmail(req: Request, res: Response) {
  const { email, password } = req.body;

  const validationResult = validateRegisterWithEmail(req.body);

  if (validationResult.error) {
    return sendResponse(res, 400, true, validationResult.error);
  }

  const isEmailVerified = await redis.get(`user:verified:${email}`);
  console.log(isEmailVerified);

  if (!isEmailVerified) {
    return sendResponse(res, 401, false, "Email is not verified yet.");
  }

  return sendResponse(res, 200, false, "success", validationResult);
}
