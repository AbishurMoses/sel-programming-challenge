import { DialogTitle, DialogHeader, DialogDescription } from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart";
import { CartesianGrid, Line, XAxis, LineChart } from "recharts";
import { useSymbolPollingContext } from "@/context/SymbolPollingContext";
import type { SymbolHistoryPoint } from "@/types/api";
import { useEffect, useRef } from "react";
import { getQualityBadge, getRangeBadge } from "@/lib/badges";
import { Activity } from "lucide-react";
import { Button } from "./ui/button";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-4 text-sm items-center">
            <Label className="font-medium text-muted-foreground">{label}</Label>
            <span className="text-right">{value}</span>
        </div>
    );
}

export default function SymbolDetailView({ name }: { name: string }) {
    const { symbolHistory, symbolValues, symbols, pollingState, startPolling } = useSymbolPollingContext();
    const history = symbolHistory.get(name)
    const value = symbolValues.get(name)
    const symbol = symbols.find(s => s.name === name)

    if (!value) {
        return (
            <>
                <DialogHeader>
                    <DialogTitle className="text-xl">{symbol?.name}</DialogTitle>
                    <DialogDescription>{symbol?.description}</DialogDescription>
                </DialogHeader>
                <Card>
                    <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                        <Activity className="h-8 w-8" />
                        <p className="text-sm font-medium">No live data yet</p>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            {pollingState.isPolling
                                ? "Waiting for the first poll to land…"
                                : "Start polling to see live values for this symbol."}
                        </p>
                        {!pollingState.isPolling && (
                            <Button onClick={() => startPolling()} className="mt-2">
                                Start Polling
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </>
        );
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle className="text-xl">{symbol?.name}</DialogTitle>
                <DialogDescription>{symbol?.description}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Current State</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <DetailRow label="Current Value" value={history?.dataPoints[history?.dataPoints.length - 1]?.value} />
                        <DetailRow label="Status" value={getRangeBadge(value?.rawData?.range as string)} />
                        <DetailRow label="Quality" value={
                            <div> {getQualityBadge((value?.rawData?.q as { validity?: string } | undefined)?.validity as string)}</div>
                        } />

                        <DetailRow label="Last Updated"
                            value={
                                value?.lastUpdated
                                    ? `${value.lastUpdated.toLocaleString()} (${Math.floor((Date.now() - value.lastUpdated.getTime()) / 1000)}s ago)`
                                    : `${value?.lastUpdated.toLocaleString()}`
                            } />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Symbol Info</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <DetailRow label="Type" value={symbol?.type} />
                        <DetailRow label="Units" value={value?.rawData?.units as string} />
                        <DetailRow label="Multiplier" value={value?.rawData?.multiplier as string} />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Value History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SymbolDetailViewChart historyPoints={history?.dataPoints ?? []} />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Quality Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[60px] overflow-y-auto pr-2">
                            <div className="grid grid-cols-2 gap-y-1 text-sm">
                                {(value?.rawData?.q as { detailQual?: Record<string, boolean> } | undefined)?.detailQual &&
                                    Object.entries((value!.rawData!.q as { detailQual: Record<string, boolean> }).detailQual).map(([flag, active]) => (
                                        <p key={flag} className={active ? "text-destructive" : "text-muted-foreground"}>
                                            {flag}: {String(active)}
                                        </p>
                                    ))
                                }
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export function SymbolDetailViewChart({ historyPoints }: { historyPoints: SymbolHistoryPoint[] }) {
    // X-axis of the graph will adjust to the time.
    // Need to convert the time to milliseconds.
    // it will then automatically set the point where 
    // it needs to be.
    const chartData = historyPoints?.map((point: SymbolHistoryPoint) => ({
        value: point.value,
        time: point.timestamp.getTime(),
    })) ?? [];

    const chartConfig = {
        value: {
            label: "Value",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig;

    const SCROLL_THRESHOLD = 15;
    const PX_PER_POINT = 40;
    const shouldScroll = chartData.length > SCROLL_THRESHOLD;

    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [chartData.length]);

    return (
        <div ref={scrollRef} className="overflow-x-auto">
            <ChartContainer
                config={chartConfig}
                className={shouldScroll ? "h-48" : "h-48 w-full"}
                style={shouldScroll ? { width: chartData.length * PX_PER_POINT } : undefined}
            >
                <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ left: 12, right: 12 }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        padding={{ left: 16, right: 16 }}
                        tickFormatter={(ms: number) =>
                            new Date(ms).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })
                        }
                    />
                    <ChartTooltip
                        cursor={true}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Line
                        dataKey="value"
                        type="monotone"
                        stroke="var(--color-value)"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ChartContainer>
        </div>
    );
}
