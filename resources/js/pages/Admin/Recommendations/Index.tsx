import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Brain, History, Layers3, RotateCcw, SlidersHorizontal, Tags } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';

interface RecoConfig {
    id: string;
    entity_type: 'ad' | 'post';
    surface: 'feed' | 'moments' | 'profile';
    slot: string | null;
    is_active: boolean;
    rollout_mode: 'rules_only' | 'canary' | 'big_bang';
    canary_percentage: number;
    weights: Record<string, number>;
    thresholds: Record<string, unknown>;
}

interface HistoryItem {
    id: string;
    entity_type: 'ad' | 'post';
    surface: 'feed' | 'moments' | 'profile';
    action: string;
    model_version: string | null;
    created_at: string;
}

interface CategoryStats {
    filters: {
        days: number;
        surface: 'all' | 'feed' | 'moments' | 'profile';
    };
    summary: {
        total_posts: number;
        categorized_posts: number;
        coverage_rate: number;
        avg_confidence: number;
        high_confidence_posts: number;
        low_confidence_posts: number;
    };
    top_categories: Array<{ category: string; total: number; avg_confidence: number }>;
}

export default function RecommendationConfigsPage({
    configs,
    history,
    categoryStats,
}: {
    configs: RecoConfig[];
    history: HistoryItem[];
    categoryStats: CategoryStats;
}) {
    const [localConfigs, setLocalConfigs] = useState<RecoConfig[]>(configs);
    const [days, setDays] = useState<number>(categoryStats.filters.days);
    const [surface, setSurface] = useState<'all' | 'feed' | 'moments' | 'profile'>(categoryStats.filters.surface);

    const groupedConfigs = useMemo(() => {
        return localConfigs.reduce<Record<string, RecoConfig[]>>((acc, cfg) => {
            const key = `${cfg.entity_type}:${cfg.surface}`;
            acc[key] = acc[key] ? [...acc[key], cfg] : [cfg];
            return acc;
        }, {});
    }, [localConfigs]);

    const updateWeight = (configId: string, key: string, value: string) => {
        setLocalConfigs((current) =>
            current.map((config) =>
                config.id === configId
                    ? {
                          ...config,
                          weights: {
                              ...config.weights,
                              [key]: Number(value),
                          },
                      }
                    : config,
            ),
        );
    };

    const updateRolloutMode = (configId: string, value: RecoConfig['rollout_mode']) => {
        setLocalConfigs((current) =>
            current.map((config) =>
                config.id === configId
                    ? {
                          ...config,
                          rollout_mode: value,
                      }
                    : config,
            ),
        );
    };

    const updateCanary = (configId: string, value: string) => {
        const parsed = Number(value);
        setLocalConfigs((current) =>
            current.map((config) =>
                config.id === configId
                    ? {
                          ...config,
                          canary_percentage: Number.isFinite(parsed)
                              ? Math.max(0, Math.min(100, parsed))
                              : config.canary_percentage,
                      }
                    : config,
            ),
        );
    };

    const saveConfig = (config: RecoConfig) => {
        router.put(route('admin.v2.reco.configs.update', config.id), {
            is_active: config.is_active,
            rollout_mode: config.rollout_mode,
            canary_percentage: config.canary_percentage,
            weights: config.weights,
            thresholds: config.thresholds,
        });
    };

    const resetDefaults = () => {
        router.post(route('admin.v2.reco.configs.reset-defaults'));
    };

    const reloadCategoryStats = () => {
        router.get(route('admin.v2.reco.configs.page'), { days, surface }, { preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Recommendation Configs" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Recommendations"
                        title="Recommendation configs"
                        description="Tune rollout mode, canary percentage, and scoring weights for recommendation surfaces."
                        actions={
                            <Button variant="outline" onClick={resetDefaults}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reset defaults
                            </Button>
                        }
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <AdminMetricCard label="Configs" value={configs.length} hint="Total recommendation configurations" icon={SlidersHorizontal} />
                        <AdminMetricCard label="Groups" value={Object.keys(groupedConfigs).length} hint="Entity and surface groupings" icon={Layers3} />
                        <AdminMetricCard label="History entries" value={history.length} hint="Recent model actions recorded" icon={History} />
                    </div>

                    <AdminSection title="Model configs" description="Adjust rollout strategy and scoring weights per recommendation surface.">
                        <div className="space-y-6">
                            {Object.entries(groupedConfigs).map(([group, items]) => (
                                <AdminPanel key={group} title={group.replace(':', ' / ')} description="Save each configuration after updating rollout settings or weights.">
                                    <div className="space-y-6">
                                        {items.map((config) => (
                                            <div key={config.id} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                                <div className="mb-4 flex items-center justify-between gap-4">
                                                    <div>
                                                        <div className="font-medium text-foreground">Slot: {config.slot ?? 'default'}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {config.entity_type} on {config.surface}
                                                        </div>
                                                    </div>
                                                    <Button size="sm" onClick={() => saveConfig(config)}>
                                                        Save
                                                    </Button>
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-3">
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium">Rollout mode</p>
                                                        <Select value={config.rollout_mode} onValueChange={(value) => updateRolloutMode(config.id, value as RecoConfig['rollout_mode'])}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="rules_only">rules_only</SelectItem>
                                                                <SelectItem value="canary">canary</SelectItem>
                                                                <SelectItem value="big_bang">big_bang</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium">Canary percentage</p>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            value={config.canary_percentage}
                                                            onChange={(e) => updateCanary(config.id, e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="flex items-end">
                                                        <Button
                                                            variant={config.is_active ? 'default' : 'outline'}
                                                            onClick={() => {
                                                                setLocalConfigs((curr) =>
                                                                    curr.map((c) => (c.id === config.id ? { ...c, is_active: !c.is_active } : c)),
                                                                );
                                                            }}
                                                        >
                                                            {config.is_active ? 'Active' : 'Inactive'}
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <p className="mb-2 text-sm font-medium">Weights</p>
                                                    <div className="grid gap-3 md:grid-cols-4">
                                                        {Object.entries(config.weights || {}).map(([key, val]) => (
                                                            <div key={key}>
                                                                <p className="mb-1 text-xs text-muted-foreground">{key}</p>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={val}
                                                                    onChange={(e) => updateWeight(config.id, key, e.target.value)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AdminPanel>
                            ))}
                        </div>
                    </AdminSection>

                    <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
                        <AdminSection title="Category stats" description="Inspect classification coverage and top categories by time window and surface.">
                            <AdminPanel title="Category stats" description="Refresh the recommendation category summary using the selected filters.">
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-3">
                                        <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="7">7 days</SelectItem>
                                                <SelectItem value="30">30 days</SelectItem>
                                                <SelectItem value="90">90 days</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={surface} onValueChange={(value) => setSurface(value as 'all' | 'feed' | 'moments' | 'profile')}>
                                            <SelectTrigger className="w-[160px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">all</SelectItem>
                                                <SelectItem value="feed">feed</SelectItem>
                                                <SelectItem value="moments">moments</SelectItem>
                                                <SelectItem value="profile">profile</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button onClick={reloadCategoryStats}>Apply</Button>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">Total posts: {categoryStats.summary.total_posts}</div>
                                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">Coverage rate: {categoryStats.summary.coverage_rate}</div>
                                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">Avg confidence: {categoryStats.summary.avg_confidence}</div>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-sm font-medium">Top categories</p>
                                        <div className="space-y-2">
                                            {categoryStats.top_categories.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No categories</p>
                                            ) : (
                                                categoryStats.top_categories.map((item) => (
                                                    <div key={item.category} className="flex justify-between rounded-2xl border border-border/70 bg-muted/20 p-3">
                                                        <span>{item.category}</span>
                                                        <span>
                                                            {item.total} ({item.avg_confidence})
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </AdminPanel>
                        </AdminSection>

                        <AdminSection title="Recent model history" description="Recent recommendation model actions and rollout changes.">
                            <AdminPanel title="History" description="Use this for quick audit visibility into recent recommendation changes.">
                                <div className="space-y-2">
                                    {history.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No history yet.</p>
                                    ) : (
                                        history.map((item) => (
                                            <div key={item.id} className="flex justify-between rounded-2xl border border-border/70 bg-muted/20 p-3 text-sm">
                                                <span>
                                                    {item.entity_type}/{item.surface} - {item.action}
                                                </span>
                                                <span>{new Date(item.created_at).toLocaleString()}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </AdminPanel>
                        </AdminSection>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <AdminMetricCard label="Categorized posts" value={categoryStats.summary.categorized_posts} hint="Posts classified in the current window" icon={Tags} />
                        <AdminMetricCard label="High confidence" value={categoryStats.summary.high_confidence_posts} hint="Posts above the high-confidence threshold" icon={Brain} tone="success" />
                        <AdminMetricCard label="Low confidence" value={categoryStats.summary.low_confidence_posts} hint="Posts needing stronger classification confidence" icon={Brain} tone="warning" />
                    </div>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
