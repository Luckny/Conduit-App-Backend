import { Router, Request, Response, NextFunction } from "express";
import { TagController } from "../controller/Tag";
import ErrorCatcher from "../../lib/ErrorCatcher";
import AbstractError from "../../errors/abstractError";
import { Utils } from "../../lib/Utils";
import { StatusCodes } from "http-status-codes";

export class TagRouter {
   public router: Router;
   private controller: TagController;

   constructor() {
      this.router = Router();
      this.controller = new TagController();
      this.init();
   }

   private async getTags(req: Request, res: Response, next: NextFunction): Promise<void> {
      const tags = await this.controller.getTags();
      res.status(StatusCodes.OK).json({ tags: [...tags] });
   }

   private errorHandler(err: AbstractError | any, req: Request, res: Response, next: NextFunction): any {
      console.log(err);
      return res.status(err.code).json(Utils.renderError(err.message));
   }

   // .bind  https://stackoverflow.com/a/15605064/1168342
   public init(): void {
      /**
       * {GET} /api/tags
       * Return list of tags
       * @success (200) {JSON} {tags: [string]}
       */
      this.router.get("/", ErrorCatcher(this.getTags.bind(this)), this.errorHandler);
   }
}

export const tagRouter = new TagRouter();
tagRouter.init();
