import express = require("express");
import logger = require("morgan");
class App {
   public express: express.Application;

   constructor() {
      this.express = express();
      this.middleware();
   }

   // Middlewares
   private middleware(): void {
      this.express.use(logger("dev"));
   }
}
export default new App().express;
