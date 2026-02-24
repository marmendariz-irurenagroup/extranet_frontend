import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { HistoryDetailResponse, LineExecutionSummary } from "../model/types";
import { getHistoryExecution } from "../api/history.api";

function formatDate(iso?: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString();
}

function lineTypeLabel(t: LineExecutionSummary["line_type"]) {
    switch (t) {
        case "DOSING":
            return "Dosificación";
        case "AGITATION":
            return "Agitación";
        case "TEXT":
            return "Texto";
        case "UNKNOWN":
        default:
            return "Desconocido";
    }
}

function okBadge(ok: boolean | null) {
    if (ok === true) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    if (ok === false) return "border-red-500/30 bg-red-500/10 text-red-200";
    return "border-neutral-700 bg-neutral-900/30 text-neutral-300";
}

export const HistoryDetailPage = () => {
    const { id } = useParams();
    const executionId = Number(id);

    const [searchParams] = useSearchParams();
    const backQuery = useMemo(() => {
        const qs = searchParams.toString();
        return qs ? `?${qs}` : "";
    }, [searchParams]);

    const [data, setData] = useState<HistoryDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;

        async function run() {
            try {
                setLoading(true);
                setError(null);

                if (!Number.isFinite(executionId)) {
                    throw new Error("ID inválido");
                }

                const resp = await getHistoryExecution(executionId);
                if (!alive) return;
                setData(resp);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message ?? "Error cargando detalle");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        }

        run();
        return () => {
            alive = false;
        };
    }, [executionId]);

    if (loading) {
        return (
            <div className="rounded-sm border border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-400">
                Cargando detalle…
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-3">
                <div className="text-sm text-red-200">{error}</div>
                <Link
                    to={`/history${backQuery}`}
                    className="inline-flex h-9 items-center rounded-sm border border-neutral-800 bg-neutral-900/30 px-3 text-sm text-neutral-200 hover:bg-neutral-900/60"
                >
                    Volver
                </Link>
            </div>
        );
    }

    if (!data) return null;

    const ex = data.execution;
    const rev = data.revision;
    const mo = data.mo;

    const statusLabel =
        ex.status === "OK"
            ? "OK"
            : ex.status === "NOK"
                ? "NOK"
                : ex.status === "CANCELLED"
                    ? "CANCELADA"
                    : "EN CURSO";

    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold">Detalle de ejecución</h2>
                    <p className="text-sm text-neutral-400">
                        OF {mo.series}/{mo.number} · {rev.reference}
                    </p>
                </div>

                <Link
                    to={`/history${backQuery}`}
                    className="inline-flex h-9 items-center rounded-sm border border-neutral-800 bg-neutral-900/30 px-3 text-sm text-neutral-200 hover:bg-neutral-900/60"
                >
                    Volver
                </Link>
            </div>

            {/* Resumen */}
            <section className="rounded-sm border border-neutral-800 bg-neutral-900/40">
                <div className="border-b border-neutral-800 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-medium text-neutral-200">
                            Ejecución #{ex.id}
                        </div>

                        <span className="rounded-full border border-neutral-800 bg-neutral-950/30 px-2 py-1 text-[11px] font-semibold text-neutral-200">
                            {statusLabel}
                        </span>
                    </div>

                    <div className="mt-2 text-xs text-neutral-400">
                        {rev.description}
                    </div>

                    <div className="mt-2 text-xs text-neutral-500">
                        Inicio: {formatDate(ex.started_at)} · Fin: {formatDate(ex.ended_at)} · SCADA:{" "}
                        {ex.scada_run_id || "—"}
                    </div>
                </div>

                {/* Máquinas */}
                <div className="p-3">
                    <div className="text-sm font-medium text-neutral-200">Máquinas</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {data.machines.length === 0 ? (
                            <span className="text-[11px] text-neutral-500">Sin máquinas</span>
                        ) : (
                            data.machines.map((m) => (
                                <span
                                    key={m.id}
                                    className="rounded-full border border-neutral-800 bg-neutral-950/30 px-2 py-0.5 text-[11px] text-neutral-200"
                                >
                                    {m.code}
                                </span>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Líneas */}
            <section className="rounded-sm border border-neutral-800 bg-neutral-900/40">
                <div className="flex items-center justify-between border-b border-neutral-800 p-3">
                    <div className="text-sm font-medium text-neutral-200">Líneas</div>
                    <div className="text-xs text-neutral-400">{data.lines.length}</div>
                </div>

                {data.lines.length === 0 ? (
                    <div className="p-4 text-sm text-neutral-400">No hay líneas.</div>
                ) : (
                    <ul className="divide-y divide-neutral-800">
                        {data.lines.map((l) => (
                            <li key={l.id} className="p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-neutral-100">
                                            {l.order ?? "—"} · {l.machine} · {lineTypeLabel(l.line_type)}
                                        </div>
                                        <div className="mt-1 text-xs text-neutral-500">
                                            Inicio: {formatDate(l.started_at)} · Fin: {formatDate(l.ended_at)}
                                        </div>

                                        {/* actual (compacto) */}
                                        <details className="mt-2">
                                            <summary className="cursor-pointer text-xs text-neutral-400 hover:text-neutral-200">
                                                Ver datos (actual)
                                            </summary>
                                            <pre className="mt-2 overflow-auto rounded-sm border border-neutral-800 bg-neutral-950/40 p-2 text-[11px] text-neutral-200">
                                                {JSON.stringify(l.actual ?? {}, null, 2)}
                                            </pre>
                                        </details>
                                    </div>

                                    <span
                                        className={[
                                            "shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold",
                                            okBadge(l.ok),
                                        ].join(" ")}
                                    >
                                        {l.ok === true ? "OK" : l.ok === false ? "NOK" : "—"}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};
