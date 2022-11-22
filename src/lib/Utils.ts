import * as jwt from "jsonwebtoken";

export class Utils {
   public static renderError(...messages: string[]): any {
      return { errors: { body: [...messages] } };
   }

   public static generateJWT(id: string): string {
      const payload = { id, iat: Date.now() };
      return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
   }
}
