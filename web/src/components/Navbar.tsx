import { useState } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import UserMenu from "./UserMenu";
import { Button } from "./ui/button";

export default function Navbar() {
    const [isConnected, setIsConnected] = useState(true);
    const [connectionInfo, setConnectionInfo] = useState({
        user: "testuser",
        server: "192.168.3.2"
    })

    return (
        <nav className="w-full h-16 flex items-center justify-between sticky top-0 z-50 w-full border-b backdrop-blur px-4">
            <div className="flex items-center gap-2">
                {isConnected ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Connected to the server</p>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="h-3 w-3 rounded-full bg-red-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Disconnected from the server</p>
                        </TooltipContent>
                    </Tooltip>)}
                <p>Industrial Data Monitor </p>
            </div>
            <div className="flex items-center gap-4">
                <p>User: {connectionInfo.user}</p>
                <p>Server: {connectionInfo.server}</p>
                <Dialog>
                    <DialogTrigger asChild>
                        <Settings className="h-5 w-5 cursor-pointer transition" />
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-sm">
                        <UserMenu />
                    </DialogContent>
                </Dialog>
            </div>
        </nav>
    )
}
export function ConnectionStatus() {
    const lastUpdated = new Date(Date.now() - 2000)


    return (
        <div className="flex items-center gap-2 p-4">
            <p>Last updated: {Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago</p>
            <Button>Refresh</Button>
            <Button>Logout</Button>
        </div>
    )
}