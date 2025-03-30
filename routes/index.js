import express from "express";
import productRoutes from "./products/productRoutes.js";
import articleRoutes from "./articles/articleRoutes.js";
import commentRoutes from "./comments/commentRoutes.js";
import authRoutes from "./auth/authRoutes.js";

const router = express.Router();

router.use("/products", productRoutes);
router.use("/articles", articleRoutes);
router.use("/", commentRoutes);
router.use("/auth", authRoutes);

export default router;
