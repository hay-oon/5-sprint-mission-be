import express from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "./commentController.js";

const router = express.Router();

router.post("/", createComment);
router.get("/", getComments);
router.patch("/:id", updateComment);
router.delete("/:id", deleteComment);

export default router;
