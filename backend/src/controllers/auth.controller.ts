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
      return sendResponse(res, 400, true, "email validation failed");

    const alreadyVerified = await redis.get(`user:verified:${email}`);
    if (alreadyVerified === "true") {
      return sendResponse(res, 200, true, "Email is already verified.");
    }

    const requests = await redis.incr(`verify:${email}:count`);
    if (requests === 1) await redis.expire(`verify:${email}:count`, 120);

    if (requests > 5) {
      return res
        .status(429)
        .json({ message: "Too many requests for this email. Try later." });
    }

    const token = generateTokenCode();

    const key = `verify:${email}`;

    // set OTP (5 min expiry)
    await redis.set(key, JSON.stringify({ email, token }), "EX", 300);

    try {
      await sendVerificationEmail(email, token);
    } catch (err) {
      await redis.del(key); // cleanup OTP if email sending fails
      throw err;
    }

    const result = {
      message: "we have sent token to users email inbox/spam check it",
      email,
    };

    return sendResponse(
      res,
      200,
      false,
      "Sent email verification request.",
      result,
    );
  } catch (error) {
    console.error("Error in email verification:", error);
    return sendResponse(res, 500, false, "Failed to send email verification");
  }
}

export async function verifyUserEmail(req: Request, res: Response) {
  const { email, token } = req.body;

  try {
    const validationResult = validateEmailVerification(req.body);
    if (validationResult.error)
      return sendResponse(res, 400, true, validationResult.error);

    const alreadyVerified = await redis.get(`user:verified:${email}`);
    if (alreadyVerified === "true") {
      return sendResponse(res, 200, true, "Email is already verified.");
    }

    const requests = await redis.incr(`user:verified:${email}:count`);
    if (requests === 1) await redis.expire(`user:verified:${email}:count`, 120);

    if (requests > 5) {
      return res
        .status(429)
        .json({ message: "Too many requests for this email. Try later." });
    }

    const key = `user:verified:${email}`;

    await redis.set(key, JSON.stringify({ token }), "EX", 300);

    const result = {
      message: "we have verified user onboard for registeration now.",
      email,
    };

    return sendResponse(
      res,
      200,
      false,
      "Sent email verification request.",
      result,
    );
  } catch (error) {
    console.error("Error in generateSuggestions:", error);
    return sendResponse(res, 500, true, "Failed to generate suggestions");
  }
}
