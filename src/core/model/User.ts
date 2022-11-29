import { Document, Types, Schema, model } from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");
import bcrypt = require("bcrypt");

export interface iUser extends Document {
   username: string;
   email: string;
   password: string;
   bio: string;
   image: string;
   following: Types.DocumentArray<iUser>;
   asDTO(token: string | null): User;
   asProfileDTO(isFollowing: boolean): Profile;
   isValidPassword(password: string): boolean;
   isFollowing(userId: string): boolean;
   follow(user: iUser): void;
   unfollow(user: iUser): void;
}

export type User = {
   user: { email: string; username: string; bio: string; image: string; token: string };
};
export type Profile = { profile: { username: string; bio: string; image: string; following: boolean } };

export const userSchema: Schema = new Schema<iUser>({
   username: {
      type: String,
      required: true,
      unique: true,
   },
   password: {
      type: String,
      required: true,
   },
   email: {
      type: String,
      required: true,
      unique: true,
   },
   bio: {
      type: String,
      default: "",
   },

   image: {
      type: String,
      default: "",
   },
   //  favorites: [
   //     {
   //        type: Schema.Types.ObjectId,
   //        ref: "Article",
   //     },
   //  ],
   following: [
      {
         type: Schema.Types.ObjectId,
         ref: "User",
      },
   ],
});

userSchema.plugin(uniqueValidator, { message: "already exists" });

userSchema.pre("save", async function (next) {
   const user = this;
   if (!user.isModified("password")) return next(); // if password field is not modified, return
   this.password = await bcrypt.hash(user.password, 10); // hash the password
   next();
});

// returns clean user info as per API specifications
userSchema.methods.asDTO = function (token: string | null): User {
   return {
      user: {
         username: this.username,
         email: this.email,
         bio: this.bio,
         image: this.image,
         token: token ?? "",
      },
   };
};

userSchema.methods.asProfileDTO = function (isFollowing: boolean): Profile {
   return {
      profile: {
         username: this.username,
         bio: this.bio,
         image: this.image,
         following: isFollowing,
      },
   };
};

userSchema.methods.follow = function (user: iUser): void {
   this.following.push(user._id);
   this.save();
};

userSchema.methods.unfollow = function (user: iUser): void {
   this.following.remove(user._id);
   this.save();
};

userSchema.methods.isFollowing = function (userId: string): boolean {
   return this.following.includes(userId);
};
userSchema.methods.isValidPassword = async function (password: string): Promise<boolean> {
   return await bcrypt.compare(password, this.password);
};

export const User = model<iUser>("User", userSchema);
