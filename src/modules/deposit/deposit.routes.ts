import { Router } from "express";
import { depositController } from "./deposit.controller";

export const depositRouter = Router();


depositRouter.post("/", depositController.create);
depositRouter.get("/", depositController.list);
depositRouter.get("/:id", depositController.getById);
depositRouter.patch("/:id", depositController.update);
depositRouter.delete("/:id", depositController.remove);
