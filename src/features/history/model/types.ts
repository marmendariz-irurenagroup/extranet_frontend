export type ExecutionStatusBackend = "IN_PROGRESS" | "OK" | "NOK" | "CANCELLED";

export type HistoryQuery = {
    machine?: string;
    mo?: string;
    ref?: string;
    status?: ExecutionStatusBackend;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
    includeLines?: boolean;
};

export type HistoryResponse = {
    total: number;
    limit: number;
    offset: number;
    results: HistoryItem[];
};

export type Machine = {
    id: number;
    code: string;
};

export type HistoryItem = {
    execution: {
        id: number;
        status: ExecutionStatusBackend;
        started_at: string;
        ended_at: string | null;
        scada_run_id: string;
    };
    revision: {
        id: number;
        revision: number;
        reference: string;
        description: string;
        quantity: string;
        fingerprint: string;
        created_at: string;
    };
    mo: {
        series: string;
        number: string;
        line: number;
        created_at: string;
    };
    lines?: LineExecutionSummary[];
    machines?: Machine[];
};

export type LineExecutionSummary = {
    id: number;
    machine: string;
    order: number | null;
    raw_material_code: string;
    raw_material_description: string;
    raw_material_quantity: number;
    line_type: string;
    ok: boolean | null;
    started_at: string | null;
    ended_at: string | null;
    actual: Record<string, unknown>;
};

export type Execution = {
    id: number;
    machines: Machine[];
    mo: string;
    reference: string;
    description: string;
    startedAt: string;
    endedAt?: string;
    result: "OK" | "NOK" | "EN_CURSO" | "CANCELADA";
};

// ✅ Respuesta del endpoint de detalle
export type HistoryDetailResponse = {
    execution: HistoryItem["execution"];
    revision: HistoryItem["revision"];
    mo: HistoryItem["mo"];
    machines: Machine[];
    lines: LineExecutionSummary[];
};
