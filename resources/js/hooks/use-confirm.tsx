import { useCallback, useState, type ComponentType, type ReactNode } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ConfirmDialogProps = {
    onConfirm: () => void;
    children: ReactNode;
};

export function useConfirm(
    title: string,
    description: string,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
): [ComponentType<ConfirmDialogProps>, () => Promise<boolean>] {
    const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);

    const confirm = useCallback(() => {
        return new Promise<boolean>((resolve) => {
            setPromise({ resolve });
        });
    }, []);

    const handleClose = useCallback(() => {
        setPromise(null);
    }, []);

    const handleConfirm = useCallback(() => {
        promise?.resolve(true);
        handleClose();
    }, [promise, handleClose]);

    const handleCancel = useCallback(() => {
        promise?.resolve(false);
        handleClose();
    }, [promise, handleClose]);

    const ConfirmDialog = useCallback(({ onConfirm, children }: ConfirmDialogProps) => {
        const handleConfirmWithCallback = () => {
            handleConfirm();
            onConfirm();
        };

        return (
            <>
                {children}
                <AlertDialog open={promise !== null} onOpenChange={(open) => !open && handleCancel()}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{title}</AlertDialogTitle>
                            <AlertDialogDescription>{description}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={handleCancel}>{cancelText}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmWithCallback}>{confirmText}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        );
    }, [promise, handleConfirm, handleCancel, title, description, confirmText, cancelText]);

    return [ConfirmDialog, confirm];
}
