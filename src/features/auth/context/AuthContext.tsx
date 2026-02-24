import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth.api";
import type { User } from "../model/types";
import { tokenStorage } from "../../../services/tokenStorage";

type AuthContextValue = {
    user: User | null;
    token: string | null; // access token en memoria
    isAuthenticated: boolean;
    isBootstrapping: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(() => tokenStorage.getAccess());
    const [user, setUser] = useState<User | null>(null);
    const [isBootstrapping, setIsBootstrapping] = useState(true);

    const isAuthenticated = !!token;

    const logout = () => {
        tokenStorage.clearAll();
        setToken(null);
        setUser(null);
    };

    const refreshMe = async () => {
        const access = tokenStorage.getAccess();
        if (!access) {
            setUser(null);
            return;
        }
        const me = await authApi.me();
        setUser(me);
    };

    const login = async (email: string, password: string) => {
        const { access, refresh } = await authApi.login({ email, password });

        tokenStorage.setAccess(access);
        tokenStorage.setRefresh(refresh);
        setToken(access);

        // Cargar usuario
        const me = await authApi.me();
        setUser(me);
    };

    // Bootstrap: si hay access guardado, intentamos /me
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const storedAccess = tokenStorage.getAccess();
                if (!storedAccess) {
                    if (!cancelled) setUser(null);
                    return;
                }
                const me = await authApi.me();
                if (!cancelled) setUser(me);
            } catch {
                if (!cancelled) setUser(null);
            } finally {
                if (!cancelled) setIsBootstrapping(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            token,
            isAuthenticated,
            isBootstrapping,
            login,
            logout,
            refreshMe,
        }),
        [user, token, isAuthenticated, isBootstrapping]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider />");
    return ctx;
}
