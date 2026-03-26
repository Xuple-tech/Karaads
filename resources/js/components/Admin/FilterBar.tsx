import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';

const FilterBar = ({
    filters = [],
    onFilter,
    onReset,
    searchable = true
}) => {
    const { data, setData, get, reset } = useForm({
        search: '',
        ...Object.fromEntries(filters.map(f => [f.name, '']))
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        get(window.location.pathname, {
            preserveState: true,
            data
        });
    };

    const handleReset = () => {
        reset();
        onReset?.();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                {searchable && (
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    {filters.map((filter) => {
                        // Only render Select if filter has options (dropdown type)
                        if (filter.options && Array.isArray(filter.options)) {
                            return (
                                <div key={filter.name} className="w-full md:w-auto">
                                    <Select
                                        value={data[filter.name] || ''}
                                        onValueChange={(value) => setData(filter.name, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={filter.placeholder} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filter.options.map((option) => (
                                                <SelectItem key={option.value} value={option.value == "" ? "1" : option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            );
                        }

                        // For other filter types (date, number, etc.), render Input
                        if (filter.type === 'date' || filter.type === 'number') {
                            return (
                                <div key={filter.name} className="w-full md:w-auto">
                                    <Input
                                        type={filter.type}
                                        placeholder={filter.placeholder}
                                        value={data[filter.name] || ''}
                                        onChange={(e) => setData(filter.name, e.target.value)}
                                        step={filter.step}
                                        min={filter.min}
                                        max={filter.max}
                                    />
                                </div>
                            );
                        }

                        return null;
                    })}

                    <Button type="submit" variant="default">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>

                    <Button type="button" variant="outline" onClick={handleReset}>
                        <X className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default FilterBar;
