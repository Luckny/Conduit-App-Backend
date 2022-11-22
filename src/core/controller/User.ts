import { User, iUser } from "../model/User";
import { AlreadyExistsError } from "../../errors/alreadyExistsError";
import { InvalidParameterError } from "../../errors/invalidParameterError";
import { NotFoundError } from "../../errors/notFoundError";
import { UnauthorizedError } from "../../errors/unauthorizedError";
import { Utils } from "../../lib/Utils";

export class UserController {
   public async register(userInfo: registerInfo): Promise<User> {
      const { username, email, password } = userInfo;
      if (!username || !email || !password)
         throw new InvalidParameterError(
            "invalid parameter error: a parameter for username, email or password might not have been provided"
         );
      let user: iUser = await User.findOne({ username, email }); // checks to see if user already exist
      if (user) throw new AlreadyExistsError("user already exits");
      user = new User({ username, email, password });
      user = await user.save();
      //generate user token
      const token: string = Utils.generateJWT(user._id);
      return user.asDTO(token);
   }

   public async login(userInfo: { email: string; password: string }): Promise<User> {
      const { email, password } = userInfo;
      if (!email || !password)
         throw new InvalidParameterError(
            "invalid parameter error: a parameter for email or password might not have been provided"
         );

      let user: iUser = await User.findOne({ email });
      if (!user) throw new NotFoundError("user not found");

      if (!(await user.isValidPassword(password)))
         throw new UnauthorizedError("invalid credentials");

      //generate user token
      const token: string = Utils.generateJWT(user._id);
      return user.asDTO(token);
   }

   public async currentUser(id: string): Promise<User> {
      return (await User.findById(id)).asDTO(null);
   }
}

type registerInfo = { username: string; email: string; password: string };
