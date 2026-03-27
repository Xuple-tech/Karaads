export type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export type ApiKey = {
    id: string;
    name: string;
    key_prefix: string;
    is_active: boolean;
    notes?: string | null;
    expires_at?: string | null;
    allowed_model_ids: string[];
    last_used_at?: string | null;
    last_rotated_at?: string | null;
    usage_requests_count: number;
    usage_spend_usd: number;
};

export type ApiModel = {
    id: string;
    public_id: string;
    name: string;
    description?: string | null;
    model_type: 'text' | 'image';
    input_price_per_1m_tokens: string;
    output_price_per_1m_tokens: string;
    provider_input_price_per_1m_tokens?: string | null;
    provider_output_price_per_1m_tokens?: string | null;
    price_per_image_usd?: string | null;
    provider_price_per_image_usd?: string | null;
    max_context_tokens?: number | null;
    supports_reasoning: boolean;
    supports_streaming: boolean;
    is_active: boolean;
};

export type UsageRow = {
    id: string;
    request_id: string;
    status: string;
    endpoint: string;
    total_tokens: number;
    prompt_tokens?: number;
    completion_tokens?: number;
    cost_usd: number;
    created_at: string;
    is_estimated_tokens: boolean;
    api_key?: { id: string; name: string; key_prefix: string } | null;
    model?: { id: string; public_id: string; name: string } | null;
};

export type LedgerRow = {
    id: string;
    type: string;
    amount_usd: number;
    balance_after_usd: number;
    description?: string | null;
    external_reference?: string | null;
    created_at: string;
};

export type BreakdownRow = {
    model?: string | null;
    key_prefix?: string | null;
    status?: string;
    date?: string;
    requests: number;
    total_tokens?: number;
    cost_usd?: number;
};

export type KeyDraft = {
    name: string;
    notes: string;
    expires_at: string;
    allowed_model_ids: string[];
};

export type WalletData = {
    balance_usd: number;
    lifetime_credited_usd: number;
    lifetime_debited_usd: number;
    topups_usd: number;
    debits_usd: number;
};

export type StatsData = {
    requests: number;
    total_tokens: number;
    cost_usd: number;
    success_requests: number;
    error_requests: number;
};

export type BreakdownsData = {
    per_model: BreakdownRow[];
    per_key: BreakdownRow[];
    statuses: BreakdownRow[];
    ledger: {
        credits_usd: number;
        debits_usd: number;
        by_type: Array<{ type: string; entries: number; amount_usd: number }>;
    };
    trend: BreakdownRow[];
};

export type TopupConfig = {
    default_amount_usd: number;
    min_amount_usd: number;
    max_amount_usd: number;
    providers: string[];
    default_provider: 'stripe' | 'paystack';
};

export type Filters = {
    days: number;
    date_from?: string | null;
    date_to?: string | null;
    status?: string | null;
    model?: string | null;
    key_id?: string | null;
    ledger_type?: string | null;
    key_status?: string | null;
};

export type Section = 'overview' | 'keys' | 'usage' | 'billing' | 'models';

export type Props = {
    section: Section;
    wallet: WalletData;
    stats: StatsData;
    models: ApiModel[];
    apiBaseUrl: string;
    docsUrl: string;
    filters: Filters;
    // Section-specific — only provided by the relevant section controller
    breakdowns?: BreakdownsData;
    apiKeys?: Paginated<ApiKey>;
    usage?: Paginated<UsageRow>;
    ledger?: Paginated<LedgerRow>;
    topupConfig?: TopupConfig;
};

export type FlashProps = {
    console: {
        base_url: string;
        docs_base_url: string;
        uses_path_prefix: boolean;
    };
    flash?: {
        success?: string;
        error?: string;
        developer_plaintext_key?: string | null;
    };
};
