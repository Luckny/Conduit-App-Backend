import { NextFunction, Router, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AbstractError from "../../errors/abstractError";
import ErrorCatcher from "../../lib/ErrorCatcher";
import { Utils } from "../../lib/Utils";
import { Auth, customRequest } from "../../middlewares/Auth";
import { ArticleController } from "../controller/Article";

export class ArticleRouter {
   public router: Router;
   private controller: ArticleController;

   constructor() {
      this.router = Router();
      this.controller = new ArticleController();
      this.init();
   }

   private async createOne(req: customRequest, res: Response, next: NextFunction): Promise<void> {
      const { id } = req.payload;
      const { article: articleInfo } = req.body;
      const article = await this.controller.createOne(articleInfo, id);
      res.status(StatusCodes.OK).json({ article });
   }

   private async feed(req: customRequest, res: Response, next: NextFunction): Promise<void> {
      const userId = req.payload?.id;
      const articles = await this.controller.feed(userId);
      res.status(StatusCodes.OK).json({ articles: [...articles], articlesCount: articles.length });
   }

   private errorHandler(err: AbstractError | any, req: Request, res: Response, next: NextFunction): any {
      console.log(err);
      if (err.code === "credentials_required") return res.status(err.status).json(Utils.renderError(err.inner.message));

      if (err.name === "ValidationError")
         return res.status(409).json(Utils.renderError(err.message.split("failed: ")[1]));

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Utils.renderError("internal server error"));
   }

   // .bind  https://stackoverflow.com/a/15605064/1168342
   public init(): void {
      /**
       * {POST} /api/articles
       * Create an article
       * @success (201) {JSON} {article: {slug,title,description,body,tagList, ...}}
       */
      this.router.post("/", Auth.required, ErrorCatcher(this.createOne.bind(this)), this.errorHandler);

      /**
       * {GET} /api/articles/feed
       * get articles
       * @success (200) {JSON} {articles: [{slug,title,description,body,tagList, ...}, {...}]}
       */
      this.router.get("/feed", Auth.optional, ErrorCatcher(this.feed.bind(this)), this.errorHandler);
   }
}

export const articleRouter = new ArticleRouter();
articleRouter.init();
