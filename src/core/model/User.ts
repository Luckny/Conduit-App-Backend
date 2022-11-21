import { Document, Types, Schema, model } from "mongoose";
import * as jwt from "jsonwebtoken";
const uniqueValidator = require("mongoose-unique-validator");
import bcrypt = require("bcrypt");

interface iUser extends Document {
   username: string;
   email: string;
   password: string;
   bio: string;
   image: string;
   following: Types.DocumentArray<iUser>;
   clean(): Cleaned;
}

type Cleaned = { user: { email: string; username: string; bio: string; image: string } };
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
   // if (!user.isModified("password")) return next(); // if password field is not modified, return
   this.password = await bcrypt.hash(user.password, 10); // hash the password
   next();
});

// returns clean user info as per API specifications
userSchema.methods.clean = function () {
   return {
      user: {
         username: this.username,
         email: this.email,
         bio: this.bio,
         image: this.image,
         token: generateJwt(this),
      },
   };
};

export const User = model<iUser>("User", userSchema);

function generateJwt(user: iUser): string {
   const payload = { id: user._id, iat: Date.now() };
   return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
}
