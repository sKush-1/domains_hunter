import { Router } from "express";
import { generateSuggestions } from "../controllers/domains.controller";

const router = Router();

router.post("/suggest/:id", generateSuggestions);

export default router;