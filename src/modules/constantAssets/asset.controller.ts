import { ASSETS, Network } from "./asset.model";
import { Request, Response } from "express";

export function getAssetController(req: Request, res: Response) {
    try{
        const value = ASSETS.map(asset => ({
            ...asset,
            networks: asset.networks.map(n => Network[n]),
        }));
        res.json(value)
    }
    catch(err:any){
        res.status(400).json({ message: err.message || "Failed to fetch history" });
    }
  }