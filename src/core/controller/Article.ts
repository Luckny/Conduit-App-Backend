import { Article, iArticle } from "../model/Article";
import slug = require("slug");
// random string import
export class ArticleController {
   public async createOne(articleInfo: ArticleCreateInfo, authorId: string): Promise<Article> {
      const { title, description, body, tagList } = articleInfo;
      let article: iArticle = new Article({ slug: this.urlSlug(title), title, description, body, tagList });
      article = await article.save();

      return article;
   }

   private urlSlug(title: string): string {
      // let salt = cryptoRandomString({ length: 10, type: "url-safe" });
      return slug(`${title}`);
   }
}

type ArticleCreateInfo = { title: string; description: string; body: string; tagList: string[] };
