import App from "./App";

const port = sanitizePort(process.env.PORT || 3000);

console.log("Starting server...");
console.log("Use https://api.realworld.io/api-docs/ to access api documentation");

App.set("port", port);
App.listen(port, () => {
   console.log("Server started on port: ", port);
});

function sanitizePort(value: number | string): number | string | boolean {
   let port: number = typeof value === "string" ? parseInt(value, 10) : value;
   if (isNaN(port)) return value;
   else if (port >= 0) return port;
   else return false;
}
