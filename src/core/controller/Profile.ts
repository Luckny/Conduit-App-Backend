import { User, iUser, Profile } from "../model/User";
import { AlreadyExistsError } from "../../errors/alreadyExistsError";
import { InvalidParameterError } from "../../errors/invalidParameterError";
import { NotFoundError } from "../../errors/notFoundError";
import { UnauthorizedError } from "../../errors/unauthorizedError";
import { Utils } from "../../lib/Utils";
export class ProfileController {
   public async getProfile(username: string, currentUserId: string | undefined): Promise<Profile> {
      let currentUser: iUser;
      if (currentUserId) {
         currentUser = await User.findById(currentUserId);
      }
      const user = await User.findOne({ username: username });
      if (!user) throw new NotFoundError("user profile not found");
      return user.asProfileDTO(currentUser ? currentUser.isFollowing(user._id) : false);
   }

   public async follow(username: string, currentUserId: string): Promise<Profile> {
      const currentUser: iUser = await User.findById(currentUserId);
      const userToFollow: iUser = await User.findOne({ username: username });
      // if currentUser tries to follow itself default to true
      if (currentUser.equals(userToFollow)) return userToFollow.asProfileDTO(true);

      // if not already following
      if (!currentUser.isFollowing(userToFollow._id)) currentUser.follow(userToFollow);

      return userToFollow.asProfileDTO(currentUser.isFollowing(userToFollow._id));
   }
}
