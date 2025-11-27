import { Router } from "express";
import {
  generateSuggestions,
  rateDomains,
} from "../controllers/domains.controller";

const router = Router();

router.post("/suggest/:id", generateSuggestions);
router.post("/rating", rateDomains);

export default router;
