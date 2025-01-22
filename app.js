import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import apiRoutes from "./routes/index.js";

dotenv.config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Prisma 연결 테스트
prisma
  .$connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

app.use("/api", apiRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
