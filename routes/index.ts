import express, { Router } from "express";
import productRoutes from "./products/index.js";
import articleRoutes from "./articles/index.js";
import commentRoutes from "./comments/index.js";
import authRoutes from "./auth/index.js";

const router: Router = express.Router();

router.use("/products", productRoutes);
router.use("/articles", articleRoutes);
router.use("/", commentRoutes);
router.use("/auth", authRoutes);

export default router;
