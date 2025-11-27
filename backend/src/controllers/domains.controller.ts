import { Request, Response } from "express";
import pool from "../config/database/db.config";
import {
  generateDomains,
  extractDomains,
  checkDomainAvailability,
} from "../services/domainSuggestionService";
import { sendResponse } from "../utils/sendresponse.util";
import { Client } from "pg";

export async function generateSuggestions(req: Request, res: Response) {
  const ip = req.userIp;
  const deviceId = req.deviceId;
  const promptId = req.params.id;
  const userPrompt = (req.body.prompt as string) || "";

  console.log(
    "Request from IP:",
    ip,
    "Device ID:",
    deviceId,
    "Prompt ID:",
    promptId,
  );

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
        [
          promptId,
          userPrompt,
          ip,
          deviceId,
          aiResponse,
          JSON.stringify(domainsWithFlags),
        ],
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

      sendResponse(res, 200, "Fetched domains result", result);
    } catch (dbError) {
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error("Error in generateSuggestions:", error);
    res.status(500).json({
      error: "Failed to generate domain suggestions",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function rateDomains(req: Request, res: Response) {
  try {
    const domainsRatings = req.body.domainsRatings;

    const rows = Object.entries(domainsRatings)
      .map(([domain, rating]) => `('${domain}', ${rating})`)
      .join(", ");

    const client = await pool.connect();

    const query = `INSERT INTO domains_ratings(domain, rating) VALUES ${rows}`;

    const insertResult = await client.query(query);

    const result = {
      result: insertResult.rows[0].id,
    };
    sendResponse(res, 200, "OK", result);
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Internal server error");
  }
}
