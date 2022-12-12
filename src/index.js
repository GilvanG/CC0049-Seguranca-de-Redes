import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { mongoWrapper } from "./database/mongo.js";
import { AuthMiddleware } from "./middlewares/auth.middleware.js";
import router from "./routes/routes.js";
import logger from './utils/logger.js'
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const start = async () => {
  try {
    await mongoWrapper.connectToMongo();
  } catch (err) {
    console.log("[mongo] Erro ao conectar no Mongo ", err);
  }
};
start();
app.use(express.json());
app.use(cors());
app.use(AuthMiddleware)
app.use(
  morgan(
    "[logger] :method :url :status :response-time ms - :res[content-length]",
    {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    }
  )
);
app.use(helmet());
app.use(router);
app.get("/", (req, res) => {
  res.send({ message: "Welcome to System Login!" });
});

app.listen(PORT, () => {
  console.log(`[express] Listening PORT: ${PORT}`);
});
