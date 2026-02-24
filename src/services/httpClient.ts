import { tokenStorage } from "./tokenStorage";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class HttpError extends Error {
    public status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.name = "HttpError";
    }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// evita múltiples refresh simultáneos
let refreshPromise: Promise<string> | null = null;

function safeJson(text: string): any {
    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
}

function extractMessage(res: Response, data: any) {
    return (data && (data.message || data.detail || data.error)) || res.statusText;
}

// request sin refresh (para no buclear)
async function rawFetch(
    method: HttpMethod,
    path: string,
    body?: unknown,
    accessOverride?: string | null
): Promise<Response> {
    const access = accessOverride ?? tokenStorage.getAccess();

    return fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
}

async function refreshAccessToken(): Promise<string> {
    const refresh = tokenStorage.getRefresh?.() ?? null; // asegúrate de tener getRefresh()
    if (!refresh) throw new HttpError(401, "No hay refresh token");

    const res = await rawFetch("POST", "/auth/token/refresh/", { refresh }, null);
    const text = await res.text();
    const data = text ? safeJson(text) : null;

    if (!res.ok) {
        throw new HttpError(res.status, extractMessage(res, data));
    }

    const access = data?.access as string | undefined;
    const newRefresh = data?.refresh as string | undefined;

    if (!access) throw new HttpError(500, "Refresh sin access token");

    tokenStorage.setAccess(access);
    // CLAVE con ROTATE_REFRESH_TOKENS=True
    if (newRefresh) tokenStorage.setRefresh(newRefresh);

    return access;
}

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
    // 1) intento normal
    let res = await rawFetch(method, path, body);
    let text = await res.text();
    let data = text ? safeJson(text) : null;

    // 2) 401 -> refresh + retry (excepto endpoints auth)
    if (res.status === 401) {
        const isAuthEndpoint =
            path.startsWith("/auth/token/") || path.startsWith("/auth/token/refresh/");

        if (!isAuthEndpoint) {
            try {
                if (!refreshPromise) {
                    refreshPromise = refreshAccessToken().finally(() => {
                        refreshPromise = null;
                    });
                }
                const newAccess = await refreshPromise;

                res = await rawFetch(method, path, body, newAccess);
                text = await res.text();
                data = text ? safeJson(text) : null;
            } catch (e) {
                tokenStorage.clearAll();
                throw e instanceof Error ? e : new HttpError(401, "No autorizado");
            }
        }
    }

    if (!res.ok) {
        throw new HttpError(res.status, extractMessage(res, data));
    }

    return data as T;
}

export const httpClient = {
    get: <T>(path: string) => request<T>("GET", path),
    post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
    put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
    patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
    del: <T>(path: string) => request<T>("DELETE", path),
};
