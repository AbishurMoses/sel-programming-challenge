import { Loader2 } from "lucide-react"

export default function FullPageSkeleton({message}: {message: string}) {
    return (
        <div className="fixed flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium">
                {message}
            </p>
        </div>
    )
}