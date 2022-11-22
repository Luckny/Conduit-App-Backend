import App from "./App";
import mongoose from "mongoose";
const port = sanitizePort(process.env.PORT || 3200);

console.log("Starting server...");
console.log("Use https://api.realworld.io/api-docs/ to access api documentation");

App.set("port", port);
App.listen(port, () => {
   console.log(`Listening on http://localhost:${port}`);
});

// Database connection
let localMongoURI: string = "mongodb://127.0.0.1:27017/conduit";
const URI = process.env.DB_URI || localMongoURI;
mongoose.connect(URI).then(() => {
   console.log("Connected to database");
});

function sanitizePort(value: number | string): number | string | boolean {
   let port: number = typeof value === "string" ? parseInt(value, 10) : value;
   if (isNaN(port)) return value;
   else if (port >= 0) return port;
   else return false;
}
