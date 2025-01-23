import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createArticleComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { articleId } = req.params;

    const comment = await prisma.comment.create({
      data: {
        content,
        articleId, /// productId는 자동으로 null이 됨
      },
      include: {
        article: true,
      },
    });
    res.status(201).send(comment);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};

const createProductComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { productId } = req.params;

    const comment = await prisma.comment.create({
      data: {
        content,
        productId, /// articleId는 자동으로 null이 됨
      },
      include: {
        product: true,
      },
    });
    res.status(201).send(comment);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};

const getArticleComments = async (req, res) => {
  try {
    const { cursor } = req.query;
    const { articleId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { articleId },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
      take: 10,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { createdAt: "desc" },
    });

    res.status(200).send({
      comments,
      ///다음 페이지 요청을 위해 마지막 댓글의 id를 nextCursor로 제공
      nextCursor:
        comments.length === 10 ? comments[comments.length - 1].id : null,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getProductComments = async (req, res) => {
  try {
    const { cursor } = req.query;
    const { productId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { productId },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
      take: 10,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { createdAt: "desc" },
    });

    res.status(200).send({
      comments,
      nextCursor:
        comments.length === 10 ? comments[comments.length - 1].id : null,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
    });
    res.status(200).send(comment);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "Comment not found" });
    }
    res.status(500).send({ message: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.comment.delete({ where: { id } });
    res.status(200).send({ message: "Comment deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "Comment not found" });
    }
    res.status(500).send({ message: err.message });
  }
};

export {
  createArticleComment,
  createProductComment,
  getArticleComments,
  getProductComments,
  updateComment,
  deleteComment,
};
