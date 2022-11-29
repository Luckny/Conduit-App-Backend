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
      // if currentUser tries to follow themself:  default to true
      if (currentUser.equals(userToFollow)) return userToFollow.asProfileDTO(true);

      if (!userToFollow) throw new NotFoundError("user profile not found");

      // if not already following
      if (!currentUser.isFollowing(userToFollow._id)) currentUser.follow(userToFollow);

      return userToFollow.asProfileDTO(currentUser.isFollowing(userToFollow._id));
   }

   public async unfollow(username: string, currentUserId: string): Promise<Profile> {
      const currentUser: iUser = await User.findById(currentUserId);
      const userToUnfollow: iUser = await User.findOne({ username: username });

      // if currentUser tries to unfollow themself : just return
      if (currentUser.equals(userToUnfollow)) return userToUnfollow.asProfileDTO(true);

      // if username do not exist: 404
      if (!userToUnfollow) throw new NotFoundError("user profile not found");

      // if current user is not following userToUnfollow: 404
      if (!currentUser.isFollowing(userToUnfollow._id)) throw new NotFoundError("user not found in following list");

      // unfollow the user
      currentUser.unfollow(userToUnfollow);
      return userToUnfollow.asProfileDTO(currentUser.isFollowing(userToUnfollow._id));
   }
}
