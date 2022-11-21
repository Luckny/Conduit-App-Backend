import { User, iUser } from "../model/User";
import { AlreadyExistsError } from "../../errors/alreadyExistsError";
import { InvalidParameterError } from "../../errors/invalidParameterError";
import { NotFoundError } from "../../errors/notFoundError";
import { UnauthorizedError } from "../../errors/unauthorizedError";

export class UserController {
   public async register(userInfo: registerInfo): Promise<any> {
      const { username, email, password } = userInfo;
      if (!username || !email || !password)
         throw new InvalidParameterError(
            "invalid parameter error: a parameter for username, email or password might not have been provided"
         );
      let user: iUser = await User.findOne({ username, email }); // checks to see if user already exist
      if (user) throw new AlreadyExistsError("user already exits");
      user = new User({ username, email, password });
      user = await user.save();
      return user.clean();
   }

   public async login(userInfo: { email: string; password: string }): Promise<any> {
      const { email, password } = userInfo;
      if (!email || !password)
         throw new InvalidParameterError(
            "invalid parameter error: a parameter for email or password might not have been provided"
         );

      let user: iUser = await User.findOne({ email });
      if (!user) throw new NotFoundError("user not found");

      if (!(await user.isValidPassword(password)))
         throw new UnauthorizedError("invalid credentials");

      return user.clean();
   }
}

type registerInfo = { username: string; email: string; password: string };
