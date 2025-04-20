/**
 * 400 Bad Request - 사용자의 잘못된 요청으로 인한 에러
 * @param {string} message - 에러 메시지
 */
export const badRequestError = (message) => {
    const error = new Error(message || "잘못된 요청입니다.");
    error.statusCode = 400;
    return error;
};
/**
 * 404 Not Found - 요청한 리소스를 찾을 수 없음
 * @param {string} message - 에러 메시지
 */
export const notFoundError = (message) => {
    const error = new Error(message || "요청한 리소스를 찾을 수 없습니다.");
    error.statusCode = 404;
    return error;
};
/**
 * 500 Internal Server Error - 서버 내부 오류
 * @param {string} message - 에러 메시지
 */
export const serverError = (message) => {
    const error = new Error(message || "서버 오류가 발생했습니다.");
    error.statusCode = 500;
    return error;
};
/**
 * 에러 처리 미들웨어
 * Express의 에러 처리 미들웨어는 4개의 매개변수(err, req, res, next)를 가져야 합니다.
 */
export const errorHandler = (err, req, res, next) => {
    console.error("에러 발생:", err);
    // 상태 코드가 설정되어 있지 않으면 500으로 설정
    const statusCode = err.statusCode || 500;
    // 에러 응답 객체
    const errorResponse = {
        error: {
            message: err.message || "서버 오류가 발생했습니다.",
            status: statusCode,
        },
    };
    // 에러 응답 전송
    res.status(statusCode).json(errorResponse);
};
