import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} from "./articleService.js";

// 게시글 등록
const createArticleController = async (req, res) => {
  try {
    const { title, content } = req.body;
    const article = await createArticle(title, content);
    res.status(201).send(article);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 게시글 목록 조회
const getArticlesController = async (req, res) => {
  try {
    const { page, pageSize, keyword } = req.query;
    const result = await getArticles(page, pageSize, keyword);
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 게시글 상세 조회
const getArticleByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await getArticleById(id);

    if (!article) {
      return res.status(404).send({ message: "Article not found" });
    }

    res.status(200).send(article);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 게시글 수정
const updateArticleController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const article = await updateArticle(id, title, content);
    res.status(200).send(article);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "Article not found" });
    }
    res.status(500).send({ message: err.message });
  }
};

// 게시글 삭제
const deleteArticleController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteArticle(id);
    res.status(200).send({ message: "Article deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "Article not found" });
    }
    res.status(500).send({ message: err.message });
  }
};

export {
  createArticleController as createArticle,
  getArticleByIdController as getArticleById,
  updateArticleController as updateArticle,
  deleteArticleController as deleteArticle,
  getArticlesController as getArticles,
};
