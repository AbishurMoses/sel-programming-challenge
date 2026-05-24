import { DialogTitle, DialogHeader, DialogDescription } from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart";
import { CartesianGrid, Line, XAxis, LineChart } from "recharts";
import { Badge } from "./ui/badge";

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

export default function SymbolDetailView() {
    const quality = "questionable"
    const range = "normal"
    return (
        <>
            <DialogHeader>
                <DialogTitle className="text-xl">AnalogDeadband</DialogTitle>
                <DialogDescription>Analog input deadband threshold</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Current State</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <DetailRow label="Current Value" value={'42 mV'} />
                        <DetailRow label="Status" value={getRangeBadge(range)} />
                        <DetailRow label="Quality" value={
                            <div> {getQualityBadge(quality)}</div>
                        } />
                        <DetailRow label="Last Updated" value="2024-12-03 14:30:00 (2s ago)" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Symbol Info</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <DetailRow label="Type" value="INS (16-bit Integer)" />
                        <DetailRow label="Units" value="mV" />
                        <DetailRow label="Multiplier" value="1.0" />
                        <DetailRow label="Description" value="Analog input deadband threshold" />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Value History — last 5 min</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SymbolDetailViewChart />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Quality Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-y-1 text-sm">
                            <p>Valid Data</p>
                            <p>Process source</p>
                            <p>Not blocked</p>
                            <p>Clock synchronized</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export function SymbolDetailViewChart() {
    const chartData = [
        { time: "14:25", value: 15 },
        { time: "14:27", value: 24 },
        { time: "14:29", value: 38 },
        { time: "14:30", value: 19 },
    ];

    const chartConfig = {
        value: {
            label: "Value",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig;

    return (
        <ChartContainer config={chartConfig} className="h-48 w-full">
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
                    tickMargin={8}
                    interval={0}
                    padding={{ left: 16, right: 16 }}
                />
                <ChartTooltip
                    cursor={false}
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
    );
}
