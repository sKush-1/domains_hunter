import { Router } from "express";
import {
  generateSuggestions,
  rateDomains,
} from "../controllers/domains.controller";
import {
  emailVerificationRequest,
  verifyUserEmail,
} from "../controllers/auth.controller";

const router = Router();

router.post("/email-verification", emailVerificationRequest);
router.post("/verify-token", verifyUserEmail);

export default router;
