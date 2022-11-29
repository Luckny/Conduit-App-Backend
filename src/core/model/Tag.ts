import { Document, Schema, model } from "mongoose";
export interface iTag extends Document {
   name: string;
}

const tagSchema: Schema = new Schema<iTag>({
   name: {
      type: String,
      unique: true,
      required: true,
   },
});

export const Tag = model<iTag>("Tag", tagSchema);
