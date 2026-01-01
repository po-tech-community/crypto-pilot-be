import { Response } from "express";

export class NotFoundError extends Error {
    constructor(message = "Not found") {
      super(message);
      this.name = "NotFoundError";
    }
  }
export class ValidationError extends Error {
constructor(message = "Validation error") {
    super(message);
    this.name = "ValidationError";
}
}
export function handleError(res: Response, err: unknown) {
if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.name, message: err.message });
}
if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.name, message: err.message });
}
return res.status(500).json({ error: "InternalServerError" });
}
