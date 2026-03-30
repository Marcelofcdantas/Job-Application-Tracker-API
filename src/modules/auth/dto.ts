export interface RegisterDTO {
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RefreshDTO {
  refreshToken: string;
}

export interface ResetRequestDTO {
  email: string;
  mode?: "link" | "temp";
}

export interface ResetConfirmDTO {
  token: string;
  newPassword: string;
}
