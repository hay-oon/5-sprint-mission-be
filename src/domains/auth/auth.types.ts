export interface UserData {
  email: string;
  nickname: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  nickname: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface User extends UserResponse {
  encryptedPassword: string;
}
