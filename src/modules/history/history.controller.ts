import { Response } from "express";
import { AuthRequest } from "../authentication/auth.types";
import { ERole } from "../authentication/auth.models";
import {
  createHistoryEntry,
  listHistory,
  getHistoryEntry,
  updateHistoryEntry,
  deleteHistoryEntry,
} from "./history.service";

export async function getHistoryController(req: AuthRequest, res: Response) {
  try {
    const { accountId } = req.query;

    if (!req.user) return res.status(401).json({ message: "Missing auth" });

    
    let targetAccountId: string | undefined = accountId ? String(accountId) : undefined;
    if (req.user.role !== ERole.admin) {
      targetAccountId = req.user.userId;
    }

    const history = await listHistory(targetAccountId);
    res.json(history);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ message: err.message || "Failed to fetch history" });
  }
}

export async function getHistoryByIdController(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const entry = await getHistoryEntry(id);
    if (!entry) return res.status(404).json({ message: "History not found" });
    if (!req.user) return res.status(401).json({ message: "Missing auth" });
    if (req.user.role !== ERole.admin && entry.account.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json(entry);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch history entry" });
  }
}
export async function createHistoryController(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Missing auth" });

    
    const data = { ...req.body, accountId: req.user.userId };
    const entry = await createHistoryEntry(data);
    res.status(201).json(entry);
  } catch (err: any) {
    console.error(err);
    res
      .status(400)
      .json({ message: err.message || "Failed to create history entry" });
  }
}
export async function updateHistoryController(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const existing = await getHistoryEntry(id);
    if (!existing) return res.status(404).json({ message: "History not found" });
    if (!req.user) return res.status(401).json({ message: "Missing auth" });
    if (req.user.role !== ERole.admin && existing.account.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const entry = await updateHistoryEntry(id, req.body);
    if (!entry) return res.status(404).json({ message: "History not found" });
    res.json(entry);
  } catch (err: any) {
    console.error(err);
    res
      .status(400)
      .json({ message: err.message || "Failed to update history entry" });
  }
}
export async function deleteHistoryController(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const existing = await getHistoryEntry(id);
    if (!existing) return res.status(404).json({ message: "History not found" });
    if (!req.user) return res.status(401).json({ message: "Missing auth" });
    if (req.user.role !== ERole.admin && existing.account.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const deleted = await deleteHistoryEntry(id);
    if (!deleted) return res.status(404).json({ message: "History not found" });
    res.status(204).send(); // no content
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete history entry" });
  }
}
