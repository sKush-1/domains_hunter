import { Request, Response } from "express";
import pool from "../config/database/db.config";
import {
  generateDomains,
  extractDomains,
  checkDomainAvailability,
} from "../services/domainSuggestion.service";
import { sendResponse } from "../utils/sendresponse.util";
import { Client } from "pg";
import {
  validateDomainsRatingReq,
  validateSuggestionReq,
} from "../utils/schemaValidation";

export async function generateSuggestions(req: Request, res: Response) {
  const ip = req.userIp;
  const deviceId = req.deviceId;
  const promptId = req.params.id;
  const userPrompt = (req.body.prompt as string) || "";


  // console.log("Request from IP:", "Device ID:", "Prompt ID:", promptId);

  // schema validation
  const validationResult = validateSuggestionReq(req.body);
  if (validationResult.error) {
    return sendResponse(res, 400, validationResult.error);
  }

  try {
    // Generate domain suggestions using DeepSeek API
    const aiResponse = await generateDomains(userPrompt);
    // console.log("AI Response:", aiResponse);

    // Extract domains from the response
    const suggestedDomains = extractDomains(aiResponse);
    // console.log("Extracted Domains:", suggestedDomains);

    // Check domain availability using GoDaddy API
    const availableDomains = await checkDomainAvailability(suggestedDomains);
    // console.log("Available Domains:", availableDomains);

    // Create response with availability flags
    const domainsWithFlags = suggestedDomains.map((domain) => ({
      domain: domain,
      flag: availableDomains.includes(domain) ? 1 : 0,
    }));

    // Save to database
    const client = await pool.connect();
    try {
      // Insert the prompt and results into the database
      const insertResult = await client.query(
        `INSERT INTO suggested_domains
                (prompt_id, content, ip_address, device_id, prompt_result, domains_result)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id`,
        [promptId, userPrompt,ip,deviceId,aiResponse, JSON.stringify(domainsWithFlags)],
      );

      const recordId = insertResult.rows[0].id;
      console.log("Saved to database with ID:", recordId);

      client.release();

      // Return the results
      const result = {
        id: recordId,
        promptId: promptId,
        userPrompt: userPrompt,
        suggestedDomains: domainsWithFlags,
      };

      return sendResponse(res, 200, "Fetched domains result", result);
    } catch (dbError) {
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error("Error in generateSuggestions:", error);
    return sendResponse(res, 500, "Failed to generate suggestions");
  }
}

export async function rateDomains(req: Request, res: Response) {
  try {
    const { domain, rating } = req.body.domainRating;

    // schemaValidation
    const valdiationResult = validateDomainsRatingReq(req.body);

    if (valdiationResult.error) {
      return sendResponse(res, 400, valdiationResult.error);
    }

    const client = await pool.connect();

    const insertResult = await client.query(
      `INSERT INTO domains
              (name,rating)
              VALUES ($1, $2)
              RETURNING id`,
      [name, rating],
    );

    const result = {
      result: { insertID: insertResult.rows[0].id },
    };
    sendResponse(res, 200, "OK", result);
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Internal server error");
  }
}
