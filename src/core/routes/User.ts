import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../controller/User";
import ErrorCatcher from "../../lib/ErrorCatcher";
import { StatusCodes } from "http-status-codes";
import AbstractError from "../../errors/abstractError";
import { Auth, customRequest } from "../../middlewares/Auth";
import { Utils } from "../../lib/Utils";

export class UserRouter {
   public router: Router;
   public controller: UserController;

   constructor() {
      this.controller = new UserController();
      this.router = Router();
      this.init();
   }

   private async register(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { user: info } = req.body;
      const user = await this.controller.register(info);
      res.status(StatusCodes.CREATED).json(user);
   }

   private async login(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { user: info } = req.body;
      const user = await this.controller.login(info);
      res.status(StatusCodes.OK).json(user);
   }

   private async currentUser(req: customRequest, res: Response, next: NextFunction): Promise<void> {
      const {
         payload: { id },
      } = req;
      const user = await this.controller.currentUser(id);
      res.status(StatusCodes.OK).json(user);
   }

   private async updateUser(req: customRequest, res: Response, next: NextFunction): Promise<void> {
      const {
         payload: { id },
      } = req;
      const { user: info } = req.body;
      const user = await this.controller.updateUser(id, info);
      res.status(StatusCodes.OK).json(user);
   }

   private errorHandler(
      err: AbstractError | any,
      req: Request,
      res: Response,
      next: NextFunction
   ): any {
      // console.log(err);
      if (err.code === "credentials_required")
         return res.status(err.status).json(Utils.renderError(err.inner.message));

      if (err.name === "ValidationError")
         return res.status(409).json(Utils.renderError(err.message.split("failed: ")[1]));

      if (!err.code)
         return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(Utils.renderError("internal server error"));

      return res.status(err.code).json(Utils.renderError(err.message));
   }

   // .bind  https://stackoverflow.com/a/15605064/1168342
   public init(): void {
      /**
       * {POST} /api/users
       * Register a user
       * @success (201) {JSON} {user: {email,token, username, bio, image}}
       */
      this.router.post("/users", ErrorCatcher(this.register.bind(this)), this.errorHandler);
      /**
       * {POST} /api/users/login
       * authentify a user
       * @success (200) {JSON} {user: {email,token, username, bio, image}}
       */
      this.router.post("/users/login", ErrorCatcher(this.login.bind(this)), this.errorHandler);
      /**
       * {GET} /api/users
       * get the current logged in user
       * @success (200) {JSON} {user: {email,token, username, bio, image}}
       */
      this.router.get(
         "/user",
         Auth.required,
         ErrorCatcher(this.currentUser.bind(this)),
         this.errorHandler
      );
      /**
       * {PUT} /api/user
       * update the current logged in user
       * @success (200) {JSON} {user: {email,token, username, bio, image}}
       */
      this.router.put(
         "/user",
         Auth.required,
         ErrorCatcher(this.updateUser.bind(this)),
         this.errorHandler
      );
   }
}

export const userRouter = new UserRouter();
userRouter.init();
