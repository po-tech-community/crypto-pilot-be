import { Request, Response } from "express";
import {
  createHistoryEntry,
  listHistory,
  getHistoryEntry,
  updateHistoryEntry,
  deleteHistoryEntry,
  seedMockHistory,
} from "./history.service";

export async function getHistoryController(req: Request, res: Response) {
  try {
    const { accountId } = req.query;
    const history = await listHistory(
      accountId ? String(accountId) : undefined
    );
    res.json(history);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ message: err.message || "Failed to fetch history" });
  }
}

export async function getHistoryByIdController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const entry = await getHistoryEntry(id);
    if (!entry) return res.status(404).json({ message: "History not found" });
    res.json(entry);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch history entry" });
  }
}
export async function createHistoryController(req: Request, res: Response) {
  try {
    const entry = await createHistoryEntry(req.body);
    res.status(201).json(entry);
  } catch (err: any) {
    console.error(err);
    res
      .status(400)
      .json({ message: err.message || "Failed to create history entry" });
  }
}
export async function updateHistoryController(req: Request, res: Response) {
  try {
    const { id } = req.params;
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
export async function deleteHistoryController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await deleteHistoryEntry(id);
    if (!deleted) return res.status(404).json({ message: "History not found" });
    res.status(204).send(); // no content
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete history entry" });
  }
}
export async function seedHistoryController(req: Request, res: Response) {
  try {
    const data = await seedMockHistory();
    res.status(201).json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to seed mock history" });
  }
}
