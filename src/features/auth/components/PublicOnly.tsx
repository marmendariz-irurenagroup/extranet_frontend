import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PublicOnly({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isBootstrapping } = useAuth();

    if (isBootstrapping) {
        return (
            <div className="min-h-dvh grid place-items-center bg-neutral-950 text-neutral-200">
                <div className="text-sm opacity-80">Cargando...</div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
