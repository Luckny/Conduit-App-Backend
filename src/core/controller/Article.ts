import { Article, iArticle } from "../model/Article";
import slug = require("slug");
import { Tag } from "../model/Tag";
import { User } from "../model/User";
// random string import
export class ArticleController {
   public async createOne(articleInfo: ArticleCreateInfo, authorId: string): Promise<Article> {
      const { title, description, body, tagList } = articleInfo;
      const tagsId = (await this.transformTagListToTagId(tagList)) || [];
      const author = await User.findById(authorId);

      let article: iArticle = new Article({
         slug: slug(title),
         title,
         description,
         body,
         tagList: tagsId,
         author: authorId,
      });

      article = await (await article.save()).populate("tagList");
      return article.asDTO(article.tagList, author);
   }

   private async transformTagListToTagId(tagList: string[]): Promise<string[]> {
      if (!tagList || (tagList && tagList.length === 0)) return null;
      return await Promise.all(
         tagList.map(async (tagName: string) => {
            let tag = await Tag.findOne({ name: tagName });
            if (!tag) {
               tag = new Tag({ name: tagName });
               tag = await tag.save();
            }
            return tag._id;
         })
      );
   }
}

type ArticleCreateInfo = { title: string; description: string; body: string; tagList: string[] };
