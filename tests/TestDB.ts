import mongoose from "mongoose";

export class TestDB {
   public async connect(): Promise<void> {
      await mongoose.connect("mongodb://127.0.0.1:27017/test");
   }

   public async close(): Promise<void> {
      await mongoose.connection.close();
   }
}
