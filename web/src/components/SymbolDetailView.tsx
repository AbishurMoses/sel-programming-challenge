import { X } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart";
import { CartesianGrid, Line, XAxis, LineChart } from "recharts";

export default function SymbolDetailView() {
    return (
        <Card className="w-full max-w-xl">
            <CardHeader>
                <CardTitle> AnalogDeadband</CardTitle>
                <CardAction>
                    <Button><X /></Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                {/* Symbol basic details */}
                <div className="flex flex-col gap-8">


                    <div className="flex gap-2 flex-col">
                        <div className="flex gap-2 flex-row">
                            <Label className="font-bold">Current Value:</Label>
                            <p>42 mV</p>
                        </div>
                        <div className="flex gap-2 flex-row">
                            <Label className="font-bold">Status:</Label>
                            <p>Normal Range</p>
                        </div>
                        <div className="flex gap-2 flex-row">
                            <Label className="font-bold">Quality:</Label>
                            <p>Good</p>
                        </div>
                        <div className="flex gap-2 flex-row">
                            <Label className="font-bold">Last Updated:</Label>
                            <p>2024-12-03 14:30:00 (2s ago)</p>
                        </div>
                    </div>
                    {/* Value History Chart */}
                    <SymbolDetailViewChart />

                    {/* Additional Details */}
                    <div className="flex gap-2 flex-col">
                        <div className="flex gap-2 flex-row">
                            <Label className="font-bold">Description:</Label>
                            <p>Analog input deadband threshold</p>
                        </div>
                        <div className="flex gap-2 flex-row">
                            <Label className="font-bold">Type:</Label>
                            <p>INS (16-bit Integer)</p>
                        </div>
                        <div className="flex gap-2 flex-row">
                            <Label className="font-bold">Units:</Label>
                            <p>mV</p>
                        </div>
                        <div className="flex gap-2 flex-row">
                            <Label className="font-bold">Multiplier:</Label>
                            <p>1.0</p>
                        </div>
                    </div>
                    {/* Quality Details */}

                    <div className="flex flex-col gap-1">
                        <Label className="font-bold">Quality Details:</Label>
                        <p className="pl-2">Valid Data</p>
                        <p className="pl-2">Process source</p>
                        <p className="pl-2">Not blocked</p>
                        <p className="pl-2">Clock synchronized</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function SymbolDetailViewChart() {
    const chartData = [
        { time: "14.25", value: 15 },
        { time: "14.27", value: 24 },
        { time: "14.29", value: 38 },
        { time: "14.30", value: 19 },
    ]

    const chartConfig = {
        value: {
            label: "Value",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig
    return (
        <Card>
            <CardHeader>
                <div className="flex  justify-center">
                    <CardTitle className="text-lg">Value History - 5 mins</CardTitle>
                </div>
                <CardDescription>
                    Got a lot of changes to make, Maybe i can have the min as the x axis but have the hover on the line show the number and second precision
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={2}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Line
                            dataKey="value"
                            type="linear"
                            stroke="var(--color-value)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}


// ┌─────────────────────────────────────────────────┐
// │ AnalogDeadband                         [Close X]│
// ├─────────────────────────────────────────────────┤
// │                                                 │
// │  Current Value: 42 mV                           │
// │  Status: Normal Range                           │
// │  Quality: Good                                  │
// │  Last Updated: 2024-12-03 14:30:00 (2s ago)     │
// │                                                 │
// │  ┌───────────────────────────────────────────┐  │
// │  │           Value History (5 min)           │  │
// │  │                                           │  │
// │  │   45│          ╭─────╮                    │  │
// │  │     │        ╭─╯     ╰─╮                  │  │
// │  │   40│     ╭──╯          ╰───╮             │  │
// │  │     │  ╭──╯                 ╰──╮          │  │
// │  │   35│──╯                       ╰────      │  │
// │  │     └────────────────────────────────     │  │
// │  │      14:25   14:27   14:29   14:30        │  │
// │  └───────────────────────────────────────────┘  │
// │                                                 │
// │  Description: Analog input deadband threshold   │
// │  Type: INS (16-bit Integer)                     │
// │  Units: mV                                      │
// │  Multiplier: 1.0                                │
// │                                                 │
// │  Quality Details:                               │
// │  Valid data      Process source                 │
// │  Not blocked     Clock synchronized             │
// │                                                 │
// └─────────────────────────────────────────────────┘