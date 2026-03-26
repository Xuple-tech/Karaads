// @/components/Admin/BulkActions.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

const BulkActions = ({ onActivate, onDeactivate, onDelete }) => {
    return (
        <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onActivate}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate
            </Button>
            <Button variant="outline" size="sm" onClick={onDeactivate}>
                <XCircle className="h-4 w-4 mr-2" />
                Deactivate
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
            </Button>
        </div>
    );
};

export default BulkActions;
