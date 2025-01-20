import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import apiRoutes from "./routes/index.js";

dotenv.config();

const app = express();
const { DATABASE_URL, PORT } = process.env;

// CORS 설정
app.use(cors());

app.use(express.json());

// MongoDB 연결 설정 수정
mongoose
  .connect(DATABASE_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
