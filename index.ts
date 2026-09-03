import "dotenv/config";
import express, { type Request, type Response } from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello World!",
  });
});

io.on("connection", () => {
  console.log("User connected");
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
