import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProfile extends Document {
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  joinDate: Date;
  phone?: string;
  countryId?: Types.ObjectId;
}

const ProfileSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, ref: "User" },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: { type: String },
    joinDate: { type: Date, required: true },
    phone: {
      type: String,
      match: [/^(\d{3})-(\d{3})-(\d{4})$/, "Invalid phone format"],
    },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: "Country",
      required: false,
      defaut: new Types.ObjectId("69365d89d6ebcc3c6f4affa9"),
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProfile>("Profile", ProfileSchema);
