import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface ErrorDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    message: string;
    status: number;
    suggestion?: string;
}
export default function ErrorDialog({
    open,
    onClose,
    title,
    message,
    status,
    suggestion,
}: ErrorDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{message}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-1 text-sm">
                    {status !== undefined && (
                        <p>
                            <span className="text-muted-foreground"></span> {status}
                        </p>
                    )}
                    {suggestion && (
                        <p>
                            <span className="text-muted-foreground"></span> {suggestion}
                        </p>
                    )}
                </div>
                <Button onClick={onClose}>Close</Button>
            </DialogContent>
        </Dialog>
    );
}
