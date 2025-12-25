import { Request, Response } from "express";
import { depositService, NotFoundError, ValidationError } from "./deposit.service";

function parsePagination(req: Request) {
  const limitRaw = req.query.limit;
  const offsetRaw = req.query.offset;

  const limit = typeof limitRaw === "string" ? Number(limitRaw) : 50;
  const offset = typeof offsetRaw === "string" ? Number(offsetRaw) : 0;

  return {
    limit: Number.isFinite(limit) ? Math.max(1, Math.min(200, limit)) : 50,
    offset: Number.isFinite(offset) ? Math.max(0, offset) : 0,
  };
}

function handleError(res: Response, err: unknown) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.name, message: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.name, message: err.message });
  }
  return res.status(500).json({ error: "InternalServerError" });
}


export const depositController = {
  async create(req: Request, res: Response) {
    try {
      const created = await depositService.createDeposit(req.body);
      return res.status(201).json(created);
    } catch (err) {
      return handleError(res, err);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const dep = await depositService.getDeposit(req.params.id);
      return res.status(200).json(dep);
    } catch (err) {
      return handleError(res, err);
    }
  },

  async list(req: Request, res: Response) {
    try {
      const { limit, offset } = parsePagination(req);

      const query = {
        userId: typeof req.query.userId === "string" ? req.query.userId : undefined,
        asset: typeof req.query.asset === "string" ? req.query.asset : undefined,
        network: typeof req.query.network === "string" ? req.query.network : undefined,
        status: typeof req.query.status === "string" ? (req.query.status as any) : undefined,
      };

      const data = await depositService.listDeposits(query, { limit, offset });
      return res.status(200).json({ data, limit, offset });
    } catch (err) {
      return handleError(res, err);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const updated = await depositService.updateDeposit(req.params.id, req.body);
      return res.status(200).json(updated);
    } catch (err) {
      return handleError(res, err);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      await depositService.deleteDeposit(req.params.id);
      return res.status(204).send();
    } catch (err) {
      return handleError(res, err);
    }
  },
};
