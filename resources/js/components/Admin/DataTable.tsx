import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Edit,
    Trash2,
    Eye,
    MoreVertical,
    CheckCircle,
    XCircle
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActionConfig {
    icon: React.ComponentType<{ className?: string }>;
    onClick: (item: any) => void;
    title: string;
    variant?: string;
    size?: string;
}

const DataTable = ({
    columns,
    data,
    onEdit,
    onDelete,
    onShow,
    actions = ['show', 'edit', 'delete'],
    pagination = null,
    selectable = false,
    selectedRows = [],
    onSelect,
    onSelectAll,
    emptyState
}: {
    columns: any[];
    data: any[];
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
    onShow?: (item: any) => void;
    actions?: (string | ActionConfig)[];
    pagination?: any;
    selectable?: boolean;
    selectedRows?: number[];
    onSelect?: (id: number) => void;
    onSelectAll?: () => void;
    emptyState?: {
        title: string;
        description: string;
        action?: React.ReactNode;
    };
}) => {
    const isCustomAction = (action: any): action is ActionConfig => {
        return typeof action === 'object' && 'icon' in action;
    };
    const renderCell = (item, column) => {
        if (column.render) {
            return column.render(item);
        }

        const value = item[column.key];

        // Special handling for common data types
        if (column.type === 'boolean') {
            return value ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
                <XCircle className="h-4 w-4 text-red-500" />
            );
        }

        if (column.type === 'date') {
            return new Date(value).toLocaleDateString();
        }

        if (column.type === 'datetime') {
            return new Date(value).toLocaleString();
        }

        if (column.type === 'badge') {
            return (
                <Badge variant={value === 'active' ? 'default' : 'secondary'}>
                    {value}
                </Badge>
            );
        }

        if (column.type === 'array' && Array.isArray(value)) {
            return (
                <div className="flex flex-wrap gap-1">
                    {value.slice(0, 3).map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                            {item}
                        </Badge>
                    ))}
                    {value.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{value.length - 3} more
                        </Badge>
                    )}
                </div>
            );
        }

        if (column.type === 'json') {
            return (
                <code className="text-xs bg-muted p-1 rounded">
                    {JSON.stringify(value).substring(0, 50)}...
                </code>
            );
        }

        return value;
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {selectable && (
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={data.length > 0 && selectedRows.length === data.length}
                                        onCheckedChange={onSelectAll}
                                    />
                                </TableHead>
                            )}
                            {columns.map((column) => (
                                <TableHead key={column.key}>
                                    {column.title}
                                </TableHead>
                            ))}
                            {actions.length > 0 && (
                                <TableHead className="w-[100px]">Actions</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((item) => (
                                <TableRow key={item.id}>
                                    {selectable && (
                                        <TableCell className="w-[50px]">
                                            <Checkbox
                                                checked={selectedRows.includes(item.id)}
                                                onCheckedChange={() => onSelect?.(item.id)}
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map((column) => (
                                        <TableCell key={column.key}>
                                            {renderCell(item, column)}
                                        </TableCell>
                                    ))}
                                    {actions.length > 0 && (
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {actions.map((action, index) => {
                                                        if (isCustomAction(action)) {
                                                            const Icon = action.icon;
                                                            return (
                                                                <DropdownMenuItem 
                                                                    key={index}
                                                                    onClick={() => action.onClick(item)}
                                                                >
                                                                    <Icon className="h-4 w-4 mr-2" />
                                                                    {action.title}
                                                                </DropdownMenuItem>
                                                            );
                                                        }

                                                        if (action === 'show' && onShow) {
                                                            return (
                                                                <DropdownMenuItem key={index} onClick={() => onShow(item)}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                            );
                                                        }
                                                        if (action === 'edit' && onEdit) {
                                                            return (
                                                                <DropdownMenuItem key={index} onClick={() => onEdit(item)}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            );
                                                        }
                                                        if (action === 'delete' && onDelete) {
                                                            return (
                                                                <DropdownMenuItem
                                                                    key={index}
                                                                    onClick={() => onDelete(item)}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + (actions.length > 0 ? 1 : 0) + (selectable ? 1 : 0)}
                                    className="h-24 text-center"
                                >
                                    {emptyState ? (
                                        <div className="py-8">
                                            <h3 className="text-lg font-semibold">{emptyState.title}</h3>
                                            <p className="text-muted-foreground mt-2">{emptyState.description}</p>
                                            {emptyState.action && (
                                                <div className="mt-4">
                                                    {emptyState.action}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        'No data available.'
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {pagination.from} to {pagination.to} of {pagination.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pagination.prevPageUrl && (window.location.href = pagination.prevPageUrl)}
                            disabled={!pagination.prevPageUrl}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pagination.nextPageUrl && (window.location.href = pagination.nextPageUrl)}
                            disabled={!pagination.nextPageUrl}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
