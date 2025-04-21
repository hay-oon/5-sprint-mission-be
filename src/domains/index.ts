import express, { Router } from "express";
import productRoutes from "./products/index";
import articleRoutes from "./articles/index";
import commentRoutes from "./comments/index";
import authRoutes from "./auth/index";

const router: Router = express.Router();

router.use("/products", productRoutes);
router.use("/articles", articleRoutes);
router.use("/", commentRoutes);
router.use("/auth", authRoutes);

export default router;
