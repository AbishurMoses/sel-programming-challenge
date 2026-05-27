import type { Symbol as SymbolData, SymbolValue } from "@/types/api";
import { DataTableComponent } from "./DataTableComponent";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { ArrowUpDown } from "lucide-react";
import { Card } from "./ui/card";
import { useSymbolPollingContext } from "@/context/SymbolPollingContext";

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
    } = useSymbolPollingContext();

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

    return (
        <Card className="w-full px-4">
            <DataTableComponent
                columns={columns}
                data={rows}
                onRowClick={(row) => onSymbolClick(row.symbolName)}
                startedPolling={pollingState}
                startPolling={(on) => (on ? startPolling() : stopPolling())}
            />
        </Card>
    );
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
            const secondsAgo = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
            const isStale = secondsAgo >= 30;
            const isInactive = secondsAgo >= 60;
            return isInactive ? (
                <p>Inactive</p>
            ) : isStale ? (
                <p>Stale</p>
            ) : (
                <p>Active</p>
            );
        },
    },
];
