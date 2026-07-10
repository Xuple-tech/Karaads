import axiosInstance from '@/lib/axios';

export interface DeliveryCreative {
    id?: string;
    title?: string;
    description?: string;
    media_url?: string | null;
    media_type?: string | null;
    target_url?: string | null;
    external_payload?: Record<string, unknown> | null;
}

export interface DeliveryResponse {
    delivery_id: string | null;
    creative?: DeliveryCreative | null;
    render_mode?: string | null;
    tracking?: {
        signature?: string;
        session_id?: string;
    } | null;
    source_type?: string | null;
    status?: string | null;
    placement?: {
        surface?: string;
        slot?: string;
    } | null;
}

interface RequestAdDeliveriesParams {
    count: number;
    surface: 'feed' | 'moments' | 'profile';
    slot: string;
    sessionSeed: string;
    context?: Record<string, unknown>;
    viewer?: Record<string, unknown>;
    device?: Record<string, unknown>;
    cacheKey?: string;
    cacheTtlMs?: number;
    persistCache?: boolean;
    excludeDeliveryIds?: string[];
    allowCreativeRepeats?: boolean;
}

interface DeliveryCachePayload {
    expiresAt: number;
    items: DeliveryResponse[];
}

interface DeliveryBatchResponse {
    items?: DeliveryResponse[];
    count?: number;
}

const inMemoryDeliveryCache = new Map<string, DeliveryCachePayload>();
const CACHE_PREFIX = 'karaads:delivery-cache:';

function deliveryDedupKey(item: DeliveryResponse): string | null {
    const deliveryId = item?.delivery_id;
    if (deliveryId) {
        return `delivery:${deliveryId}`;
    }

    const creativeId = item?.creative?.id;
    if (creativeId) {
        return `creative:${creativeId}`;
    }

    return null;
}

function uniqueDeliveries(items: DeliveryResponse[]): DeliveryResponse[] {
    const seen = new Set<string>();
    const unique: DeliveryResponse[] = [];

    for (const item of items) {
        const dedupeKey = deliveryDedupKey(item);
        if (!dedupeKey || seen.has(dedupeKey)) {
            continue;
        }
        seen.add(dedupeKey);
        unique.push(item);
    }

    return unique;
}

function readDeliveryCache(cacheKey: string, persistCache: boolean): DeliveryCachePayload | null {
    const memory = inMemoryDeliveryCache.get(cacheKey);
    if (memory) {
        if (Date.now() <= memory.expiresAt) {
            return memory;
        }
        inMemoryDeliveryCache.delete(cacheKey);
    }

    if (!persistCache || typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = window.sessionStorage.getItem(`${CACHE_PREFIX}${cacheKey}`);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as DeliveryCachePayload;
        if (!parsed?.expiresAt || !Array.isArray(parsed?.items)) {
            window.sessionStorage.removeItem(`${CACHE_PREFIX}${cacheKey}`);
            return null;
        }

        if (Date.now() > parsed.expiresAt) {
            window.sessionStorage.removeItem(`${CACHE_PREFIX}${cacheKey}`);
            return null;
        }

        inMemoryDeliveryCache.set(cacheKey, parsed);
        return parsed;
    } catch {
        return null;
    }
}

function writeDeliveryCache(cacheKey: string, payload: DeliveryCachePayload, persistCache: boolean): void {
    inMemoryDeliveryCache.set(cacheKey, payload);

    if (!persistCache || typeof window === 'undefined') {
        return;
    }

    try {
        window.sessionStorage.setItem(`${CACHE_PREFIX}${cacheKey}`, JSON.stringify(payload));
    } catch {
        // Ignore storage quota and serialization issues.
    }
}

function toDeliveryItems(payload: DeliveryResponse | DeliveryBatchResponse | null): DeliveryResponse[] {
    if (!payload || typeof payload !== 'object') {
        return [];
    }

    if (Array.isArray((payload as DeliveryBatchResponse).items)) {
        return (payload as DeliveryBatchResponse).items ?? [];
    }

    return [payload as DeliveryResponse];
}

export async function requestAdDeliveries({
    count,
    surface,
    slot,
    sessionSeed,
    context,
    viewer,
    device,
    cacheKey,
    cacheTtlMs = 120_000,
    persistCache = false,
    excludeDeliveryIds = [],
    allowCreativeRepeats = false,
}: RequestAdDeliveriesParams): Promise<DeliveryResponse[]> {
    const requestedCount = Math.max(1, count);
    const now = Date.now();
    const cachedPayload = cacheKey ? readDeliveryCache(cacheKey, persistCache) : null;
    const cachedItems = cachedPayload?.items ?? [];
    const excludedDedupKeys = new Set<string>(excludeDeliveryIds.map((deliveryId) => `delivery:${deliveryId}`));
    const excludedCreativeIds = new Set<string>();

    const collected: DeliveryResponse[] = uniqueDeliveries(
        cachedItems.filter((item) => {
            const deliveryId = item.delivery_id || '';
            return deliveryId !== '' && !excludeDeliveryIds.includes(deliveryId);
        }),
    );
    for (const item of collected) {
        const dedupeKey = deliveryDedupKey(item);
        if (dedupeKey) {
            excludedDedupKeys.add(dedupeKey);
        }

        const creativeId = item?.creative?.id;
        if (creativeId && !allowCreativeRepeats) {
            excludedCreativeIds.add(creativeId);
        }
    }

    const maxAttempts = Math.max(4, Math.ceil(requestedCount / 4) + 2);
    let attempt = 0;
    let misses = 0;
    while (attempt < maxAttempts && collected.length < requestedCount) {
        attempt += 1;
        const neededCount = Math.max(1, requestedCount - collected.length);
        const batchCount = Math.min(10, neededCount);
        const response = await axiosInstance
            .post<DeliveryResponse | DeliveryBatchResponse>('/api/v2/ads/delivery/request', {
                count: batchCount,
                surface,
                slot,
                session_id: `${sessionSeed}-${now}-${attempt}`,
                context,
                viewer,
                device,
                allow_repeat_creative: allowCreativeRepeats ? true : undefined,
                ...(allowCreativeRepeats
                    ? {}
                    : { exclude_creative_ids: Array.from(excludedCreativeIds).slice(0, 100) }),
            })
            .then((res) => res.data)
            .catch(() => null);

        const items = toDeliveryItems(response);
        if (items.length === 0) {
            misses += 1;
            if (misses >= 3) {
                break;
            }
            continue;
        }

        let addedAny = false;
        for (const item of items) {
            if (!item?.delivery_id || !item?.creative) {
                continue;
            }

            const dedupeKey = deliveryDedupKey(item);
            if (!dedupeKey || excludedDedupKeys.has(dedupeKey)) {
                continue;
            }

            excludedDedupKeys.add(dedupeKey);
            const creativeId = item.creative?.id;
            if (creativeId && !allowCreativeRepeats) {
                excludedCreativeIds.add(creativeId);
            }
            collected.push(item);
            addedAny = true;

            if (collected.length >= requestedCount) {
                break;
            }
        }

        if (addedAny) {
            misses = 0;
            continue;
        }

        misses += 1;
        if (misses >= 3) {
            break;
        }
    }

    const merged = uniqueDeliveries(collected);
    if (cacheKey) {
        writeDeliveryCache(
            cacheKey,
            {
                expiresAt: now + Math.max(30_000, cacheTtlMs),
                items: merged.slice(0, 100),
            },
            persistCache,
        );
    }

    return merged.slice(0, requestedCount);
}

interface TrackAdEventParams {
    deliveryId?: string | null;
    eventType: 'impression' | 'view_start' | 'view_complete' | 'click' | 'dismiss' | 'conversion';
    sessionId?: string | null;
    signature?: string | null;
    idempotencyKey: string;
    meta?: Record<string, unknown>;
}

export function trackAdEvent({
    deliveryId,
    eventType,
    sessionId,
    signature,
    idempotencyKey,
    meta,
}: TrackAdEventParams): void {
    if (!deliveryId || !sessionId || !signature) {
        return;
    }

    axiosInstance
        .post('/api/v2/ads/events', {
            delivery_id: deliveryId,
            event_type: eventType,
            session_id: sessionId,
            signature,
            idempotency_key: idempotencyKey,
            meta,
        })
        .catch(() => {});
}
