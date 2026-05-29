import type { Symbol as SymbolData, SymbolValue } from "@/types/api";
import { DataTableComponent } from "./DataTableComponent";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { ArrowUpDown } from "lucide-react";
import { Card } from "./ui/card";
import { useSymbolPollingContext } from "@/context/SymbolPollingContext";
import { statusGenerator } from "@/lib/utils";
import TableSkeleton from "./skeletons/DataTableSkeleton";
import ErrorDialog from "./ErrorDialog";
import { useEffect, useState } from "react";

interface SymbolsDashboardProps {
    onSymbolClick: (name: string) => void;
}

type SymbolRow = SymbolData & Partial<SymbolValue> & { symbolName: string };

export default function SymbolsDashboard({ onSymbolClick }: SymbolsDashboardProps) {
    const {
        symbols,
        symbolValues,
        pollingState,
        startPolling,
        stopPolling,
        loading,
        error,
        connectionStatus,
    } = useSymbolPollingContext();

    const [connectErrorOpen, setConnectErrorOpen] = useState(false);
    const [pollsErrorOpen, setPollsErrorOpen] = useState(false);

    useEffect(() => {
        if (!loading && symbols.length === 0 && connectionStatus.error) {
            setConnectErrorOpen(true);
        }
    }, [loading, symbols.length, connectionStatus.error]);

    useEffect(() => {
        if (error?.message === "All polls failed") setPollsErrorOpen(true);
    }, [error]);

    const rows: SymbolRow[] = symbols.map((s) => {
        const value = symbolValues.get(s.name);
        return {
            ...s,
            symbolName: s.name,
            stVal: value?.stVal,
            t: value?.t,
            lastUpdated: value?.lastUpdated,
            rawData: value?.rawData,
        };
    });

    if (loading && rows.length === 0) {
        return <TableSkeleton />
    }

    return (
        <>
            <Card className="w-full px-4">
                <DataTableComponent
                    columns={columns}
                    data={rows}
                    onRowClick={(row) => onSymbolClick(row.symbolName)}
                    startedPolling={pollingState}
                    startPolling={(on) => (on ? startPolling() : stopPolling())}
                />
            </Card>
            <ErrorDialog
                open={connectErrorOpen}
                onClose={() => setConnectErrorOpen(false)}
                title="Could not connect to the server"
                message={connectionStatus.error ?? "The dashboard could not reach the SEL server."}
                status={404}
                suggestion="Check your server URL and network connection, then sign in again."
            />
            <ErrorDialog
                open={pollsErrorOpen}
                onClose={() => setPollsErrorOpen(false)}
                title="Lost connection to data feed"
                message={error?.message ?? "All recent polls failed."}
                status={500}
                suggestion="Polling will keep retrying. If this persists, check the server status."
            />
        </>
    )
}

export const columns: ColumnDef<SymbolRow>[] = [
    {
        accessorKey: "symbolName",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Symbol Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "stVal",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Value
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const v = row.original.stVal;
            return <div>{v ?? "—"}</div>;
        },
    },
    {
        accessorKey: "t",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Timestamp
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div>{row.original.t ?? "—"}</div>,
    },
    {
        accessorKey: "lastUpdated",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Last Updated
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const lastUpdated = row.original.lastUpdated;
            if (!lastUpdated) return <div>—</div>;
            const secondsAgo = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
            return (
                <div >
                    {secondsAgo}s ago
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: () => (
            <Button variant="ghost">
                Status
            </Button>
        ),
        cell: ({ row }) => {
            const lastUpdated = row.original.lastUpdated;
            if (!lastUpdated) return <div>—</div>;
            return (
                <p>{statusGenerator(lastUpdated)}</p>
            )
        },
    },
];
