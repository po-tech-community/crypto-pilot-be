import { Router } from "express";
import { createWithdrawInput, getListWithdraws, getWithdrawById, updateWithDrawInput } from "./withdraw.controller";


export const withdrawRoute = Router();


withdrawRoute.post("/", createWithdrawInput);
withdrawRoute.get("/", getListWithdraws);
withdrawRoute.get("/:id", getWithdrawById);