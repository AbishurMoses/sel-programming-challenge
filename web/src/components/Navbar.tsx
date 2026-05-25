import { useState } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LogOut, RefreshCw, Settings } from "lucide-react";
import UserMenu from "./UserMenu";
import { apiService } from "@/services/apiService";

export default function Navbar() {
    const [isConnected, setIsConnected] = useState(true);
    const [connectionInfo, setConnectionInfo] = useState({
        user: "testuser",
        server: "192.168.3.2"
    })
    const lastUpdated = new Date(Date.now() - 2000)

    async function logout() {
        apiService.clearToken()
        apiService.onUnauthorized?.()
    }

    return (
        <nav className="w-full h-16 flex items-center justify-between sticky top-0 z-50 border-b backdrop-blur px-4">
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
                <p className="text-sm text-muted-foreground">
                    Last updated: {Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago
                </p>
                <p>User: {connectionInfo.user}</p>
                <p>Server: {connectionInfo.server}</p>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <RefreshCw className="h-5 w-5 cursor-pointer transition" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Refresh</p>
                    </TooltipContent>
                </Tooltip>
                <Dialog>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Settings className="h-5 w-5 cursor-pointer transition" />
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Settings</p>
                        </TooltipContent>
                    </Tooltip>
                    <DialogContent className="w-full max-w-sm">
                        <UserMenu />
                    </DialogContent>
                </Dialog>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <LogOut onClick={() => logout()} className="h-5 w-5 cursor-pointer transition" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Logout</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </nav>
    )
}