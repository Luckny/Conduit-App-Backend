import { expressjwt as jwt, Request } from "express-jwt";
import { JwtPayload } from "jsonwebtoken";

export interface customRequest extends Request {
   payload: JwtPayload;
}
export const Auth = {
   // middleware for required authorization
   required: jwt({
      secret: process.env.JWT_SECRET,
      algorithms: ["HS256"],
      requestProperty: "payload",
      getToken: getTokenFromHeaders,
   }),

   optional: jwt({
      secret: process.env.JWT_SECRET,
      algorithms: ["HS256"],
      requestProperty: "payload",
      getToken: getTokenFromHeaders,
      credentialsRequired: false,
   }),
};

function getTokenFromHeaders(req: Request): string {
   const { authorization } = req.headers;
   if (authorization && authorization.split(" ")[0] === "Token") return authorization.split(" ")[1];
   return null;
}
