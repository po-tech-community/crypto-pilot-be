import { Request, Response } from "express";
import {
  CreateCountry,
  CreateManyCountries,
  GetAllCountries,
} from "./country.service";
import { CountryResponse, CreateCountryBody } from "./country.model";

export const GetListCountries = async (
  req: Request,
  res: Response<{}, CountryResponse[]>
) => {
  try {
    const countries = await GetAllCountries();
    if (countries.length === 0) {
      return res.status(404).send();
    }
    res.status(200).json(countries);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const createACountry = async (
  req: Request<{}, CountryResponse, CreateCountryBody>,
  res: Response<{}, CountryResponse>
) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: "name or code is required" });
    }
    const country = await CreateCountry(req.body);
    res.status(201).json(country);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const createManyCountries = async (
  req: Request<{}, CountryResponse[], CreateCountryBody[]>,
  res: Response<CountryResponse[]>
) => {
  try {
    const countriesData = req.body;
    if (!Array.isArray(countriesData) || countriesData.length === 0) {
      return res
        .status(400)
        .json({
          message: "Request body must be a non-empty array of countries.",
        } as any);
    }

    const invalidCountry = countriesData.find((c) => !c.name || !c.code);
    if (invalidCountry) {
      return res
        .status(400)
        .json({
          message: "Every country object must have 'name' and 'code'.",
        } as any);
    }
    const savedCountries = await CreateManyCountries(countriesData);

    res.status(201).json(savedCountries);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message || "Server Error" } as any);
  }
};
