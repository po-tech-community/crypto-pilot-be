import Country, {
  CountryResponse,
  CreateCountryBody,
  ICountry,
  toResponseCountry,
} from "./country.model";

export const GetAllCountries = async (): Promise<CountryResponse[]> => {
  try {
    const countries = await Country.find({});
    return countries.map(toResponseCountry);
  } catch (err) {
    throw new Error("Failed to get countries");
  }
};

export const CreateCountry = async (data: CreateCountryBody): Promise<CountryResponse> => {
  try {
    const country = new Country(data);
    const saved = await country.save();
    return toResponseCountry(saved);
  } catch (err) {
    throw new Error("Failed to create countries");
  }
};

export const CreateManyCountries = async (data: CreateCountryBody[]): Promise<CountryResponse[]> => {
  try {
    const savedCountries = await Country.insertMany(data);
    return savedCountries as CountryResponse[]; 
  } catch (err) {
    console.error(err); 
    throw new Error("Failed to create countries or some countries already exist.");
  }
};