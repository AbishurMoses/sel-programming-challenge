import type { SymbolValue } from "@/types/api";
import { DataTableComponent } from "./DataTableComponent";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { ArrowUpDown } from "lucide-react";
import { Card } from "./ui/card";

export default function SymbolsDashboard() {
    return (
        <Card className="max-w-6xl">
            <DataTableComponent columns={columns} data={symbols} />
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

export const symbols: SymbolValue[] = [
    {
        symbolName: "AnalogDeadband",
        stVal: 42,
        t: "14:30:00",
        lastUpdated: new Date(),
        rawData: {
            status: "Active",
        },
    },
    {
        symbolName: "BinaryDebounce",
        stVal: 150,
        t: "14:29:58",
        lastUpdated: new Date(Date.now() - 2000),
        rawData: {
            status: "Active",
        },
    },
    {
        symbolName: "CommTimeout",
        stVal: 5000,
        t: "14:29:25",
        lastUpdated: new Date(Date.now() - 35000),
        rawData: {
            status: "Stale",
        },
    },
    {
        symbolName: "SystemTimer",
        stVal: 12458,
        t: "14:30:00",
        lastUpdated: new Date(),
        rawData: {
            status: "Active",
        },
    },
    {
        symbolName: "Symbol5",

        stVal: 78,
        t: "14:28:00",
        lastUpdated: new Date(Date.now() - 120000),
        rawData: {
            status: "Active",
        },
    },
    {
        symbolName: "Symbol6",
        stVal: 95,
        t: "14:27:30",
        lastUpdated: new Date(Date.now() - 150000),
        rawData: {
            status: "Stale",
        },
    },
]


// Top tab (with settings) will be in the navbar
// ┌───────────────────────────────────────────────────────────────────────────┐
// │ Industrial Data Monitor                                        [Settings] │
// ├───────────────────────────────────────────────────────────────────────────┤
// │ Connected | User: testuser | Server: 192.168.3.2                          │
// │ Last updated: 2 seconds ago                        [Refresh] [Logout]     │
// ├───────────────────────────────────────────────────────────────────────────┤
// │                                                                           │
// │ [Search symbols...]                                  [Start Polling] [2s] │
// │                                                                           │
// │ ┌───────────────────────────────────────────────────────────────────────┐ │
// │ │ Symbol Name ↕  │ Value ↕ │ Timestamp        │ Last Updated │ Status   │ │
// │ ├───────────────────────────────────────────────────────────────────────┤ │
// │ │ AnalogDeadband │ 42      │ 14:30:00         │ 1s ago       │ Active   │ │
// │ │ BinaryDebounce │ 150     │ 14:29:58         │ 1s ago       │ Active   │ │
// │ │ CommTimeout    │ 5000    │ 14:29:25         │ 35s ago      │ Stale    │ │
// │ │ SystemTimer    │ 12458   │ 14:30:00         │ 1s ago       │ Active   │ │
// │ └───────────────────────────────────────────────────────────────────────┘ │
// │                                                                           │
// │ Showing 4 of 50 symbols                     [← 1 2 3 4 5 →]  [Export CSV] │
// └───────────────────────────────────────────────────────────────────────────┘