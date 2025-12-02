import { Request, Response } from "express";
import pool from "../config/database/db.config";
import { sendResponse } from "../utils/sendresponse.util";
import { Client } from "pg";
import { validateEmailVerification } from "../utils/schemaValidation.util";
import { generateTokenCode } from "../utils/generateOtp.util";
import redis from "../config/database/redis";

export async function emailVerificationRequest(req: Request, res: Response) {
  const { email } = req.body;

  try {
    const validationResult = validateEmailVerification(req.body);
    if (validationResult.error)
      return sendResponse(res, 400, "email validation failed");

    const token = generateTokenCode();

    const key = `verify:${email}`;
    await redis.set(key, JSON.stringify({ email, token }), "EX", 86400); // 24 hrs

    const result = {
      email,
      token,
    };
    return sendResponse(res, 200, "Sent email verification request.", result);
  } catch (error) {
    console.error("Error in generateSuggestions:", error);
    return sendResponse(res, 500, "Failed to generate suggestions");
  }
}
