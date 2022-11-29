import { Router, Request, Response, NextFunction } from "express";
import { ProfileController } from "../controller/Profile";
import ErrorCatcher from "../../lib/ErrorCatcher";
import { StatusCodes } from "http-status-codes";
import AbstractError from "../../errors/abstractError";
import { Auth, customRequest } from "../../middlewares/Auth";
import { Utils } from "../../lib/Utils";

export class ProfileRouter {
   public router: Router;
   public controller: ProfileController;

   constructor() {
      this.controller = new ProfileController();
      this.router = Router();
      this.init();
   }

   private async getProfile(req: customRequest, res: Response, next: NextFunction): Promise<void> {
      const id = req.payload?.id || null;
      const { username } = req.params;
      const profile = await this.controller.getProfile(username, id);
      res.status(StatusCodes.OK).json(profile);
   }

   private async follow(req: customRequest, res: Response, next: NextFunction): Promise<void> {
      const { id } = req.payload;
      const { username } = req.params;
      const profile = await this.controller.follow(username, id);
      res.status(StatusCodes.OK).json(profile);
   }

   private errorHandler(err: AbstractError | any, req: Request, res: Response, next: NextFunction): any {
      //   console.log(err);
      if (err.code === "credentials_required") return res.status(err.status).json(Utils.renderError(err.inner.message));
      return res.status(err.code).json(Utils.renderError(err.message));
   }

   // .bind  https://stackoverflow.com/a/15605064/1168342
   public init(): void {
      /**
       * {GET} /api/profile/:username
       * get a profile
       * @success (200) {JSON} {profile: {username, bio, image, following}}
       */
      this.router.get("/:username", Auth.optional, ErrorCatcher(this.getProfile.bind(this)), this.errorHandler);
      /**
       * {POST} /api/users/login
       * authentify a user
       * @success (200) {JSON} {user: {email,token, username, bio, image}}
       */
      this.router.post("/:username/follow", Auth.required, ErrorCatcher(this.follow.bind(this)), this.errorHandler);
      /**
       * {GET} /api/users
       * get the current logged in user
       * @success (200) {JSON} {user: {email,token, username, bio, image}}
       */
      //   this.router.get("/user", Auth.required, ErrorCatcher(this.currentUser.bind(this)), this.errorHandler);
   }
}

export const profileRouter = new ProfileRouter();
profileRouter.init();
