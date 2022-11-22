require("dotenv").config();
import express = require("express");
import logger = require("morgan");

// routes
import { userRouter } from "./core/routes/User";
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
   }
}
export default new App().express;
