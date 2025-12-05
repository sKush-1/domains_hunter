import { json, Request, Response } from "express";
import pool from "../config/database/db.config";
import { sendResponse } from "../utils/sendresponse.util";
import { Client } from "pg";
import { validateEmailVerification } from "../utils/schemaValidation.util";
import { generateTokenCode } from "../utils/generateOtp.util";
import redis from "../config/database/redis";
import { sendVerificationEmail } from "../services/sendEmail.service";

interface TokenData {
  email: string;
  token: string;
}

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

    if (alreadyVerified) {
      return sendResponse(res, 400, true, "Email is already verified.");
    }

    const tokenKey = `verify:${email}`;

    const tokendData = await redis.get(tokenKey);

    if (!tokendData) {
      return sendResponse(
        res,
        401,
        true,
        "Token not found or expired. Please request a new verification email.",
      );
    }

    const parsedData: TokenData = JSON.parse(tokendData);
    const redisToken: string = parsedData.token;

    if (token !== redisToken) {
      return sendResponse(
        res,
        401,
        true,
        "Invalid token , check your token or request a new one.",
      );
    }

    const key = `user:verified:${email}`;

    await redis.set(key, JSON.stringify({ token }), "EX", 300);

    const result = {
      email,
    };

    return sendResponse(
      res,
      200,
      false,
      "we have verified user onboard for registeration now.",
      result,
    );
  } catch (error) {
    console.error("Error in generateSuggestions:", error);
    return sendResponse(res, 500, true, "Failed to generate suggestions");
  }
}
