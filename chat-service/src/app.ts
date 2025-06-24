import express, { Express } from "express";
import userRouter from "./routes/messageRoutes";
import { errorConverter, errorHandler } from "./middleware";
import { metricsEndpoint, metricsMiddleware } from "./metrics";

const app: Express = express();

// @ts-ignore
app.use(metricsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(userRouter);

app.get("/metrics", metricsEndpoint);
app.use(errorConverter);
app.use(errorHandler);

export default app;