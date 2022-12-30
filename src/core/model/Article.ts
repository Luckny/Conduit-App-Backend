import { Schema, Types, model, Document } from "mongoose";
import { iTag } from "./Tag";
import { iUser } from "./User";
const uniqueValidator = require("mongoose-unique-validator");

export interface iArticle extends Document {
   slug: string;
   title: string;
   description: string;
   body: string;
   tagList: Types.DocumentArray<iTag>;
   favorited: boolean;
   favoritesCount: number;
   author: Types.Subdocument<iUser>;
   //    comments: Types.DocumentArray<Comment>;
   asDTO(user: iUser): Article;
}

export type Article = {
   slug: string;
   title: string;
   description: string;
   body: string;
   tagList: string[];
   createdAt: Date;
   updatedAt: Date;
   favorited: boolean;
   favoritesCount: number;
   author: any;
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
      author: { type: Types.ObjectId, ref: "User", required: true },
      //   comments: [{type: Types.ObjectId, ref: "Comment"}]
   },
   { timestamps: true }
);

articleSchema.methods.asDTO = function (user: iUser): Article {
   return {
      slug: this.slug,
      title: this.title,
      description: this.description,
      body: this.body,
      tagList: this.tagList.map((tag: iTag) => tag.name),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      favorited: user?.favorites.includes(this._id) || false,
      favoritesCount: this.favoritesCount,
      author: this.author.asProfileDTO(user?.isFollowing(this.author._id) || false),
   };
};

articleSchema.plugin(uniqueValidator, { message: "already exists" });

export const Article = model<iArticle>("Article", articleSchema);
