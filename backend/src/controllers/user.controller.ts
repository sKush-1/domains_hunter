import { Request, Response } from "express";
import { validateRegisterWithEmail } from "../utils/schemaValidation";
import { sendResponse } from "../utils/sendresponse.util";
import { error } from "console";

export function registerWithEmail(req: Request, res: Response) {
  const { email, password } = req.body;

  const validationResult = validateRegisterWithEmail(req.body);

  if (validationResult.error) {
    return sendResponse(res, 400, validationResult.error);
  }

  

  return sendResponse(res, 200, "success", validationResult);
}
