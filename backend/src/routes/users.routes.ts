import { Router } from "express";
import { registerWithEmail } from "../controllers/user.controller";

const router = Router();

router.post("/email-registration", registerWithEmail);

export default router;
