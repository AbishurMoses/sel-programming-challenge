import { useState } from "react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogOut, RefreshCw } from "lucide-react";
import { apiService } from "@/services/apiService";
import { useSymbolPollingContext } from "@/context/SymbolPollingContext";

export default function ConnectionStatus() {
    const { pollOnce, connectionStatus, } = useSymbolPollingContext();
    const [connectionInfo] = useState({
        user: apiService.getCredentials()?.username || 'Unknown User',
        server: (apiService.getServerUrl().slice(0, apiService.getServerUrl().length - 7)) || 'Unknown Server',
    });

    const lastUpdated = new Date(Date.now() - 2000);
    async function logout() {
        apiService.clearToken();
        apiService.onUnauthorized?.();
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="flex justify-center">
                <CardTitle className="font-bold">Connection Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <Label>Status</Label>
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-pointer select-none">
                                    <span
                                        className={`h-3 w-3 rounded-full ${connectionStatus.isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                                            }`}
                                    />
                                    <p className="text-sm">
                                        {connectionStatus.isConnected ? "Connected" : "Disconnected"}
                                    </p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {connectionStatus.isConnected ? "Connected to the server" : "Disconnected from the server"}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Session</Label>
                    <div className="grid grid-cols-2 gap-y-1 text-sm">
                        <span className="text-muted-foreground">User</span>
                        <span>{connectionInfo.user}</span>
                        <span className="text-muted-foreground">Server</span>
                        <span>{connectionInfo.server}</span>
                        <span className="text-muted-foreground">Last updated</span>
                        <span>
                            {Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago
                        </span>
                    </div>
                </div>
            </CardContent>
            <CardAction className="flex justify-center w-full pt-6 gap-2">
                <Button variant="outline" onClick={() => pollOnce()}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                </Button>
                <Button variant="outline" onClick={() => logout()}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                </Button>
            </CardAction>
        </Card>
    );
}
