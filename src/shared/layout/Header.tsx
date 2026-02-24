import { useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useMe } from "../../features/auth/hooks/useMe";

type Props = {
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
};

export default function Header({ sidebarOpen, onToggleSidebar }: Props) {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { me } = useMe();

    const onLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/70 backdrop-blur">
            <div className="flex h-14 w-full items-center gap-3 px-3 lg:px-6">
                <button
                    onClick={onToggleSidebar}
                    aria-label="Abrir/cerrar menú"
                    className="inline-flex h-10 w-8 items-center bg-neutral-950/40 text-neutral-200"
                >
                    {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                <div className="font-semibold tracking-tight">Irurena Group</div>

                <div className="ml-auto flex items-center gap-2">
                    <span className="hidden sm:inline-flex px-3 py-1 text-xs text-neutral-300">
                        {me?.user ?? me?.email ?? "usuario"}
                    </span>

                    <button
                        onClick={onLogout}
                        aria-label="Cerrar sesión"
                        title="Cerrar sesión"
                        className="inline-flex h-10 w-8 items-center justify-end bg-neutral-950/40 text-neutral-300"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
}
