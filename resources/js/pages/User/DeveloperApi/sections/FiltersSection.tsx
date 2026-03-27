import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal } from 'lucide-react';
import { Panel, SelectField } from '../components';
import type { ApiModel } from '../types';

type FilterData = {
    days: number;
    date_from: string;
    date_to: string;
    model: string;
    status: string;
};

type Props = {
    data: FilterData;
    models: ApiModel[];
    onChange: <K extends keyof FilterData>(key: K, value: FilterData[K]) => void;
    onApply: () => void;
};

export function FiltersSection({ data, models, onChange, onApply }: Props) {
    return (
        <Panel
            title="Filters"
            description="Narrow results by time range, model, and status."
            action={
                <Button size="sm" onClick={onApply} className="gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Apply
                </Button>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Quick Range (days)
                    </label>
                    <Input
                        type="number"
                        min={1}
                        max={365}
                        value={data.days}
                        onChange={(e) => onChange('days', Number(e.target.value))}
                        className="h-9"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        From
                    </label>
                    <Input
                        type="date"
                        value={data.date_from}
                        onChange={(e) => onChange('date_from', e.target.value)}
                        className="h-9"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        To
                    </label>
                    <Input
                        type="date"
                        value={data.date_to}
                        onChange={(e) => onChange('date_to', e.target.value)}
                        className="h-9"
                    />
                </div>
                <SelectField
                    label="Model"
                    value={data.model}
                    onChange={(v) => onChange('model', v)}
                >
                    <option value="">All models</option>
                    {models.map((m) => (
                        <option key={m.id} value={m.public_id}>
                            {m.public_id}
                        </option>
                    ))}
                </SelectField>
                <SelectField
                    label="Status"
                    value={data.status}
                    onChange={(v) => onChange('status', v)}
                >
                    <option value="">All statuses</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                </SelectField>
            </div>
        </Panel>
    );
}
