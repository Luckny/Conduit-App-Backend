import { Schema, Types, model, Document } from "mongoose";
import { iTag } from "./Tag";
import { Profile } from "./User";
const uniqueValidator = require("mongoose-unique-validator");

export interface iArticle extends Document {
   slug: string;
   title: string;
   description: string;
   body: string;
   tagList: Types.DocumentArray<iTag>;
   favorited: boolean;
   favoritesCount: number;
   author: Types.Subdocument<Profile>;
   //    comments: Types.DocumentArray<Comment>;
}

export type Article = {
   slug: string;
   title: string;
   description: string;
   body: string;
   tagList: Types.DocumentArray<iTag>;
   favorited: boolean;
   favoritesCount: number;
   author: Types.Subdocument<Profile>;
};
const articleSchema: Schema = new Schema<iArticle>(
   {
      slug: {
         type: String,
         unique: true,
         required: true,
      },
      title: { type: String, required: true },
      description: { type: String, default: "" },
      body: { type: String, required: true },
      tagList: [{ type: Types.ObjectId, ref: "Tag" }],
      favoritesCount: { type: Number, default: 0 },
      author: { type: Types.ObjectId, ref: "Profile" },
      //   comments: [{type: Types.ObjectId, ref: "Comment"}]
   },
   { timestamps: true }
);

articleSchema.plugin(uniqueValidator, { message: "already exists" });

export const Article = model<iArticle>("Article", articleSchema);
