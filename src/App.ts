require("dotenv").config();
import express = require("express");
import logger = require("morgan");

// routes
import { userRouter } from "./core/routes/User";
import { profileRouter } from "./core/routes/Profile";
import { articleRouter } from "./core/routes/Article";
import { tagRouter } from "./core/routes/Tag";
class App {
   public express: express.Application;

   constructor() {
      this.express = express();
      this.middleware();
      this.routes();
   }

   // Middlewares
   private middleware(): void {
      this.express.use(logger("dev")); // to show usefull info in the console
      this.express.use(express.urlencoded({ extended: true }));
      this.express.use(express.json());
   }

   private routes(): void {
      let router: express.Router = express.Router();

      this.express.use("/api", userRouter.router);
      this.express.use("/api/profiles", profileRouter.router);
      this.express.use("/api/articles", articleRouter.router);
      this.express.use("/api/tags", tagRouter.router);
   }
}
export default new App().express;
