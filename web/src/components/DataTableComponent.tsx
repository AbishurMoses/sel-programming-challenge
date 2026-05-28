import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import { Input } from "./ui/input"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import type { PollingState, SymbolValue } from "@/types/api"
import ExportCSV from "./CSVDownload"
import { statusGenerator } from "@/lib/utils"
import { Field, FieldLabel } from "./ui/field"
import { toast } from "sonner"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onRowClick?: (row: TData) => void;
    startedPolling: PollingState;
    startPolling: (on: boolean) => void;
}

export function DataTableComponent<TData, TValue>({
    columns,
    data,
    onRowClick,
    startedPolling,
    startPolling,
}: DataTableProps<TData, TValue>) {

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    )
    const [tableSize, setTableSize] = useState(10)

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        autoResetPageIndex: false,
        initialState: {
            pagination: {
                pageSize: tableSize,
            },
        },
        state: {
            sorting,
            columnFilters,
        },
    })

    useEffect(() => {
        table.setPageSize(tableSize);
    }, [tableSize, table])

    const pageIndex = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;
    const currentRowsCount = table.getRowModel().rows.length;
    const totalRowsCount = table.getFilteredRowModel().rows.length;

    const toResult = pageIndex * pageSize + currentRowsCount;

    return (
        <div>
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="select-rows-per-page" className="whitespace-nowrap">
                            Rows per page
                        </FieldLabel>
                        <Select
                            value={tableSize.toString()}
                            onValueChange={(value: string) => setTableSize(Number(value))}>
                            <SelectTrigger className="w-20" id="select-rows-per-page">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="start">
                                <SelectGroup>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Input
                        placeholder="Search symbols..."
                        value={(table.getColumn("symbolName")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("symbolName")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                </div>
                <div className="flex flex-row items-center gap-2">
                    <Button onClick={() => {
                        startPolling(!startedPolling.isPolling)
                        toast(`${!startedPolling.isPolling ? `Started polling at ${startedPolling.interval / 1000}s intervals` : 'Stopped Polling'} `, {
                            action: {
                                label: "X",
                                onClick: () => { },
                            },
                        })
                    }}>
                        {startedPolling.isPolling ? "Stop Polling" : "Start Polling"}
                    </Button>
                    <p>{startedPolling.interval / 1000}s interval</p>
                </div>
            </div>
            <div>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2 space-x-6 lg:space-x-8">
                <div className="flex  items-center justify-center text-sm font-medium">
                    Showing {toResult} of {totalRowsCount} symbols
                </div>
                <div className="flex items-center space-x-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="hidden size-8 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="hidden size-8 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight />
                        </Button>
                    </div>
                    <ExportCSV data={
                        data.map((row) => {
                            const value = row as Partial<SymbolValue>;
                            const status = statusGenerator(value.lastUpdated ?? new Date(0));
                            return { ...value, status };
                        }) as (Partial<SymbolValue> & { status: string })[]
                    }
                        fileName="symbols.csv" />
                </div>
            </div>
        </div >
    )
}
