import { User } from "../model/User";

export class UserController {
   public async register(userInfo: registerInfo): Promise<any> {
      const { username, email, password } = userInfo;
      let user = await User.findOne({ username, email }); // checks to see if user already exist
      if (user) throw new Error("already exist");

      user = new User({ username, email, password });
      user = await user.save();
      return user.clean();
   }
}

type registerInfo = { username: string; email: string; password: string };