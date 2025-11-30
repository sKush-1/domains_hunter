import { Request, Response } from "express";
import { sendResponse } from "./sendresponse.util";

export function validateSuggestionReq(req: Request, res: Response) {
  const { prompt } = req.body;
  if (prompt.length > 180) {
    return sendResponse(res, 400, "userprompt shouldn't exceed 180 characters");
  } else if (req.params.id) {
    return sendResponse(res, 400, "prompt id not provided in params");
  }
}
