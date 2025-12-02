import { Request, Response } from "express";
import pool from "../config/database/db.config";
import { sendResponse } from "../utils/sendresponse.util";
import { Client } from "pg";
import { validateEmailVerification } from "../utils/schemaValidation.util";
import { generateTokenCode } from "../utils/generateOtp.util";
import redis from "../config/database/redis";
import { sendVerificationEmail } from "../services/sendEmail.service";

export async function emailVerificationRequest(req: Request, res: Response) {
  const { email } = req.body;

  try {
    const validationResult = validateEmailVerification(req.body);
    if (validationResult.error)
      return sendResponse(res, 400, "email validation failed");

    const requests = await redis.incr(`verify:${email}:count`);
    if (requests === 1) await redis.expire(`verify:${email}:count`, 120);

    if (requests > 5) {
      return res
        .status(429)
        .json({ message: "Too many requests for this email. Try later." });
    }

    const token = generateTokenCode();

    const key = `verify:${email}`;
    await Promise.all([
      redis.set(key, JSON.stringify({ email, token }), "EX", 86400),
      sendVerificationEmail(email, token),
    ]);

    const result = {
      message: "we have sent token to users email inbox/spam check it",
      email,
    };

    return sendResponse(res, 200, "Sent email verification request.", result);
  } catch (error) {
    console.error("Error in generateSuggestions:", error);
    return sendResponse(res, 500, "Failed to generate suggestions");
  }
}
