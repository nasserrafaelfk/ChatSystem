import express from "express";
import proxy from "express-http-proxy";
import cors from "cors";
import { metricsEndpoint, metricsMiddleware } from "./metrics";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// @ts-ignore
app.use(metricsMiddleware);

const auth = proxy("http://user-service:8081");
const messages = proxy("http://chat-service:8082");
const notifications = proxy("http://notification-service:8083");

app.use("/api/auth", auth);
app.use("/api/messages", messages);
app.use("/api/notifications", notifications);
app.get('/metrics', metricsEndpoint);

const server = app.listen(8080, () => {
  console.log("Gateway is Listening to Port 8080");
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  console.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);