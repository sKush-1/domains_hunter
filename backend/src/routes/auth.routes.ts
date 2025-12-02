import { Router } from "express";
import {
  generateSuggestions,
  rateDomains,
} from "../controllers/domains.controller";
import { emailVerificationRequest } from "../controllers/auth.controller";

const router = Router();

router.post("/email-verification", emailVerificationRequest);

export default router;
