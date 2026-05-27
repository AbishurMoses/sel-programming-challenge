import { DialogTitle, DialogHeader, DialogDescription } from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart";
import { CartesianGrid, Line, XAxis, LineChart } from "recharts";
import { Badge } from "./ui/badge";
import { useSymbolPollingContext } from "@/context/SymbolPollingContext";
import type { SymbolHistoryPoint } from "@/types/api";
import { useEffect, useRef } from "react";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-4 text-sm items-center">
            <Label className="font-medium text-muted-foreground">{label}</Label>
            <span className="text-right">{value}</span>
        </div>
    );
}

function getRangeBadge(range: string) {
    switch (range) {
        case "normal":
            return (
                <Badge className="bg-green-500 text-white">
                    Normal Range
                </Badge>
            );
        case "high":
            return (
                <Badge className="bg-yellow-500 text-white">
                    High Range
                </Badge>
            );
        case "low":
            return (
                <Badge className="bg-amber-500 text-white">
                    Low Range
                </Badge>
            );
        case "high-high":
            return (
                <Badge className="bg-red-500 text-white">
                    Very High Range
                </Badge>
            );
        case "low-low":
            return (
                <Badge className="bg-red-500 text-white">
                    Very Low Range
                </Badge>
            );
        default:
            return <Badge>{range}</Badge>;
    }
}

function getQualityBadge(quality: string) {
    switch (quality) {
        case "good":
            return (
                <Badge className="bg-green-500 text-white">
                    Good
                </Badge>
            );
        case "invalid":
            return (
                <Badge className="bg-red-500 text-white">
                    Invalid
                </Badge>
            );
        case "questionable":
            return (
                <Badge className="bg-yellow-500 text-white">
                    Questionable
                </Badge>
            );
        default:
            return <Badge>{quality}</Badge>;
    }
}

export default function SymbolDetailView({ name }: { name: string }) {
    const { symbolHistory, symbolValues, symbols } = useSymbolPollingContext();
    const history = symbolHistory.get(name)
    const value = symbolValues.get(name)
    const symbol = symbols.find(s => s.name === name)
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
                            <div> {getQualityBadge(value?.rawData?.q?.validity as string)}</div>
                        } />
                        <DetailRow label="Last Updated" value={(value?.lastUpdated)?.toLocaleString()} />
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
                        <CardTitle className="text-base">Value History — last 5 min</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SymbolDetailViewChart historyPoints={history?.dataPoints} />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Quality Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[60px] overflow-y-auto pr-2">
                            <div className="grid grid-cols-2 gap-y-1 text-sm">
                                {value?.rawData?.q?.detailQual &&
                                    Object.entries(value.rawData.q.detailQual).map(([flag, active]) => (
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
    // Need to convert the time to milliseconds
    // it will then automatically set it where it needs to be
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

    console.log(chartData.length)

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
