export type User = {
    id: string;
    email: string;
    user?: string; // si tu backend devuelve "user" como nombre, opcional
    roles?: string[]; // ej: ["admin", "operator"]
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    access: string;
    refresh: string;
};

export type MeResponse = User;
