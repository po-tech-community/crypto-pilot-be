import { Response } from "express";
import { AuthChatRequest, ChatResponse } from "./chat.types";
import { getChatResponse, validateMessage } from "./chat.service";

/**
 * Handle chat message
 * POST /api/chat
 */
export const sendMessage = async (
  req: AuthChatRequest,
  res: Response
): Promise<void> => {
  try {
    const { message } = req.body;
    const userId = req.user?.userId;

    // Check authentication
    if (!userId) {
      res.status(401).json({
        reply: "Please log in to use chat",
        timestamp: new Date(),
      });
      return;
    }

    // Validate message
    if (!validateMessage(message)) {
      res.status(400).json({
        reply: "Message must be between 1-500 characters",
        timestamp: new Date(),
      });
      return;
    }

    console.log(`💬 User ${userId} asked: ${message}`);

    // Get AI response
    const aiReply = await getChatResponse(message, userId);

    console.log(`🤖 AI replied: ${aiReply}`);

    // Send response
    res.status(200).json({
      reply: aiReply,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      reply: "Sorry, I'm having trouble right now. Please try again later.",
      timestamp: new Date(),
    });
  }
};