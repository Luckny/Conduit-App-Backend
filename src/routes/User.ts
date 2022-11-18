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
      const { user } = req.body;
      const newUser = await this.controller.register(user);
      res.status(StatusCodes.CREATED).json(newUser);
   }

   private errorHandler(
      err: AbstractError | any,
      req: Request,
      res: Response,
      next: NextFunction
   ): any {
      console.log(err);
      return res.status(err.code).json(JSON.parse(err.message));
   }

   public init(): void {
      /**
       * {POST} /api/user
       * Register a user
       * @success (201) {JSON} {user: {email,token, username, bio, image}}
       */
      this.router.post("/users", ErrorCatcher(this.register.bind(this)), this.errorHandler); // .bind  https://stackoverflow.com/a/15605064/1168342
   }
}

export const userRouter = new UserRouter();
userRouter.init();
