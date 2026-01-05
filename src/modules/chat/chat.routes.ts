import { Router } from "express";
import { sendMessage } from "./chat.controller";

const router = Router();

// POST /api/chat - Send message to AI
router.post("/", sendMessage);

export default router;