/**
 * 인증 및 권한 검증 관련 유틸리티 함수
 */
import { forbiddenError, notFoundError, unauthorizedError, } from "./errorHandler";
/**
 * 사용자 로그인 상태 확인 함수
 * @param userId 사용자 ID
 * @throws {Error} 로그인하지 않은 경우 401 에러
 */
export function checkAuthenticated(userId) {
    if (!userId) {
        throw unauthorizedError("로그인이 필요합니다.");
    }
}
/**
 * 리소스 소유권 확인 함수
 * @param resourceOwnerId 리소스 소유자 ID
 * @param currentUserId 현재 사용자 ID
 * @param resourceType 리소스 타입 (에러 메시지용)
 * @throws {Error} 소유자가 아닌 경우 403 에러
 */
export function checkOwnership(resourceOwnerId, currentUserId, resourceType = "리소스") {
    if (resourceOwnerId !== currentUserId) {
        throw forbiddenError(`이 ${resourceType}에 대한 권한이 없습니다.`);
    }
}
/**
 * 리소스 존재 여부 확인 함수
 * @param resource 리소스 객체
 * @param resourceType 리소스 타입 (에러 메시지용)
 * @throws {Error} 리소스가 존재하지 않는 경우 404 에러
 */
export function checkResourceExists(resource, resourceType = "리소스") {
    if (!resource) {
        throw notFoundError(`요청한 ${resourceType}를 찾을 수 없습니다.`);
    }
}
/**
 * 인증 및 소유권 확인 함수
 * @param resource 리소스 객체
 * @param currentUserId 현재 사용자 ID
 * @param ownerIdField 소유자 ID 필드명
 * @param resourceType 리소스 타입 (에러 메시지용)
 * @throws {Error} 인증되지 않았거나 권한이 없는 경우 에러
 */
export function verifyPermission(resource, currentUserId, ownerIdField = "userId", resourceType = "리소스") {
    // 인증 확인
    checkAuthenticated(currentUserId);
    // 리소스 존재 확인
    checkResourceExists(resource, resourceType);
    // 소유권 확인
    checkOwnership(resource[ownerIdField], currentUserId, resourceType);
}
