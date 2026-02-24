import { httpClient } from "../../../services/httpClient";
import type { Product, CatalogFilters } from "../model/types";

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


export async function getCatalog(q: CatalogFilters): Promise<Product[]> {
    const qs = toQuery({
        client: q.client,
        product_code: q.product_code ?? undefined,
        product_description: q.product_description ?? undefined,
        category: q.category ?? undefined,
    });

    return httpClient.get<Product[]>(`/catalog${qs}`);
}
