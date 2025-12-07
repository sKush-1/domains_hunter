import { Request, Response } from "express";
import { validateRegisterWithEmail } from "../utils/schemaValidation.util";
import { sendResponse } from "../utils/sendresponse.util";
import { error } from "console";
import redis from "../config/database/redis";
import { userEmailRegisterService } from "../services/user.service";
import { user_email_registeration } from "../interfaces/users";

export async function registerWithEmail(req: Request, res: Response) {
  const { email, name, password }: user_email_registeration = req.body;

  const validationResult = validateRegisterWithEmail(req.body);

  if (validationResult.error) {
    return sendResponse(res, 400, true, validationResult.error);
  }

  const isEmailVerified = await redis.get(`user:verified:${email}`);

  if (!isEmailVerified) {
    return sendResponse(res, 401, false, "Email is not verified yet.");
  }

  const registerUserID = await userEmailRegisterService(email, name, password);

  return sendResponse(res, 200, false, "success", registerUserID);
}
