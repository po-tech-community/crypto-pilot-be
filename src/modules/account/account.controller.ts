// Controller files: handle logic between routes and services

import { Request, Response } from "express";
import {
  CreateAccountBody,
  UpdateAccountBody,
  AccountResponse,
} from "./account.model";
import * as AccountService from "./account.service";

// GET /accounts
export const getAllAccounts = async (
  req: Request,
  res: Response<AccountResponse[]>
) => {
  const accounts = await AccountService.getAllAccounts();
  res.json(accounts);
};

// GET /accounts/:id
export const getAccountById = async (
  req: Request<{ id: string }, AccountResponse | { message: string }>,
  res: Response<AccountResponse | { message: string }>
) => {
  const account = await AccountService.getAccountById(req.params.id);
  if (!account) return res.status(404).json({ message: "Account not found" });
  res.json(account);
};

// POST /accounts
export const createAccount = async (
  req: Request<{}, AccountResponse, CreateAccountBody>,
  res: Response<AccountResponse>
) => {
  const account = await AccountService.createAccount(req.body);
  res.status(201).json(account);
};

// PUT /accounts/:id
export const updateAccount = async (
  req: Request<
    { id: string },
    AccountResponse | { message: string },
    UpdateAccountBody
  >,
  res: Response<AccountResponse | { message: string }>
) => {
  const account = await AccountService.updateAccount(req.params.id, req.body);
  if (!account) return res.status(404).json({ message: "Account not found" });
  res.json(account);
};

// DELETE /accounts/:id
export const deleteAccount = async (
  req: Request<{ id: string }, void>,
  res: Response<void>
) => {
  const ok = await AccountService.deleteAccount(req.params.id);
  if (!ok) return res.status(404).send();
  res.status(204).send();
};
