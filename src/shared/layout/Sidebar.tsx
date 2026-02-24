import { NavLink } from "react-router-dom";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function Sidebar({ open, onClose }: Props) {
    return (
        <>
            {/* Overlay SOLO móvil */}
            <div
                onClick={onClose}
                className={[
                    "fixed inset-0 top-14 z-20 bg-black/50 transition-opacity lg:hidden",
                    open ? "opacity-100" : "pointer-events-none opacity-0",
                ].join(" ")}
            />

            <aside
                className={[
                    "z-30 border-r border-neutral-800 bg-neutral-950/95 p-4 backdrop-blur overflow-y-auto",
                    "fixed left-0 top-14 w-72 transition-transform lg:transition-none",
                    "h-[calc(100dvh-3.5rem)]",
                    open ? "translate-x-0" : "-translate-x-full",
                    "lg:sticky lg:top-14 lg:w-72 lg:flex-shrink-0",
                    open ? "lg:block" : "lg:hidden",
                ].join(" ")}
            >
                <nav className="space-y-2">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            [
                                "block px-3 py-2 text-sm",
                                isActive
                                    ? "border-neutral-600 bg-neutral-900 text-neutral-100"
                                    : "text-neutral-300 hover:bg-neutral-900/60",
                            ].join(" ")
                        }
                    >
                        Catálogo
                    </NavLink>
                    <NavLink
                        to="/history"
                        end
                        className={({ isActive }) =>
                            [
                                "block px-3 py-2 text-sm",
                                isActive
                                    ? "border-neutral-600 bg-neutral-900 text-neutral-100"
                                    : "text-neutral-300 hover:bg-neutral-900/60",
                            ].join(" ")
                        }
                    >
                        Pedidos
                    </NavLink>
                    <NavLink
                        to="/tintometrics"
                        end
                        className={({ isActive }) =>
                            [
                                "block px-3 py-2 text-sm",
                                isActive
                                    ? "border-neutral-600 bg-neutral-900 text-neutral-100"
                                    : "text-neutral-300 hover:bg-neutral-900/60",
                            ].join(" ")
                        }
                    >
                        Tintométricos
                    </NavLink>

                    {/* <a
                        className="block rounded-sm border border-neutral-800 bg-neutral-900/30 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900/60"
                        href="#"
                    >
                        Ajustes (placeholder)
                    </a> */}
                </nav>
            </aside>
        </>
    );
}
