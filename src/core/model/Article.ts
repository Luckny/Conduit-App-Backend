import { Schema, Types, model } from "mongoose";
import { iTag } from "./Tag";
import { Profile } from "./User";
export interface iArticle {
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
export const Article = model<iArticle>("Article", articleSchema);
