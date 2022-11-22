import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../controller/User";
import ErrorCatcher from "../../lib/ErrorCatcher";
import { StatusCodes } from "http-status-codes";
import AbstractError from "../../errors/abstractError";

export class UserRouter {
   public router: Router;
   public controller: UserController;

   constructor() {
      this.controller = new UserController();
      this.router = Router();
      this.init();
   }

   public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { user: info } = req.body;
      const user = await this.controller.register(info);
      res.status(StatusCodes.CREATED).json(user);
   }

   public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { user: info } = req.body;
      const user = await this.controller.login(info);
      res.status(StatusCodes.OK).json(user);
   }

   private errorHandler(
      err: AbstractError | any,
      req: Request,
      res: Response,
      next: NextFunction
   ): any {
      // console.log(err);
      if (err.name === "ValidationError") {
         return res.status(409).json({ errors: { body: [err.message.split("failed: ")[1]] } });
      }
      return res.status(err.code).json(JSON.parse(err.message));
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
   }
}

export const userRouter = new UserRouter();
userRouter.init();