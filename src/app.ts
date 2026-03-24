import express from "express";
import router from "./routes";
import "dotenv/config";


const app = express();

app.use(express.json());
app.use(router);

export default app;