import Country, {
  CountryResponse,
  CreateCountryBody,
  toResponseCountry,
} from "./country.model";

export const getAll = async (): Promise<CountryResponse[]> => {
  try {
    const countries = await Country.find({});
    return countries.map(toResponseCountry);
  } catch (err) {
    throw new Error("Failed to get countries");
  }
};

export const create = async (
  data: CreateCountryBody
): Promise<CountryResponse> => {
  try {
    const country = new Country(data);
    const saved = await country.save();
    return toResponseCountry(saved);
  } catch (err) {
    throw new Error("Failed to create countries");
  }
};

export const createMany = async (
  data: CreateCountryBody[]
): Promise<CountryResponse[]> => {
  try {
    const savedCountries = await Country.insertMany(data);
    return savedCountries as CountryResponse[];
  } catch (err) {
    console.error(err);
    throw new Error(
      "Failed to create countries or some countries already exist."
    );
  }
};
