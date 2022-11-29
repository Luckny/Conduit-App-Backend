import { iTag, Tag } from "../model/Tag";
import { NotFoundError } from "../../errors/notFoundError";
export class TagController {
   public async getTags(): Promise<string[]> {
      const tags: iTag[] = await Tag.find({});
      if (!tags.length) throw new NotFoundError("no tags found");
      return tags.map((tag: iTag) => tag.name);
   }
}
