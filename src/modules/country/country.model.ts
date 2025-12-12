import mongoose, { Schema, Document } from "mongoose";

export interface ICountry extends Document {
  name: string;
  code: string;
}

const CountrySchema: Schema = new Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true},
  },
  { timestamps: true }
);

export default mongoose.model<ICountry>("Country", CountrySchema);


export interface CreateCountryBody {
  name: string;
  code: string;
}

export interface UpdateCountryBody {
  name: string;
  code: string;
}

export interface CountryResponse {
    name: string
    code: string
    message?: string
}
export const toResponseCountry = (doc: ICountry): CountryResponse => ({
    name: doc.name,
    code: doc.code
});

