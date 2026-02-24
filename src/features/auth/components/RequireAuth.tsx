import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isBootstrapping } = useAuth();
    const location = useLocation();

    // Mientras resolvemos /me, no redirigimos aún
    if (isBootstrapping) {
        return (
            <div className="min-h-dvh grid place-items-center bg-neutral-950 text-neutral-200">
                <div className="text-sm opacity-80">Cargando sesión...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <>{children}</>;
}
