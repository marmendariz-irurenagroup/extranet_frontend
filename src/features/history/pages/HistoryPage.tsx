import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Execution, HistoryResponse } from "../model/types";
import { getHistory } from "../api/history.api";

const PAGE_SIZE = 25;

type Machine = { id: number; code: string };

function machineSortKey(code: string) {
    // Orden numérico por sufijo: M1, M2, ..., M10
    const m = code.match(/(\d+)$/);
    const n = m ? Number(m[1]) : Number.POSITIVE_INFINITY;
    return [n, code] as const;
}

function sortMachines(machines: Machine[]) {
    return [...machines].sort((a, b) => {
        const [na, ca] = machineSortKey(a.code ?? "");
        const [nb, cb] = machineSortKey(b.code ?? "");
        if (na !== nb) return na - nb;
        return ca.localeCompare(cb);
    });
}

export const HistoryPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [items, setItems] = useState<Execution[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);

    function getString(sp: URLSearchParams, key: string) {
        return sp.get(key) ?? "";
    }

    // Filtros desde URL
    const filterMachine = getString(searchParams, "machine");
    const filterMO = getString(searchParams, "mo");
    const filterRef = getString(searchParams, "ref");
    const dateFrom = getString(searchParams, "from"); // yyyy-mm-dd
    const dateTo = getString(searchParams, "to"); // yyyy-mm-dd

    const updateParam = (key: string, value: string) => {
        const next = new URLSearchParams(searchParams);
        if (!value) next.delete(key);
        else next.set(key, value);

        // ✅ al cambiar filtros, resetea paginación
        next.delete("offset");
        setSearchParams(next, { replace: true });
    };

    const clear = () => setSearchParams(new URLSearchParams(), { replace: true });

    // Offset desde URL (opcional, pero útil para compartir enlaces)
    useEffect(() => {
        const off = Number(searchParams.get("offset") ?? "0");
        setOffset(Number.isFinite(off) ? Math.max(0, off) : 0);
    }, [searchParams]);

    const backQuery = useMemo(() => {
        const qs = searchParams.toString();
        return qs ? `?${qs}` : "";
    }, [searchParams]);

    async function fetchPage(nextOffset: number, append: boolean) {
        try {
            if (append) setLoadingMore(true);
            else setLoading(true);

            setError(null);

            // backend espera ISO datetime (como ya hacías)
            const fromIso = dateFrom ? `${dateFrom}T00:00:00Z` : undefined;
            const toIso = dateTo ? `${dateTo}T23:59:59Z` : undefined;

            const resp: HistoryResponse = await getHistory({
                machine: filterMachine || undefined,
                mo: filterMO || undefined,
                ref: filterRef || undefined,
                from: fromIso,
                to: toIso,
                limit: PAGE_SIZE,
                offset: nextOffset,
                includeLines: false,
            });

            // map: 1 ejecución -> 1 fila
            const mapped: Execution[] = resp.results.map((item) => {
                const ex = item.execution;
                const rev = item.revision;
                const mo = item.mo;

                const result: Execution["result"] =
                    ex.status === "OK"
                        ? "OK"
                        : ex.status === "NOK"
                            ? "NOK"
                            : ex.status === "CANCELLED"
                                ? "CANCELADA"
                                : "EN_CURSO";

                const moText = `${mo.series}/${mo.number}`;

                // ✅ máquinas únicas por ejecución (y ordenadas)
                const machines = sortMachines(item.machines ?? []);

                return {
                    id: ex.id,
                    machines,
                    mo: moText,
                    reference: rev.reference,
                    description: rev.description,
                    startedAt: ex.started_at,
                    endedAt: ex.ended_at ?? undefined,
                    result,
                };
            });

            setTotal(resp.total);

            if (append) setItems((prev) => [...prev, ...mapped]);
            else setItems(mapped);
        } catch (e: any) {
            setError(e?.message ?? "Error cargando histórico");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }

    // ✅ refetch cuando cambien filtros (URL)
    useEffect(() => {
        fetchPage(offset, offset > 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterMachine, filterMO, filterRef, dateFrom, dateTo, offset]);

    function formatDate(iso?: string) {
        if (!iso) return "—";
        return new Date(iso).toLocaleString();
    }

    function badge(result: Execution["result"]) {
        switch (result) {
            case "OK":
                return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
            case "NOK":
                return "border-red-500/30 bg-red-500/10 text-red-200";
            case "CANCELADA":
                return "border-neutral-700 bg-neutral-800/50 text-neutral-200";
            case "EN_CURSO":
                return "border-amber-500/30 bg-amber-500/10 text-amber-200";
        }
    }

    const canLoadMore = items.length < total;

    const loadMore = () => {
        const nextOffset = items.length; // usamos length como offset real
        const next = new URLSearchParams(searchParams);
        next.set("offset", String(nextOffset));
        setSearchParams(next, { replace: true });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Histórico</h2>
                    <p className="text-sm text-neutral-400">
                        Histórico de pedidos realizados.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <input
                        className="h-9 w-28 rounded-sm border border-neutral-800 bg-neutral-950/40 px-3 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:ring-2 focus:ring-neutral-400/20"
                        placeholder="Máquina"
                        value={filterMachine}
                        onChange={(e) => updateParam("machine", e.target.value)}
                    />
                    <input
                        className="h-9 w-32 rounded-sm border border-neutral-800 bg-neutral-950/40 px-3 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:ring-2 focus:ring-neutral-400/20"
                        placeholder="OF"
                        value={filterMO}
                        onChange={(e) => updateParam("mo", e.target.value)}
                    />
                    <input
                        className="h-9 w-48 rounded-sm border border-neutral-800 bg-neutral-950/40 px-3 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:ring-2 focus:ring-neutral-400/20"
                        placeholder="Referencia / Descripción"
                        value={filterRef}
                        onChange={(e) => updateParam("ref", e.target.value)}
                    />

                    <input
                        type="date"
                        className="date-input h-9 rounded-sm border border-neutral-800 bg-neutral-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-neutral-400/20 [color-scheme:dark]"
                        value={dateFrom}
                        data-empty={dateFrom ? "false" : "true"}
                        onChange={(e) => updateParam("from", e.target.value)}
                    />

                    <input
                        type="date"
                        className="date-input h-9 rounded-sm border border-neutral-800 bg-neutral-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-neutral-400/20 [color-scheme:dark]"
                        value={dateTo}
                        data-empty={dateTo ? "false" : "true"}
                        onChange={(e) => updateParam("to", e.target.value)}
                    />

                    <button
                        type="button"
                        className="h-9 rounded-sm border border-neutral-800 bg-neutral-900/30 px-3 text-sm text-neutral-200 hover:bg-neutral-900/60"
                        onClick={clear}
                    >
                        Limpiar
                    </button>
                </div>
            </div>

            <section className="rounded-sm border border-neutral-800 bg-neutral-900/40">
                <div className="flex items-center justify-between gap-3 border-b border-neutral-800 p-3">
                    <div className="text-sm font-medium text-neutral-200">Resultados</div>
                    <div className="text-xs text-neutral-400">{loading ? "…" : `${items.length} / ${total}`}</div>
                </div>

                {loading && items.length === 0 ? (
                    <div className="flex items-center justify-center p-4 text-sm text-neutral-400">
                        Cargando histórico…
                    </div>
                ) : error ? (
                    <div className="p-4 text-sm text-red-200">{error}</div>
                ) : items.length === 0 ? (
                    <div className="flex items-center justify-center p-4 text-sm text-neutral-400">
                        No se han encontrado resultados.
                    </div>
                ) : (
                    <>
                        <ul className="divide-y divide-neutral-800">
                            {items.map((x) => (
                                <li key={String(x.id)}>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/history/${x.id}${backQuery}`)}
                                        className="group w-full text-left p-3 transition hover:bg-neutral-900/60"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-neutral-100">
                                                    OF {x.mo}
                                                </div>

                                                <div className="mt-1 text-xs text-neutral-400">
                                                    {x.reference} · {x.description}
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                    {x.machines.length === 0 ? (
                                                        <span className="text-[11px] text-neutral-500">Sin máquinas</span>
                                                    ) : (
                                                        x.machines.map((m) => (
                                                            <span
                                                                key={m.id}
                                                                className="rounded-full border border-neutral-800 bg-neutral-950/30 px-2 py-0.5 text-[11px] text-neutral-200"
                                                            >
                                                                {m.code}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>

                                                <div className="mt-2 text-xs text-neutral-500">
                                                    Inicio: {formatDate(x.startedAt)} · Fin: {formatDate(x.endedAt)}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={[
                                                        "shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold",
                                                        badge(x.result),
                                                    ].join(" ")}
                                                >
                                                    {x.result}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-center justify-center p-3">
                            <button
                                type="button"
                                disabled={!canLoadMore || loadingMore}
                                onClick={loadMore}
                                className={[
                                    "h-9 rounded-sm border px-3 text-sm",
                                    canLoadMore && !loadingMore
                                        ? "border-neutral-800 bg-neutral-900/30 text-neutral-200 hover:bg-neutral-900/60"
                                        : "border-neutral-900 bg-neutral-900/10 text-neutral-500 cursor-not-allowed",
                                ].join(" ")}
                            >
                                {loadingMore ? "Cargando…" : canLoadMore ? "Cargar más" : "No hay más"}
                            </button>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};
