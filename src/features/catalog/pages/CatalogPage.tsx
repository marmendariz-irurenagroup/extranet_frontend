import { useEffect, useState } from "react";
import { type Product, type PriceRange, type CatalogFilters } from "../model/types";
import { getCatalog } from "../api/catalog.api";


export const CatalogPage = () => {
    const [catalog, setCatalog] = useState<Product[]>([]);
    const [filters, setFilters] = useState<CatalogFilters>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar el estado de las máquinas al cargar la página.
    useEffect(() => {
        let alive = true;

        async function load() {
            try {
                setLoading(true);
                const data = await getCatalog(filters);
                if (alive) setCatalog(data);
            } catch (e: any) {
                if (alive) setError(e?.message ?? "Error cargando estado de máquinas");
            } finally {
                if (alive) setLoading(false);
            }
        }

        load();

        return () => {
            alive = false;
        };
    }, []);

    return (
        <div className="space-y-4">
            {/* Título + filtros */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Catálogo</h2>
                    <p className="text-sm text-neutral-400">
                        Listado de productos disponibles.
                    </p>
                </div>
            </div>

            {/* Estados */}
            {loading ? (
                <div className="flex items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/30 p-6 text-sm text-neutral-300">
                    Cargando productos...
                </div>
            ) : error ? (
                <div className="rounded-sm border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                    {error}
                </div>
            ) : null}

            {/* Si no hay filtros seleccionados */}
            {catalog.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center p-4 text-sm text-neutral-300">
                    No se ha encontrado ningún producto.
                </div>
            ) : null}

            {/* Tabla de máquinas */}
            {!loading && !error && catalog.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 items-stretch md:grid-cols-2 lg:grid-cols-3">
                    {catalog.map((m) => {
                        return (
                            <section key={m.product_code}
                                className="rounded-sm border border-neutral-800 bg-neutral-900/40 p-4 flex h-full flex-col"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-medium">{m.product_code}</h3>
                                    </div>
                                </div>
                            </section>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
};
