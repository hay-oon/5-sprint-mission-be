import {
  createArticleComment,
  createProductComment,
  getArticleComments,
  getProductComments,
  updateComment,
  deleteComment,
} from "./commentService.js";

const createArticleCommentController = async (req, res) => {
  try {
    const { content } = req.body;
    const { articleId } = req.params;
    const comment = await createArticleComment(content, articleId);
    res.status(201).send(comment);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};

const createProductCommentController = async (req, res) => {
  try {
    const { content } = req.body;
    const { productId } = req.params;
    const comment = await createProductComment(content, productId);
    res.status(201).send(comment);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};

const getArticleCommentsController = async (req, res) => {
  try {
    const { cursor } = req.query;
    const { articleId } = req.params;
    const result = await getArticleComments(articleId, cursor);
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getProductCommentsController = async (req, res) => {
  try {
    const { cursor } = req.query;
    const { productId } = req.params;
    const result = await getProductComments(productId, cursor);
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const updateCommentController = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const comment = await updateComment(id, content);
    res.status(200).send(comment);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "Comment not found" });
    }
    res.status(500).send({ message: err.message });
  }
};

const deleteCommentController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteComment(id);
    res.status(200).send({ message: "Comment deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "Comment not found" });
    }
    res.status(500).send({ message: err.message });
  }
};

export {
  createArticleCommentController as createArticleComment,
  createProductCommentController as createProductComment,
  getArticleCommentsController as getArticleComments,
  getProductCommentsController as getProductComments,
  updateCommentController as updateComment,
  deleteCommentController as deleteComment,
};
