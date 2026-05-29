import { toast } from "sonner";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";

export default function ConfirmDialog({ message, onConfirm, onCancel }: { message: string, onConfirm: () => void, onCancel: () => void }) {
    return (
        <Dialog open={true} onOpenChange={(open) => {
            if (!open) onCancel();
        }}>
            <DialogContent className="fixed top-1/2 left-1/2 p-4 rounded">
                <p>{message}</p>
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={onCancel} className="px-4 py-2 rounded" variant="ghost">
                        Cancel
                    </Button>
                    <Button onClick={() => {
                        onConfirm()
                        toast("CSV Exported", {
                            action: {
                                label: "X",
                                onClick: () => { },
                            },
                        })
                    }} className="px-4 py-2 rounded" variant="outline">
                        Confirm
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}