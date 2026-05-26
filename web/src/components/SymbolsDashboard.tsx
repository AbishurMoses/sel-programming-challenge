import type { SymbolValue } from "@/types/api";
import { DataTableComponent } from "./DataTableComponent";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { ArrowUpDown } from "lucide-react";
import { Card } from "./ui/card";
import { useEffect, useState } from "react";

interface SymbolsDashboardProps {
    onSymbolClick: () => void;
}

export default function SymbolsDashboard({ onSymbolClick }: SymbolsDashboardProps) {
    const [symbols, setSymbols] = useState<SymbolValue[]>([]);
    const [startedPolling, setStartedPolling] = useState(false);
    const [pollingInterval, setPollingInterval] = useState<number>(1000);

    useEffect(() => {
        if (!startedPolling) return;


        const fetchLatestMetrics = async () => {
            console.log("Hello from fetchLatestMetrics")
        };

        fetchLatestMetrics();
        const intervalId = setInterval(fetchLatestMetrics, pollingInterval);

        return () => {
            clearInterval(intervalId);
        };
    }, [startedPolling, pollingInterval]);

    return (
        <Card className="w-full px-4">
            <DataTableComponent columns={columns}
                data={symbols}
                onRowClick={onSymbolClick}
                startedPolling={startedPolling}
                startPolling={setStartedPolling} />
        </Card>
    )
}

export const columns: ColumnDef<SymbolValue>[] = [
    {
        accessorKey: "symbolName",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Symbol Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "stVal",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Value
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "t",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Timestamp
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "lastUpdated",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Last Updated
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        }, cell: ({ row }) => {
            const dateInSeconds = new Date(row.getValue("lastUpdated"))
            const sinceUpdate = `${Math.floor((Date.now() - dateInSeconds.getTime()) / 1000)}s ago`

            return <div>{sinceUpdate}</div>
        },
    },
    {
        accessorKey: "rawData.status",
        header: "Status - dropdown filter",
    },
]