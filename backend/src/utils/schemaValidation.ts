import { Request, Response } from "express";
import { sendResponse } from "./sendresponse.util";

export function validateSuggestionReq(data: any) {
  const { prompt } = data;
  if (!prompt) {
    return { error: "Prompt is required", status: 400 };
  }

  if (prompt.length > 180) {
    return { error: "Prompt should not exceed 180 characters" };
  }

  return { valid: true };
}

export function validateDomainsRatingReq(data: any) {
  const { domain: name, rating } = data.domainRating;
  if (!name || name.length > 150) {
    return {
      error: "domain name should not exceed 150 characters",
      status: 400,
    };
  } else if (rating < 1 || rating > 10) {
    return { error: "rating should be between 1 to 10" };
  }
  return { valid: true };
}
