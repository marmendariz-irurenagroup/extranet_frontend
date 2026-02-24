import { httpClient } from "../../../services/httpClient";
import type { LoginRequest, LoginResponse, MeResponse } from "../model/types";

type RefreshResponse = { access: string; refresh?: string };

export const authApi = {
    login: (payload: LoginRequest) =>
        httpClient.post<LoginResponse>("/auth/token/", payload),

    refresh: (refresh: string) =>
        httpClient.post<RefreshResponse>("/auth/token/refresh/", { refresh }),

    me: () => httpClient.get<MeResponse>("/auth/me"),
};