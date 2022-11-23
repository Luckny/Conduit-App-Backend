import { User, iUser } from "../model/User";
import { AlreadyExistsError } from "../../errors/alreadyExistsError";
import { InvalidParameterError } from "../../errors/invalidParameterError";
import { NotFoundError } from "../../errors/notFoundError";
import { UnauthorizedError } from "../../errors/unauthorizedError";
import { Utils } from "../../lib/Utils";

export class UserController {
   public async register(userInfo: RegisterInfo): Promise<User> {
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

   public async updateUser(userId: string, updateInfo: UpdateInfo): Promise<User> {
      this.validateUpdateFields(updateInfo);
      const user = await User.findById(userId);
      Object.keys(updateInfo).forEach((property: string) => {
         user[property] = updateInfo[property];
      });
      await user.save();
      return user.asDTO(null);
   }

   private validateUpdateFields(info: UpdateInfo): void {
      if (!Object.keys(info).length) throw new InvalidParameterError("invalid update parameter");
      const { username, email, password, bio, image } = info;
      // if username is provided but not valid
      if (!username && username !== undefined)
         throw new InvalidParameterError("invalid update parameter: username");
      // if email is provided but not valid
      if (!email && email !== undefined)
         throw new InvalidParameterError("invalid update parameter: email");

      if (!password && password !== undefined)
         throw new InvalidParameterError("invalid update parameter: password");

      const validKeys = ["username", "email", "password", "bio", "image"];
      Object.keys(info).forEach((key) => {
         if (!validKeys.includes(key)) throw new InvalidParameterError(`unexpected field: ${key}`);
      });
   }
}

type RegisterInfo = { username: string; email: string; password: string };
type UpdateInfo = { username: string; email: string; password: string; bio: string; image: string };
