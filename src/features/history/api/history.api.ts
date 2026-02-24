import { httpClient } from "../../../services/httpClient";
import type { HistoryDetailResponse, HistoryQuery, HistoryResponse } from "../model/types";

// Construye querystring ignorando vacíos
function toQuery(params: Record<string, string | number | undefined>) {
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined) continue;
        const s = String(v).trim();
        if (!s) continue;
        searchParams.set(k, s);
    }
    const qs = searchParams.toString();
    return qs ? `?${qs}` : "";
}

export async function getHistory(q: HistoryQuery = {}): Promise<HistoryResponse> {
    const qs = toQuery({
        machine: q.machine,
        mo: q.mo,
        ref: q.ref,
        status: q.status,
        from: q.from,
        to: q.to,
        limit: q.limit ?? 200,
        offset: q.offset ?? 0,
    });

    return httpClient.get<HistoryResponse>(`/production-history${qs}`);
}

/**
 * Detalle de ejecución:
 * GET /production-history/:id/
 */
export async function getHistoryExecution(executionId: number): Promise<HistoryDetailResponse> {
    return httpClient.get<HistoryDetailResponse>(`/production-history/${executionId}/`);
}
