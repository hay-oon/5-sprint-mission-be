import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from "./articleService.js";

// 게시글 등록
const createArticleController = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).send({ message: "로그인이 필요합니다." });
    }

    const article = await createArticle(title, content, userId);
    res.status(201).send(article);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 게시글 목록 조회
const getArticlesController = async (req, res) => {
  try {
    const { page, limit, keyword, sortBy } = req.query;
    const result = await getArticles(page, limit, keyword, sortBy);
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

// 게시글 좋아요 추가
const addFavoriteController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // 인증 미들웨어를 통해 사용자 ID 가져오기

    if (!userId) {
      return res.status(401).send({ message: "로그인이 필요합니다." });
    }

    // 이미 좋아요를 누른 경우 체크
    const alreadyFavorite = await checkFavorite(id, userId);
    if (alreadyFavorite) {
      return res
        .status(400)
        .send({ message: "이미 좋아요를 누른 게시글입니다." });
    }

    const result = await addFavorite(id, userId);
    res.status(200).send(result);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
    }
    res.status(500).send({ message: err.message });
  }
};

// 게시글 좋아요 취소
const removeFavoriteController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // 인증 미들웨어를 통해 사용자 ID 가져오기

    if (!userId) {
      return res.status(401).send({ message: "로그인이 필요합니다." });
    }

    // 좋아요를 누르지 않은 경우 체크
    const hasFavorite = await checkFavorite(id, userId);
    if (!hasFavorite) {
      return res
        .status(400)
        .send({ message: "좋아요를 누르지 않은 게시글입니다." });
    }

    const result = await removeFavorite(id, userId);
    res.status(200).send(result);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "게시글을 찾을 수 없습니다." });
    }
    res.status(500).send({ message: err.message });
  }
};

// 게시글 좋아요 상태 확인
const checkFavoriteController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // 인증 미들웨어를 통해 사용자 ID 가져오기

    if (!userId) {
      return res.status(401).send({ message: "로그인이 필요합니다." });
    }

    const isFavorite = await checkFavorite(id, userId);
    res.status(200).send({ isFavorite });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export {
  createArticleController as createArticle,
  getArticleByIdController as getArticleById,
  updateArticleController as updateArticle,
  deleteArticleController as deleteArticle,
  getArticlesController as getArticles,
  addFavoriteController as addFavorite,
  removeFavoriteController as removeFavorite,
  checkFavoriteController as checkFavorite,
};
