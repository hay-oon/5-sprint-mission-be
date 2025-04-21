import { Request, Response } from "express";
import {
  createArticleComment,
  createProductComment,
  getArticleComments,
  getProductComments,
  updateComment,
  deleteComment,
} from "./comment.service";
import { badRequestError, unauthorizedError } from "../../utils/errorHandler";

export const createArticleCommentController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { content } = req.body;
    const { articleId } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    if (!content) {
      throw badRequestError("댓글 내용을 입력해주세요.");
    }

    const comment = await createArticleComment(
      content,
      articleId,
      String(req.user.id)
    );

    return res.status(201).json(comment);
  } catch (error) {
    if (error instanceof Error) {
      return res
        .status(400)
        .json({
          message:
            error instanceof Error ? error.message : "오류가 발생했습니다",
        });
    }
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export const createProductCommentController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { content } = req.body;
    const { productId } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    if (!content) {
      throw badRequestError("댓글 내용을 입력해주세요.");
    }

    const comment = await createProductComment(
      content,
      productId,
      String(req.user.id)
    );

    return res.status(201).json(comment);
  } catch (error) {
    if (error instanceof Error) {
      return res
        .status(400)
        .json({
          message:
            error instanceof Error ? error.message : "오류가 발생했습니다",
        });
    }
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export const getArticleCommentsController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { articleId } = req.params;
    const { cursor } = req.query;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const comments = await getArticleComments(
      articleId,
      cursor as string | undefined,
      limit
    );

    return res.status(200).json(comments);
  } catch (error) {
    if (error instanceof Error) {
      return res
        .status(400)
        .json({
          message:
            error instanceof Error ? error.message : "오류가 발생했습니다",
        });
    }
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export const getProductCommentsController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { productId } = req.params;
    const { cursor } = req.query;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const comments = await getProductComments(
      productId,
      cursor as string | undefined,
      limit
    );

    return res.status(200).json(comments);
  } catch (error) {
    if (error instanceof Error) {
      return res
        .status(400)
        .json({
          message:
            error instanceof Error ? error.message : "오류가 발생했습니다",
        });
    }
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export const updateCommentController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!req.user) {
      throw unauthorizedError("로그인이 필요합니다.");
    }

    if (!content) {
      throw badRequestError("댓글 내용을 입력해주세요.");
    }

    const updatedComment = await updateComment(id, content, req.user.id);

    return res.status(200).json(updatedComment);
  } catch (error) {
    if (error instanceof Error) {
      return res
        .status(400)
        .json({
          message:
            error instanceof Error ? error.message : "오류가 발생했습니다",
        });
    }
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export const deleteCommentController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw unauthorizedError("로그인이 필요합니다.");
    }

    await deleteComment(id, req.user.id);

    return res.status(200).json({ message: "댓글이 삭제되었습니다." });
  } catch (error) {
    if (error instanceof Error) {
      return res
        .status(400)
        .json({
          message:
            error instanceof Error ? error.message : "오류가 발생했습니다",
        });
    }
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
