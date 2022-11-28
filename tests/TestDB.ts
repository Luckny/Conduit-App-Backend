import mongoose from "mongoose";

export class TestDB {
   private name: string;

   constructor(name: string) {
      this.name = name;
   }
   public async connect(): Promise<void> {
      await mongoose.connect(`mongodb://127.0.0.1:27017/${this.name}`);
   }

   public async close(): Promise<void> {
      await mongoose.connection.close();
   }
}
