import { User } from "../model/User";
import { AlreadyExistsError } from "../../errors/alreadyExistsError";
import { InvalidParameterError } from "../../errors/invalidParameterError";

export class UserController {
   public async register(userInfo: registerInfo): Promise<any> {
      const { username, email, password } = userInfo;
      if (!username || !email || !password)
         throw new InvalidParameterError(
            "a parameter for username, email or password might not have been provided"
         );
      let user = await User.findOne({ username, email }); // checks to see if user already exist
      if (user) throw new AlreadyExistsError("user already exits");
      user = new User({ username, email, password });
      user = await user.save();
      return user.clean();
   }
}

type registerInfo = { username: string; email: string; password: string };
