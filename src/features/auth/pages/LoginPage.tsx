import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type LocationState = {
    from?: string;
};

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const from = (location.state as LocationState | null)?.from ?? "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(email.trim(), password);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err?.message ?? "No se pudo iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-dvh bg-neutral-950 text-neutral-100 grid place-items-center px-4">
            <div className="w-full max-w-sm border border-neutral-800 bg-neutral-900/80 backdrop-blur p-10">
                <h1 className="text-lg font-semibold tracking-tight">Iniciar sesión</h1>
                <p className="mt-1 text-xs text-neutral-400">
                    Accede con tus credenciales.
                </p>

                <form onSubmit={onSubmit} className="mt-5 space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs text-neutral-300">Correo electrónico</label>
                        <input
                            className="w-full border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            placeholder="Correo electrónico"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-neutral-300">Contraseña</label>
                        <input
                            className="w-full border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600 [color-scheme:dark]"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            autoComplete="current-password"
                            placeholder="•••••••••••"
                        />
                    </div>

                    {error && (
                        <div className="border border-red-900/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className={[
                            "w-full border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-100",
                            "hover:bg-neutral-900/70 disabled:opacity-60 disabled:cursor-not-allowed",
                        ].join(" ")}
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>

                    <p className="mt-4 text-xs text-neutral-500">
                        Si no recuerdas tu contraseña ponte en contacto con el equipo informático <code className="text-neutral-300">informatika@irurenagroup.com</code>.
                    </p>
                </form>
            </div>
        </div>
    );
}
