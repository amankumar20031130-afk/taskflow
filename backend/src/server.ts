import "dotenv/config";
import http from "http";
import app from "./app";
import { connectDB } from "./config/db";
import env from "./config/env";
import { initSocket } from "./sockets";

connectDB();

const server = http.createServer(app);

initSocket(server);

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
