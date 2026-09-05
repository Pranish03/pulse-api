import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { userRouter } from "./modules/users/users.routes.js";

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL!,
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

app.use("/api/users", userRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello World!",
  });
});

io.on("connection", () => {
  console.log("User connected");
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
